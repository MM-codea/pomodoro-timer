import { Notification } from 'electron'
import { exec } from 'child_process'
import type { TimerMode } from './shared-types'

const MODE_LABELS: Record<TimerMode, string> = {
  work: '🍅 专注时间结束！',
  shortBreak: '☕ 短休息结束，准备专注吧！',
  longBreak: '🌟 长休息结束，元气满满开始吧！'
}

const MODE_BODIES: Record<TimerMode, string> = {
  work: '太棒了，休息一下吧～',
  shortBreak: '休息完了，继续加油！',
  longBreak: '充分休息完毕，新的番茄周期开始！'
}

export function showTimerNotification(mode: TimerMode) {
  if (!Notification.isSupported()) return

  const n = new Notification({
    title: MODE_LABELS[mode],
    body: MODE_BODIES[mode],
    silent: false,
    urgency: 'normal'
  })

  n.show()
}

// 播放系统提示音（使用简单的 beep 或音频文件）
export function playSoundNotification() {
  try {
    exec('powershell -c "(New-Object Media.SoundPlayer \'C:\\Windows\\Media\\Windows Notify.wav\').PlaySync()"')
  } catch {
    // 静默失败不影响体验
  }
}
