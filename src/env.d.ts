// TypeScript 类型声明

import type { TimerData, TimerSettings, HistoryStats } from '../electron/shared-types'

declare global {
  interface Window {
    electronAPI: {
      onTimerState: (callback: (data: TimerData) => void) => void
      startTimer: () => void
      pauseTimer: () => void
      resetTimer: () => void
      skipTimer: () => void
      getSettings: () => Promise<TimerSettings>
      setSettings: (settings: Partial<TimerSettings>) => void
      setAlwaysOnTop: (flag: boolean) => void
      undoSession: () => void
      setTodaySessions: (count: number) => void
      getHistoryStats: () => Promise<HistoryStats>
      onHistoryUpdated: (callback: () => void) => void
      onSettingsUpdate: (callback: (settings: TimerSettings) => void) => void
    }
  }
}

export {}
