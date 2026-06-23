// 渲染进程 IPC 调用封装
// 提供类型安全的 Electron IPC 接口

import type { TimerData, TimerSettings, HistoryStats } from '../../electron/shared-types'

export function useIpc() {
  const api = window.electronAPI

  return {
    // 监听计时器状态
    onTimerState(callback: (data: TimerData) => void) {
      api.onTimerState(callback)
    },
    // 监听设置更新
    onSettingsUpdate(callback: (settings: TimerSettings) => void) {
      api.onSettingsUpdate(callback)
    },
    // 控制命令
    startTimer() { api.startTimer() },
    pauseTimer() { api.pauseTimer() },
    resetTimer() { api.resetTimer() },
    skipTimer() { api.skipTimer() },
    // 设置
    async getSettings(): Promise<TimerSettings> {
      return api.getSettings()
    },
    setSettings(settings: Partial<TimerSettings>) {
      // 浅拷贝剔除 Vue 响应式 Proxy（所有字段均为基本类型）
      api.setSettings({ ...settings })
    },
    setAlwaysOnTop(flag: boolean) {
      api.setAlwaysOnTop(flag)
    },
    // 番茄计数操作
    undoSession() { api.undoSession() },
    setTodaySessions(count: number) {
      api.setTodaySessions(count)
    },
    // 统计数据
    async getHistoryStats(): Promise<HistoryStats> {
      return api.getHistoryStats()
    },
    onHistoryUpdated(callback: () => void) {
      api.onHistoryUpdated(callback)
    }
  }
}
