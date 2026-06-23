<script setup lang="ts">
import { computed } from 'vue'
import { Play, Pause, Refresh, PlaySkipForward } from '@vicons/ionicons5'
import { useTimerStore } from '../stores/timerStore'

const store = useTimerStore()

const primaryLabel = computed(() => {
  if (store.isRunning) return '暂停'
  if (store.isPaused) return '继续'
  return '开始'
})

const primaryIcon = computed(() => {
  return store.isRunning ? Pause : Play
})

function handlePrimary() {
  if (store.isRunning) {
    store.pause()
  } else {
    store.start()
  }
}
</script>

<template>
  <div class="timer-controls">
    <!-- 重置按钮 -->
    <n-button
      circle
      size="large"
      :disabled="store.isIdle"
      @click="store.reset()"
      class="ctrl-btn secondary-btn"
    >
      <template #icon>
        <n-icon :component="Refresh" />
      </template>
    </n-button>

    <!-- 主要按钮（开始/暂停） -->
    <n-button
      circle
      size="large"
      type="primary"
      @click="handlePrimary"
      class="ctrl-btn primary-btn"
      :class="{ 'is-running': store.isRunning }"
    >
      <template #icon>
        <n-icon :component="primaryIcon" size="28" />
      </template>
    </n-button>

    <!-- 跳过按钮 -->
    <n-button
      circle
      size="large"
      @click="store.skip()"
      class="ctrl-btn secondary-btn"
    >
      <template #icon>
        <n-icon :component="PlaySkipForward" />
      </template>
    </n-button>
  </div>
</template>

<style scoped>
.timer-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-top: 12px;
}

.ctrl-btn {
  transition: all 0.25s ease;
}

.primary-btn {
  width: 64px !important;
  height: 64px !important;
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.35);
}

.primary-btn:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 24px rgba(239, 68, 68, 0.5);
}

.primary-btn.is-running {
  --n-color: #F59E0B !important;
  --n-color-hover: #D97706 !important;
  --n-color-pressed: #B45309 !important;
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.35);
}

.primary-btn.is-running:hover {
  box-shadow: 0 6px 24px rgba(245, 158, 11, 0.5);
}

.secondary-btn {
  width: 48px !important;
  height: 48px !important;
}
</style>
