import { Tray, Menu, nativeImage } from 'electron'
import type { TimerMode, TimerState } from './shared-types'

const MODE_TOOLTIP: Record<TimerMode, string> = {
  work: '专注',
  shortBreak: '短休息',
  longBreak: '长休息'
}

const STATE_LABEL: Record<TimerState, string> = {
  idle: '准备就绪',
  running: '进行中',
  paused: '已暂停'
}

export interface TrayCallbacks {
  onShow: () => void
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onQuit: () => void
}

export class TrayManager {
  private tray: Tray | null = null
  private callbacks: TrayCallbacks | null = null
  private timerRunning = false
  private tooltipText = '番茄钟'

  init(callbacks: TrayCallbacks) {
    this.callbacks = callbacks

    // 创建托盘图标（简单 16x16 的西红柿图标用 nativeImage 创建）
    const icon = this.createTrayIcon()
    this.tray = new Tray(icon)
    this.tray.setToolTip('番茄钟 - 准备就绪')
    this.buildMenu()
  }

  updateTooltip(mode: TimerMode, state: TimerState, timeRemaining: number) {
    const mm = Math.floor(timeRemaining / 60)
    const ss = timeRemaining % 60
    const timeStr = `${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`
    this.tooltipText = `🍅 ${MODE_TOOLTIP[mode]} ${timeStr} - ${STATE_LABEL[state]}`
    if (this.tray) {
      this.tray.setToolTip(this.tooltipText)
    }
  }

  setTimerRunning(running: boolean) {
    this.timerRunning = running
    this.buildMenu()
  }

  destroy() {
    if (this.tray) {
      this.tray.destroy()
      this.tray = null
    }
  }

  private buildMenu() {
    if (!this.tray || !this.callbacks) return

    const contextMenu = Menu.buildFromTemplate([
      {
        label: '显示主窗口',
        click: () => this.callbacks!.onShow()
      },
      { type: 'separator' },
      {
        label: this.timerRunning ? '暂停' : '开始',
        click: () => {
          if (this.timerRunning) {
            this.callbacks!.onPause()
          } else {
            this.callbacks!.onStart()
          }
        }
      },
      {
        label: '重置',
        click: () => this.callbacks!.onReset()
      },
      { type: 'separator' },
      {
        label: '退出',
        click: () => this.callbacks!.onQuit()
      }
    ])

    this.tray.setContextMenu(contextMenu)

    // 单击托盘图标显示/隐藏窗口
    this.tray.on('click', () => {
      this.callbacks!.onShow()
    })
  }

  private createTrayIcon() {
    // 使用 nativeImage 创建简单的彩色图标
    // 在 Windows 上托盘图标通常是 16x16
    const size = 16
    const canvas = Buffer.alloc(size * size * 4)

    // 绘制简单西红柿图标（红色圆形 + 绿色叶子）
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4
        const cx = size / 2, cy = size / 2
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)

        if (dist < size / 2 - 1) {
          // 西红柿主体 - 红色
          canvas[idx] = 0xEE     // R
          canvas[idx + 1] = 0x53  // G
          canvas[idx + 2] = 0x53  // B
          canvas[idx + 3] = 0xFF  // A
        } else if (y < 4 && Math.abs(x - cx) < 3 && dist < size / 2) {
          // 叶子 - 绿色（顶部）
          canvas[idx] = 0x66
          canvas[idx + 1] = 0xBB
          canvas[idx + 2] = 0x6A
          canvas[idx + 3] = 0xFF
        } else {
          // 透明
          canvas[idx] = 0
          canvas[idx + 1] = 0
          canvas[idx + 2] = 0
          canvas[idx + 3] = 0
        }
      }
    }

    return nativeImage.createFromBuffer(canvas, { width: size, height: size })
  }
}
