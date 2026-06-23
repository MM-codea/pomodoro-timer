<script setup lang="ts">
import { onMounted, computed, ref, defineAsyncComponent } from 'vue'
import { darkTheme, lightTheme } from 'naive-ui'
import { TimerOutline, BarChartOutline } from '@vicons/ionicons5'
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

      <!-- 标题栏 -->
      <div class="title-bar">
        <span class="app-title">Pomodoro</span>
      </div>

      <!-- 内容区 -->
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

      <!-- 底部 Tab 栏 -->
      <div class="tab-bar">
        <button
          class="tab-btn"
          :class="{ active: currentTab === 'timer' }"
          @click="currentTab = 'timer'"
        >
          <n-icon :component="TimerOutline" size="20" />
          <span>计时</span>
        </button>
        <button
          class="tab-btn"
          :class="{ active: currentTab === 'stats' }"
          @click="currentTab = 'stats'"
        >
          <n-icon :component="BarChartOutline" size="20" />
          <span>统计</span>
        </button>
        <div class="tab-indicator" :class="{ right: currentTab === 'stats' }" />
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
  transition: background 0.8s ease-in-out;
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
  font-size: 12px;
  font-weight: 700;
  color: var(--text-tertiary);
  letter-spacing: 3px;
  text-transform: uppercase;
  user-select: none;
}

/* 内容区 */
.content-area {
  flex: 1;
}

.timer-view,
.stats-view {
  height: calc(100vh - 40px - 52px);
}

/* 计时器页面 */
.timer-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 32px 28px;
  overflow: hidden;
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
  position: relative;
  display: flex;
  border-top: 1px solid var(--border-color);
  background: var(--bg-card);
  flex-shrink: 0;
  height: 52px;
}

.tab-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 6px 0;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.25s ease;
  position: relative;
  z-index: 1;
}

.tab-btn:hover {
  color: var(--text-secondary);
}

.tab-btn.active {
  color: var(--color-work);
}

/* 滑动指示器 */
.tab-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 2px;
  background: var(--color-work);
  border-radius: 0 0 2px 2px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-indicator.right {
  transform: translateX(100%);
}
</style>
