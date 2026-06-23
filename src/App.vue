<script setup lang="ts">
import { onMounted, computed, ref, defineAsyncComponent } from 'vue'
import { darkTheme, lightTheme } from 'naive-ui'
import TimerCircle from './components/TimerCircle.vue'
import TimerControls from './components/TimerControls.vue'
import SessionInfo from './components/SessionInfo.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import { useTimerStore } from './stores/timerStore'

const StatsView = defineAsyncComponent(() => import('./components/StatsView.vue'))

const store = useTimerStore()
const currentTab = ref<'timer' | 'stats'>('timer')

const naiveTheme = computed(() => {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return darkTheme
  }
  return lightTheme
})

const bgColor = computed(() => {
  if (currentTab.value === 'stats') return 'var(--bg-primary)'
  switch (store.mode) {
    case 'work': return 'var(--color-work-dim)'
    case 'shortBreak': return 'var(--color-short-break-dim)'
    case 'longBreak': return 'var(--color-long-break-dim)'
    default: return 'var(--bg-primary)'
  }
})

onMounted(() => {
  store.init()
})
</script>

<template>
  <n-config-provider :theme="naiveTheme">
    <div class="app-shell" :style="{ '--bg-mode': bgColor }">
      <SettingsPanel />
      <div class="title-bar">
        <span class="app-title">🍅 番茄钟</span>
      </div>

      <div class="content-area">
        <div v-if="currentTab === 'timer'" class="timer-view">
          <div class="timer-section">
            <TimerCircle />
          </div>
          <TimerControls />
          <SessionInfo />
        </div>
        <div v-if="currentTab === 'stats'" class="stats-view">
          <StatsView />
        </div>
      </div>

      <div class="tab-bar">
        <button :class="{ active: currentTab === 'timer' }" @click="currentTab = 'timer'">
          ⏱ 计时
        </button>
        <button :class="{ active: currentTab === 'stats' }" @click="currentTab = 'stats'">
          📊 统计
        </button>
      </div>
    </div>
  </n-config-provider>
</template>

<style scoped>
.app-shell {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-mode);
  transition: background 0.6s ease;
}

.title-bar {
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  flex-shrink: 0;
  -webkit-app-region: drag;
}

.app-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-tertiary);
  letter-spacing: 1px;
  user-select: none;
}

/* 内容区 */
.content-area {
  flex: 1;
}

/* 视图共用：用 calc 计算精确高度 = 窗口高度 - 标题栏 - Tab栏 */
.timer-view,
.stats-view {
  height: calc(100vh - 40px - 48px);
}

/* 计时器页面 */
.timer-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 32px;
  overflow: hidden;
}

.timer-section {
  margin-bottom: 0;
}

/* 统计页面 */
.stats-view {
  overflow-y: auto;
  overflow-x: hidden;
}

.stats-view::-webkit-scrollbar {
  width: 4px;
}
.stats-view::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 2px;
}

/* 底部 Tab 栏 */
.tab-bar {
  display: flex;
  border-top: 1px solid var(--border-color);
  background: var(--bg-card);
  flex-shrink: 0;
}

.tab-bar button {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 0 6px;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-bar button:hover {
  color: var(--text-secondary);
  background: var(--bg-hover);
}

.tab-bar button.active {
  color: #EF4444;
}
</style>
