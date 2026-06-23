import Store from 'electron-store'
import { DEFAULT_SETTINGS, type TimerSettings, type SessionRecord, type HistoryStats } from './shared-types'

interface StoreSchema {
  settings: TimerSettings
  todayDate: string
  todaySessions: number
  history: SessionRecord[]
}

export class SettingsStore {
  private store: Store<StoreSchema>

  constructor() {
    this.store = new Store<StoreSchema>({
      defaults: {
        settings: DEFAULT_SETTINGS,
        todayDate: '',
        todaySessions: 0,
        history: []
      }
    })
  }

  getSettings(): TimerSettings {
    return this.store.get('settings')
  }

  updateSettings(partial: Partial<TimerSettings>): TimerSettings {
    const current = this.getSettings()
    const updated = { ...current, ...partial }
    this.store.set('settings', updated)
    return updated
  }

  // --- 今日番茄计数 ---
  getTodaySessions(): number {
    this.ensureToday()
    return this.store.get('todaySessions')
  }

  incrementTodaySessions(): number {
    this.ensureToday()
    const count = this.store.get('todaySessions') + 1
    this.store.set('todaySessions', count)
    return count
  }

  decrementTodaySessions(): number {
    this.ensureToday()
    const count = Math.max(0, this.store.get('todaySessions') - 1)
    this.store.set('todaySessions', count)
    return count
  }

  setTodaySessions(count: number): number {
    this.ensureToday()
    const clamped = Math.max(0, Math.min(999, count))
    this.store.set('todaySessions', clamped)
    return clamped
  }

  private ensureToday() {
    const today = this.getDateKey()
    if (this.store.get('todayDate') !== today) {
      this.store.set('todayDate', today)
      this.store.set('todaySessions', 0)
    }
  }

  // --- 历史记录 ---
  addSession(date: string, focusMinutes: number) {
    const history = this.store.get('history')
    history.push({ date, timestamp: Date.now(), focusMinutes })
    const cutoff = Date.now() - 365 * 24 * 60 * 60 * 1000
    this.store.set('history', history.filter(r => r.timestamp > cutoff))
  }

  computeStats(): HistoryStats {
    const allRecords = this.store.get('history')
    const now = new Date()
    const today = this.getDateKey()

    // 按天聚合
    const dayMap = new Map<string, { sessions: number; focusMinutes: number }>()
    for (const r of allRecords) {
      const existing = dayMap.get(r.date)
      if (existing) {
        existing.sessions++
        existing.focusMinutes += r.focusMinutes
      } else {
        dayMap.set(r.date, { sessions: 1, focusMinutes: r.focusMinutes })
      }
    }

    // 总统计
    const totalSessions = allRecords.length
    const totalFocusMinutes = allRecords.reduce((s, r) => s + r.focusMinutes, 0)

    // 连续天数
    let currentStreak = 0
    const d = new Date()
    while (true) {
      const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
      if (dayMap.has(key)) {
        currentStreak++
        d.setDate(d.getDate() - 1)
      } else {
        // 今天还没有记录不中断 streak
        if (key === today && currentStreak === 0) {
          d.setDate(d.getDate() - 1)
          continue
        }
        break
      }
    }

    // 本月日均
    const monthStart = `${now.getFullYear()}-${now.getMonth() + 1}-`
    const monthDays: number[] = []
    for (const [date, data] of dayMap) {
      if (date.startsWith(monthStart)) {
        monthDays.push(data.sessions)
      }
    }
    const daysInMonthSoFar = now.getDate()
    const monthlyAvg = daysInMonthSoFar > 0
      ? Math.round((monthDays.reduce((a, b) => a + b, 0) / daysInMonthSoFar) * 10) / 10
      : 0

    // 每日统计（最近30天）
    const dailyStats = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
      const data = dayMap.get(key)
      dailyStats.push({
        date: key,
        sessions: data?.sessions || 0,
        totalFocusMinutes: data?.focusMinutes || 0
      })
    }

    // 每周统计（最近8周）
    const weeklyStats = []
    for (let w = 7; w >= 0; w--) {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1 - w * 7) // Monday
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6) // Sunday

      let sessions = 0
      let focusMinutes = 0
      for (const [date, data] of dayMap) {
        const parts = date.split('-')
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
        if (d >= weekStart && d <= weekEnd) {
          sessions += data.sessions
          focusMinutes += data.focusMinutes
        }
      }

      // ISO 周号
      const weekNum = this.getWeekNumber(weekStart)
      weeklyStats.push({
        weekLabel: `第${weekNum}周`,
        sessions,
        totalFocusMinutes: focusMinutes
      })
    }

    return {
      totalSessions,
      totalFocusHours: Math.round(totalFocusMinutes / 6) / 10, // 保留1位小数
      currentStreak,
      monthlyAvg,
      dailyStats,
      weeklyStats
    }
  }

  // --- 工具 ---
  getDateKey(d: Date = new Date()): string {
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
  }

  private getWeekNumber(d: Date): number {
    const start = new Date(d.getFullYear(), 0, 1)
    const diff = d.getTime() - start.getTime()
    const oneWeek = 604800000
    return Math.ceil((diff / oneWeek + start.getDay() + 1) / 7)
  }
}
