import { contextBridge, ipcRenderer } from 'electron'

// 通过 contextBridge 安全地暴露 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 监听计时器状态
  onTimerState: (callback: (data: unknown) => void) => {
    ipcRenderer.on('timer:state', (_event, data) => callback(data))
  },
  // 监听设置更新
  onSettingsUpdate: (callback: (settings: unknown) => void) => {
    ipcRenderer.on('settings:updated', (_event, settings) => callback(settings))
  },
  // 控制命令
  startTimer: () => ipcRenderer.send('timer:start'),
  pauseTimer: () => ipcRenderer.send('timer:pause'),
  resetTimer: () => ipcRenderer.send('timer:reset'),
  skipTimer: () => ipcRenderer.send('timer:skip'),
  // 设置
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: (settings: unknown) => ipcRenderer.send('settings:set', settings),
  setAlwaysOnTop: (flag: boolean) => ipcRenderer.send('window:set-always-on-top', flag),
  // 番茄计数操作
  undoSession: () => ipcRenderer.send('timer:undo-session'),
  setTodaySessions: (count: number) => ipcRenderer.send('settings:set-today-sessions', count),
  // 统计数据
  getHistoryStats: () => ipcRenderer.invoke('history:get-stats'),
  onHistoryUpdated: (callback: () => void) => {
    ipcRenderer.on('history:updated', () => callback())
  },
})
