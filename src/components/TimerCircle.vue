<script setup lang="ts">
import { computed } from 'vue'
import { useTimerStore } from '../stores/timerStore'

const store = useTimerStore()

const radius = 150
const strokeWidth = 7
const normalizedRadius = radius - strokeWidth / 2
const circumference = 2 * Math.PI * normalizedRadius

const dashOffset = computed(() => {
  return circumference * (1 - store.progress)
})

const modeColors = computed(() => {
  switch (store.mode) {
    case 'work': return { stroke: '#E04040', bg: '#FBE8E8', glow: 'rgba(224, 64, 64, 0.18)' }
    case 'shortBreak': return { stroke: '#4A9E6E', bg: '#E3F2E9', glow: 'rgba(74, 158, 110, 0.18)' }
    case 'longBreak': return { stroke: '#5B7BC0', bg: '#E5EBF8', glow: 'rgba(91, 123, 192, 0.18)' }
  }
})
</script>

<template>
  <div class="timer-circle-wrapper">
    <!-- 呼吸光晕 -->
    <div
      class="timer-glow"
      :class="{ 'glow-pulse': store.isRunning }"
      :style="{ '--glow-color': modeColors.glow }"
    />
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
        stroke-linecap="round"
      />
      <!-- 进度圆环 -->
      <circle
        class="progress-ring"
        :class="{ 'ring-animate': store.isRunning }"
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
      <div class="mode-label">
        <span class="mode-dot" :style="{ background: modeColors.stroke }" />
        <span>{{ store.modeLabel }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timer-circle-wrapper {
  position: relative;
  width: 300px;
  height: 300px;
  margin: 0 auto;
}

/* 呼吸光晕 */
.timer-glow {
  position: absolute;
  inset: -24px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--glow-color) 0%, transparent 70%);
  opacity: 0.7;
  transition: background 0.8s ease-in-out;
  pointer-events: none;
}

.glow-pulse {
  animation: breathe 4s ease-in-out infinite;
}

@keyframes breathe {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.85; transform: scale(1.03); }
}

.timer-circle-svg {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.06));
}

.progress-ring {
  transition: stroke-dashoffset 0.6s linear;
}

.ring-animate {
  transition: stroke-dashoffset 0.6s linear;
}

.timer-circle-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 2;
}

.time-display {
  font-size: 58px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  letter-spacing: 1px;
  color: var(--text-primary);
  line-height: 1;
  user-select: none;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  transition: color 0.3s;
}

.mode-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 5px;
  color: var(--text-secondary);
  user-select: none;
  text-transform: uppercase;
}

.mode-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
</style>
