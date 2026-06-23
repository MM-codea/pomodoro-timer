import type { TimerMode, TimerState, TimerData, TimerSettings } from './shared-types'

export type StateChangeCallback = (data: TimerData) => void
export type CompleteCallback = (mode: TimerMode) => void

export class PomodoroTimer {
  private mode: TimerMode = 'work'
  private state: TimerState = 'idle'
  private timeRemaining: number
  private totalTime: number
  private sessionsCompleted = 0
  private currentSession = 1
  private intervalId: ReturnType<typeof setInterval> | null = null
  private settings: TimerSettings

  private onStateChange: StateChangeCallback | null = null
  private onComplete: CompleteCallback | null = null

  constructor(settings: TimerSettings) {
    this.settings = settings
    this.totalTime = settings.workDuration * 60
    this.timeRemaining = this.totalTime
  }

  // --- 回调设置 ---
  setOnStateChange(cb: StateChangeCallback) { this.onStateChange = cb }
  setOnComplete(cb: CompleteCallback) { this.onComplete = cb }

  // --- 获取当前数据 ---
  getData(): TimerData {
    return {
      mode: this.mode,
      state: this.state,
      timeRemaining: this.timeRemaining,
      totalTime: this.totalTime,
      sessionsCompleted: this.sessionsCompleted,
      currentSession: this.currentSession
    }
  }

  // --- 更新设置 ---
  updateSettings(settings: TimerSettings) {
    this.settings = settings
    // 如果处于 idle 状态，重置当前阶段时长
    if (this.state === 'idle') {
      this.resetTimerForCurrentMode()
      this.emitState()
    }
  }

  // --- 控制方法 ---
  start() {
    if (this.state === 'running') return

    if (this.state === 'idle') {
      // 首次 start 或 reset 后 start
      this.resetTimerForCurrentMode()
    }
    // state === 'paused': 从中断处继续

    this.state = 'running'
    this.emitState()

    this.intervalId = setInterval(() => {
      this.tick()
    }, 1000)
  }

  pause() {
    if (this.state !== 'running') return
    this.state = 'paused'
    this.stopInterval()
    this.emitState()
  }

  reset() {
    this.stopInterval()
    this.state = 'idle'
    this.resetTimerForCurrentMode()
    this.emitState()
  }

  skip() {
    this.stopInterval()
    this.onTimerComplete()
  }

  // --- 私有方法 ---
  private tick() {
    if (this.timeRemaining <= 0) {
      this.onTimerComplete()
      return
    }
    this.timeRemaining--
    this.emitState()
  }

  private onTimerComplete() {
    this.stopInterval()
    const completedMode = this.mode

    if (this.mode === 'work') {
      this.sessionsCompleted++

      if (this.currentSession >= this.settings.longBreakInterval) {
        this.mode = 'longBreak'
        this.currentSession = 1
      } else {
        this.mode = 'shortBreak'
      }
    } else {
      this.currentSession++
      this.mode = 'work'
    }

    this.state = 'idle'
    this.resetTimerForCurrentMode()
    this.emitState()

    // 触发完成回调（通知+声音）
    if (this.onComplete) {
      this.onComplete(completedMode)
    }
  }

  private resetTimerForCurrentMode() {
    switch (this.mode) {
      case 'work':
        this.totalTime = this.settings.workDuration * 60
        break
      case 'shortBreak':
        this.totalTime = this.settings.shortBreakDuration * 60
        break
      case 'longBreak':
        this.totalTime = this.settings.longBreakDuration * 60
        break
    }
    this.timeRemaining = this.totalTime
  }

  private stopInterval() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  private emitState() {
    if (this.onStateChange) {
      this.onStateChange(this.getData())
    }
  }

  getSessionsCompleted(): number {
    return this.sessionsCompleted
  }

  setSessionsCompleted(count: number) {
    this.sessionsCompleted = count
  }
}
