// 主进程与渲染进程共享的类型定义

export type TimerMode = 'work' | 'shortBreak' | 'longBreak'
export type TimerState = 'idle' | 'running' | 'paused'

export interface TimerData {
  mode: TimerMode
  state: TimerState
  timeRemaining: number   // 剩余秒数
  totalTime: number       // 当前阶段总秒数
  sessionsCompleted: number // 今日完成番茄数
  currentSession: number  // 当前是第几个番茄 (1-based)
}

export interface TimerSettings {
  workDuration: number         // 分钟
  shortBreakDuration: number   // 分钟
  longBreakDuration: number    // 分钟
  longBreakInterval: number    // 几个番茄后长休息
  soundEnabled: boolean
  alwaysOnTop: boolean
}

export const DEFAULT_SETTINGS: TimerSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  soundEnabled: true,
  alwaysOnTop: false
}

// --- 历史数据统计 ---

export interface SessionRecord {
  date: string       // '2026-06-23'
  timestamp: number  // 完成时间 Unix ms
  focusMinutes: number // 本次专注分钟数
}

export interface DailyStat {
  date: string
  sessions: number
  totalFocusMinutes: number
}

export interface WeeklyStat {
  weekLabel: string   // '第25周' 或 ISO 周号
  sessions: number
  totalFocusMinutes: number
}

export interface HistoryStats {
  totalSessions: number
  totalFocusHours: number     // 累计专注小时数（保留1位小数）
  currentStreak: number       // 连续有番茄的天数
  monthlyAvg: number          // 本月日均番茄数
  dailyStats: DailyStat[]
  weeklyStats: WeeklyStat[]
}
