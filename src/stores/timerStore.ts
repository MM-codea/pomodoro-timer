import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TimerData, TimerSettings } from '../../electron/shared-types'
import { DEFAULT_SETTINGS } from '../../electron/shared-types'
import { useIpc } from '../composables/useIpc'

export const useTimerStore = defineStore('timer', () => {
  // --- 状态 ---
  const mode = ref<TimerData['mode']>('work')
  const state = ref<TimerData['state']>('idle')
  const timeRemaining = ref(1500)  // 默认 25 分钟
  const totalTime = ref(1500)
  const sessionsCompleted = ref(0)
  const currentSession = ref(1)
  const settings = ref<TimerSettings>({ ...DEFAULT_SETTINGS })
  const initialized = ref(false)

  const ipc = useIpc()

  // --- 计算属性 ---
  const isRunning = computed(() => state.value === 'running')
  const isPaused = computed(() => state.value === 'paused')
  const isIdle = computed(() => state.value === 'idle')
  const isWork = computed(() => mode.value === 'work')
  const progress = computed(() => {
    if (totalTime.value === 0) return 0
    return (totalTime.value - timeRemaining.value) / totalTime.value
  })

  const minutes = computed(() => Math.floor(timeRemaining.value / 60))
  const seconds = computed(() => timeRemaining.value % 60)
  const timeDisplay = computed(() => {
    const mm = minutes.value.toString().padStart(2, '0')
    const ss = seconds.value.toString().padStart(2, '0')
    return `${mm}:${ss}`
  })

  const modeLabel = computed(() => {
    switch (mode.value) {
      case 'work': return '专注'
      case 'shortBreak': return '短休息'
      case 'longBreak': return '长休息'
    }
  })

  const nextModeLabel = computed(() => {
    if (mode.value === 'work') {
      return currentSession.value >= settings.value.longBreakInterval ? '长休息' : '短休息'
    }
    return '专注'
  })

  // --- 动作 ---
  function applyTimerData(data: TimerData) {
    mode.value = data.mode
    state.value = data.state
    timeRemaining.value = data.timeRemaining
    totalTime.value = data.totalTime
    sessionsCompleted.value = data.sessionsCompleted
    currentSession.value = data.currentSession
  }

  function applySettings(s: TimerSettings) {
    settings.value = { ...s }
  }

  async function init() {
    if (initialized.value) return
    initialized.value = true

    // 从主进程加载设置
    try {
      const s = await ipc.getSettings()
      settings.value = { ...s }
    } catch {
      // 使用默认值
    }

    // 监听计时器状态推送
    ipc.onTimerState((data: TimerData) => {
      applyTimerData(data)
    })

    // 监听设置更新
    ipc.onSettingsUpdate((s: TimerSettings) => {
      applySettings(s)
    })
  }

  function start() { ipc.startTimer() }
  function pause() { ipc.pauseTimer() }
  function reset() { ipc.resetTimer() }
  function skip() { ipc.skipTimer() }

  function updateSettings(partial: Partial<TimerSettings>) {
    // 乐观更新
    settings.value = { ...settings.value, ...partial }
    ipc.setSettings(partial)
  }

  function undoSession() { ipc.undoSession() }
  function setTodaySessions(count: number) { ipc.setTodaySessions(count) }

  function toggleAlwaysOnTop() {
    const newVal = !settings.value.alwaysOnTop
    settings.value.alwaysOnTop = newVal
    ipc.setAlwaysOnTop(newVal)
  }

  return {
    // 状态
    mode, state, timeRemaining, totalTime,
    sessionsCompleted, currentSession, settings, initialized,
    // 计算属性
    isRunning, isPaused, isIdle, isWork,
    progress, minutes, seconds, timeDisplay,
    modeLabel, nextModeLabel,
    // 动作
    init, start, pause, reset, skip, updateSettings, toggleAlwaysOnTop,
    undoSession, setTodaySessions
  }
})
