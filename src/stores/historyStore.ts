import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { HistoryStats, DailyStat, WeeklyStat } from '../../electron/shared-types'
import { useIpc } from '../composables/useIpc'

export const useHistoryStore = defineStore('history', () => {
  const ipc = useIpc()

  const stats = ref<HistoryStats | null>(null)
  const loading = ref(false)
  const initialized = ref(false)

  const isEmpty = computed(() => stats.value === null || stats.value.totalSessions === 0)

  const dailyStats = computed<DailyStat[]>(() => stats.value?.dailyStats || [])
  const weeklyStats = computed<WeeklyStat[]>(() => stats.value?.weeklyStats || [])

  async function fetchStats() {
    loading.value = true
    try {
      stats.value = await ipc.getHistoryStats()
    } catch {
      stats.value = null
    } finally {
      loading.value = false
    }
  }

  async function init() {
    if (initialized.value) return
    initialized.value = true
    await fetchStats()
    // 监听主进程推送的更新通知
    ipc.onHistoryUpdated(() => {
      fetchStats()
    })
  }

  return {
    stats, loading, initialized, isEmpty,
    dailyStats, weeklyStats,
    init, fetchStats
  }
})
