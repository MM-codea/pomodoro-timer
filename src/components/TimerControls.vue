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
      :title="'重置'"
    >
      <template #icon>
        <n-icon :component="Refresh" size="22" />
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
      :title="primaryLabel"
    >
      <template #icon>
        <n-icon :component="primaryIcon" size="30" />
      </template>
    </n-button>

    <!-- 跳过按钮 -->
    <n-button
      circle
      size="large"
      @click="store.skip()"
      class="ctrl-btn secondary-btn"
      :title="'跳过'"
    >
      <template #icon>
        <n-icon :component="PlaySkipForward" size="22" />
      </template>
    </n-button>
  </div>
</template>

<style scoped>
.timer-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28px;
  margin-top: 16px;
}

.ctrl-btn {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.primary-btn {
  width: 68px !important;
  height: 68px !important;
  box-shadow: 0 6px 24px rgba(224, 64, 64, 0.3);
}

.primary-btn:hover {
  transform: scale(1.06);
  box-shadow: 0 8px 32px rgba(224, 64, 64, 0.45);
}

.primary-btn:active {
  transform: scale(0.96);
}

/* 运行中 — 琥珀暖色 */
.primary-btn.is-running {
  --n-color: #E8A030 !important;
  --n-color-hover: #D49520 !important;
  --n-color-pressed: #C08818 !important;
  --n-color-focus: #E8A030 !important;
  box-shadow: 0 6px 24px rgba(232, 160, 48, 0.35);
}

.primary-btn.is-running:hover {
  box-shadow: 0 8px 32px rgba(232, 160, 48, 0.5);
}

.secondary-btn {
  width: 52px !important;
  height: 52px !important;
  opacity: 0.75;
}

.secondary-btn:hover {
  opacity: 1;
}
</style>
