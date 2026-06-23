<script setup lang="ts">
import { computed } from 'vue'
import { useTimerStore } from '../stores/timerStore'

const store = useTimerStore()

const radius = 140
const strokeWidth = 8
const normalizedRadius = radius - strokeWidth / 2
const circumference = 2 * Math.PI * normalizedRadius

const dashOffset = computed(() => {
  return circumference * (1 - store.progress)
})

const modeColors = computed(() => {
  switch (store.mode) {
    case 'work': return { stroke: '#EF4444', bg: '#FEF2F2' }
    case 'shortBreak': return { stroke: '#22C55E', bg: '#F0FDF4' }
    case 'longBreak': return { stroke: '#3B82F6', bg: '#EFF6FF' }
  }
})
</script>

<template>
  <div class="timer-circle-wrapper">
    <svg
      class="timer-circle-svg"
      :viewBox="`0 0 ${radius * 2} ${radius * 2}`"
    >
      <!-- 背景圆环 -->
      <circle
        :cx="radius"
        :cy="radius"
        :r="normalizedRadius"
        :stroke-width="strokeWidth"
        :stroke="modeColors.bg"
        fill="none"
      />
      <!-- 进度圆环 -->
      <circle
        class="progress-ring"
        :cx="radius"
        :cy="radius"
        :r="normalizedRadius"
        :stroke-width="strokeWidth"
        :stroke="modeColors.stroke"
        fill="none"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        :transform="`rotate(-90, ${radius}, ${radius})`"
      />
    </svg>
    <!-- 中心文字 -->
    <div class="timer-circle-content">
      <div class="time-display">
        {{ store.timeDisplay }}
      </div>
      <div class="mode-label" :style="{ color: modeColors.stroke }">
        {{ store.modeLabel }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.timer-circle-wrapper {
  position: relative;
  width: 280px;
  height: 280px;
  margin: 0 auto;
}

.timer-circle-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.08));
}

.progress-ring {
  transition: stroke-dashoffset 0.9s linear;
}

.timer-circle-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.time-display {
  font-size: 56px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: 2px;
  color: var(--text-primary);
  line-height: 1.1;
  user-select: none;
  transition: color 0.3s;
}

.mode-label {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 4px;
  user-select: none;
}
</style>
