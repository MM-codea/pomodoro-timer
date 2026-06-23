import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { PomodoroTimer } from './timer-engine'
import { TrayManager } from './tray-manager'
import { SettingsStore } from './settings-store'
import { showTimerNotification, playSoundNotification } from './notification'
import type { TimerMode, TimerSettings } from './shared-types'

// 修复 Windows GPU 缓存权限问题
if (process.platform === 'win32') {
  app.disableHardwareAcceleration()
  app.commandLine.appendSwitch('disable-gpu-sandbox')
}

let mainWindow: BrowserWindow | null = null
let timer: PomodoroTimer | null = null
let trayManager: TrayManager | null = null
let settingsStore: SettingsStore | null = null
let isQuitting = false
const isDev = !app.isPackaged

function sendToRenderer(channel: string, ...args: unknown[]) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, ...args)
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 440,
    height: 620,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    center: true,
    title: '番茄钟',
    show: false,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  // 去掉默认菜单
  mainWindow.setMenuBarVisibility(false)

  // 加载页面
  if (isDev) {
    // vite-plugin-electron 会自动注入 VITE_DEV_SERVER_URL 环境变量
    const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173'
    mainWindow.loadURL(devUrl)
    // 开发模式下打开 DevTools 方便调试
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  // 关闭窗口时隐藏到托盘而非退出
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault()
      mainWindow?.hide()
    }
  })

  return mainWindow
}

function initTimer() {
  const settings = settingsStore!.getSettings()
  timer = new PomodoroTimer(settings)

  // 恢复今日番茄数
  const todaySessions = settingsStore!.getTodaySessions()
  timer.setSessionsCompleted(todaySessions)

  // 状态变化 → 推送渲染进程 + 更新托盘 tooltip
  timer.setOnStateChange((data) => {
    sendToRenderer('timer:state', data)
    if (trayManager) {
      trayManager.updateTooltip(data.mode, data.state, data.timeRemaining)
      trayManager.setTimerRunning(data.state === 'running')
    }
  })

  // 计时完成 → 通知 + 提示音
  timer.setOnComplete((mode: TimerMode) => {
    showTimerNotification(mode)
    if (settings.soundEnabled) {
      playSoundNotification()
    }
    if (mode === 'work') {
      const newCount = settingsStore!.incrementTodaySessions()
      if (timer) { timer.setSessionsCompleted(newCount) }
      settingsStore!.addSession(settingsStore!.getDateKey(), settings.workDuration)
      sendToRenderer('timer:state', timer!.getData())
      sendToRenderer('history:updated')
    }
  })

  // 推送初始状态
  sendToRenderer('timer:state', timer.getData())
}

function initTray() {
  trayManager = new TrayManager()
  trayManager.init({
    onShow: () => {
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.focus()
        } else {
          mainWindow.show()
          mainWindow.center()
        }
      }
    },
    onStart: () => timer?.start(),
    onPause: () => timer?.pause(),
    onReset: () => timer?.reset(),
    onQuit: () => {
      isQuitting = true
      trayManager?.destroy()
      app.quit()
    }
  })
}

function registerIpcHandlers() {
  // 计时器控制
  ipcMain.on('timer:start', () => timer?.start())
  ipcMain.on('timer:pause', () => timer?.pause())
  ipcMain.on('timer:reset', () => timer?.reset())
  ipcMain.on('timer:skip', () => timer?.skip())

  // 设置
  ipcMain.handle('settings:get', () => {
    return settingsStore?.getSettings()
  })

  ipcMain.on('settings:set', (_event, partial: Partial<TimerSettings>) => {
    const updated = settingsStore?.updateSettings(partial)
    if (updated && timer) { timer.updateSettings(updated) }
    sendToRenderer('settings:updated', updated)
  })

  // 撤销番茄计数
  ipcMain.on('timer:undo-session', () => {
    if (timer && settingsStore) {
      timer.setSessionsCompleted(settingsStore.decrementTodaySessions())
      sendToRenderer('timer:state', timer.getData())
    }
  })

  // 手动设置今日番茄数
  ipcMain.on('settings:set-today-sessions', (_event, count: number) => {
    if (settingsStore && timer) {
      timer.setSessionsCompleted(settingsStore.setTodaySessions(count))
      sendToRenderer('timer:state', timer.getData())
    }
  })

  // 获取统计数据
  ipcMain.handle('history:get-stats', () => {
    return settingsStore?.computeStats()
  })

  // 窗口置顶
  ipcMain.on('window:set-always-on-top', (_event, flag: boolean) => {
    if (mainWindow) {
      mainWindow.setAlwaysOnTop(flag)
    }
    // 同步到 settings
    const updated = settingsStore?.updateSettings({ alwaysOnTop: flag })
    sendToRenderer('settings:updated', updated)
  })
}

// --- App 生命周期 ---
app.whenReady().then(() => {
  settingsStore = new SettingsStore()
  createWindow()
  initTimer()
  initTray()
  registerIpcHandlers()

  // 应用初始设置
  const settings = settingsStore.getSettings()
  if (settings.alwaysOnTop && mainWindow) {
    mainWindow.setAlwaysOnTop(true)
  }
})

app.on('window-all-closed', () => {
  // Windows 上不退出，由托盘管理
})

app.on('activate', () => {
  if (mainWindow) {
    mainWindow.show()
  }
})

// 防止多实例
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.show()
      mainWindow.focus()
    }
  })
}
