<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue'
import { useTimerStore } from '../stores/timerStore'

const store = useTimerStore()

const modeColor = computed(() => {
  switch (store.mode) {
    case 'work': return '#E04040'
    case 'shortBreak': return '#4A9E6E'
    case 'longBreak': return '#5B7BC0'
  }
})

const cycleDots = computed(() => {
  const total = store.settings.longBreakInterval
  const current = store.isWork ? store.currentSession - 1 : store.currentSession
  const dots: { type: 'done' | 'active' | 'pending' }[] = []

  for (let i = 1; i <= total; i++) {
    if (i <= store.sessionsCompleted && i <= total) {
      dots.push({ type: 'done' })
    } else if (i === current && store.isWork) {
      dots.push({ type: 'active' })
    } else if (i === current && !store.isWork) {
      dots.push({ type: 'active' })
    } else {
      dots.push({ type: 'pending' })
    }
  }
  return dots
})

// 撤销按钮逻辑
const showUndo = ref(false)
let undoTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => store.sessionsCompleted,
  (newVal, oldVal) => {
    if (newVal > oldVal) {
      showUndo.value = true
      if (undoTimer) clearTimeout(undoTimer)
      undoTimer = setTimeout(() => {
        showUndo.value = false
      }, 10000)
    }
  }
)

function handleUndo() {
  store.undoSession()
  showUndo.value = false
  if (undoTimer) clearTimeout(undoTimer)
}

onUnmounted(() => {
  if (undoTimer) clearTimeout(undoTimer)
})
</script>

<template>
  <div class="session-info">
    <!-- 撤销提示 -->
    <transition name="undo-fade">
      <div v-if="showUndo" class="undo-bar">
        <span class="undo-text">已记录 1 个番茄</span>
        <n-button size="tiny" quaternary type="warning" @click="handleUndo">
          撤销
        </n-button>
      </div>
    </transition>

    <!-- 今日番茄数 -->
    <div class="today-count">
      <span class="today-label">今日</span>
      <span class="today-number">{{ store.sessionsCompleted }}</span>
      <span class="today-unit">个番茄</span>
    </div>

    <!-- 周期进度 — 自定义圆点 -->
    <div class="cycle-progress">
      <div
        v-for="(dot, idx) in cycleDots"
        :key="idx"
        class="cycle-dot"
        :class="`dot-${dot.type}`"
        :style="dot.type !== 'pending' ? { '--dot-color': modeColor } : {}"
      />
    </div>

    <!-- 下一阶段提示 -->
    <div class="next-phase" :style="{ color: modeColor }">
      {{ store.nextModeLabel }}
    </div>
  </div>
</template>

<style scoped>
.session-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
}

/* 撤销栏 */
.undo-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 6px 14px;
  box-shadow: var(--shadow-sm);
}

.undo-text {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

.undo-fade-enter-active,
.undo-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.undo-fade-enter-from,
.undo-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* 今日番茄数 */
.today-count {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.today-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-tertiary);
  letter-spacing: 1px;
}

.today-number {
  font-size: 24px;
  font-weight: 800;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.today-unit {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

/* 周期进度 */
.cycle-progress {
  display: flex;
  gap: 8px;
  align-items: center;
}

.cycle-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.dot-done {
  background: var(--dot-color, #E04040);
  box-shadow: 0 0 6px var(--dot-color, #E04040);
}

.dot-active {
  background: transparent;
  border: 2px solid var(--dot-color, #E04040);
  box-shadow: 0 0 8px rgba(224, 64, 64, 0.3);
  transform: scale(1.3);
}

.dot-pending {
  background: var(--border-color);
}

/* 下一阶段提示 */
.next-phase {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 3px;
  opacity: 0.8;
}
</style>
