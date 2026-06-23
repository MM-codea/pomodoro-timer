<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue'
import { useTimerStore } from '../stores/timerStore'

const store = useTimerStore()

const tomatoIcons = computed(() => {
  const total = store.settings.longBreakInterval
  const current = store.isWork ? store.currentSession - 1 : store.currentSession
  const icons: string[] = []

  for (let i = 1; i <= total; i++) {
    if (i <= store.sessionsCompleted && i <= total) {
      icons.push('🍅')
    } else if (i === current && store.isWork) {
      icons.push('🔴')
    } else if (i === current && !store.isWork) {
      icons.push('☕')
    } else {
      icons.push('⭕')
    }
  }
  return icons
})

const modeColor = computed(() => {
  switch (store.mode) {
    case 'work': return '#EF4444'
    case 'shortBreak': return '#22C55E'
    case 'longBreak': return '#3B82F6'
  }
})

// 撤销按钮逻辑
const showUndo = ref(false)
let undoTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => store.sessionsCompleted,
  (newVal, oldVal) => {
    // 仅在番茄数增加时（新完成了一个番茄）显示撤销
    if (newVal > oldVal) {
      showUndo.value = true
      if (undoTimer) clearTimeout(undoTimer)
      undoTimer = setTimeout(() => {
        showUndo.value = false
      }, 10000) // 10 秒后自动消失
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
    <!-- 撤销提示（番茄完成后短暂出现） -->
    <transition name="undo-fade">
      <div v-if="showUndo" class="undo-bar">
        <span class="undo-text">🍅 +1 已记录</span>
        <n-button
          size="tiny"
          quaternary
          type="warning"
          @click="handleUndo"
        >
          撤销
        </n-button>
      </div>
    </transition>

    <!-- 今日番茄数 -->
    <div class="today-count">
      <span class="today-label">今日</span>
      <span class="today-icons">{{ '🍅'.repeat(Math.min(store.sessionsCompleted, 12)) }}</span>
      <span class="today-number">{{ store.sessionsCompleted }}</span>
    </div>

    <!-- 周期进度 -->
    <div class="cycle-progress">
      <span
        v-for="(icon, idx) in tomatoIcons"
        :key="idx"
        class="cycle-dot"
      >{{ icon }}</span>
    </div>

    <!-- 模式标签 -->
    <n-tag :bordered="false" size="small" class="mode-tag" :style="{ background: modeColor + '18', color: modeColor }">
      {{ store.modeLabel }} · 下一阶段：{{ store.nextModeLabel }}
    </n-tag>
  </div>
</template>

<style scoped>
.session-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.undo-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #FEF3C7;
  border: 1px solid #FCD34D;
  border-radius: 8px;
  padding: 4px 12px;
  animation: undo-pulse 0.3s ease;
}

@keyframes undo-pulse {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.undo-text {
  font-size: 13px;
  color: #92400E;
  font-weight: 500;
}

.undo-fade-enter-active,
.undo-fade-leave-active {
  transition: all 0.3s ease;
}
.undo-fade-enter-from,
.undo-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.today-count {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--text-secondary);
}

.today-label {
  font-weight: 600;
  color: var(--text-tertiary);
}

.today-icons {
  letter-spacing: 2px;
  font-size: 16px;
}

.today-number {
  font-weight: 700;
  color: var(--text-primary);
  background: var(--bg-hover);
  border-radius: 12px;
  padding: 0 8px;
  min-width: 24px;
  text-align: center;
}

.cycle-progress {
  display: flex;
  gap: 4px;
  font-size: 18px;
}

.cycle-dot {
  transition: transform 0.3s;
}

.mode-tag {
  font-size: 12px;
  font-weight: 500;
}
</style>
