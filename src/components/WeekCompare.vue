<script setup lang="ts">
import { computed } from 'vue'
import { useHistoryStore } from '../stores/historyStore'

const store = useHistoryStore()

const comparison = computed(() => {
  const weeks = store.weeklyStats
  if (weeks.length < 2) return null

  const thisWeek = weeks[weeks.length - 1]
  const lastWeek = weeks[weeks.length - 2]

  const sessionChange = lastWeek.sessions > 0
    ? Math.round((thisWeek.sessions - lastWeek.sessions) / lastWeek.sessions * 100)
    : thisWeek.sessions > 0 ? 100 : 0

  const focusChange = lastWeek.totalFocusMinutes > 0
    ? Math.round((thisWeek.totalFocusMinutes - lastWeek.totalFocusMinutes) / lastWeek.totalFocusMinutes * 100)
    : thisWeek.totalFocusMinutes > 0 ? 100 : 0

  return {
    thisWeek,
    lastWeek,
    sessionChange,
    focusChange
  }
})

function formatHours(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0 && m > 0) return `${h}h ${m}m`
  if (h > 0) return `${h} 小时`
  return `${m} 分钟`
}

function changeMark(val: number): { cls: string; sym: string } {
  if (val > 0) return { cls: 'change-up', sym: '↑' }
  if (val < 0) return { cls: 'change-down', sym: '↓' }
  return { cls: 'change-flat', sym: '→' }
}
</script>

<template>
  <div class="week-compare">
    <div class="chart-header">
      <span class="chart-title">周报对比</span>
    </div>

    <div v-if="comparison" class="compare-content">
      <div class="compare-row">
        <div class="compare-side">
          <div class="compare-week">{{ comparison.lastWeek.weekLabel }}</div>
          <div class="compare-val">🍅 {{ comparison.lastWeek.sessions }}</div>
          <div class="compare-time">{{ formatHours(comparison.lastWeek.totalFocusMinutes) }}</div>
        </div>
        <div class="compare-vs">VS</div>
        <div class="compare-side">
          <div class="compare-week current">{{ comparison.thisWeek.weekLabel }}</div>
          <div class="compare-val current">🍅 {{ comparison.thisWeek.sessions }}</div>
          <div class="compare-time">{{ formatHours(comparison.thisWeek.totalFocusMinutes) }}</div>
        </div>
      </div>

      <div class="compare-delta">
        <span :class="changeMark(comparison.sessionChange).cls">
          {{ changeMark(comparison.sessionChange).sym }} {{ Math.abs(comparison.sessionChange) }}% 番茄
        </span>
        <span class="delta-sep">·</span>
        <span :class="changeMark(comparison.focusChange).cls">
          {{ changeMark(comparison.focusChange).sym }} {{ Math.abs(comparison.focusChange) }}% 时长
        </span>
      </div>
    </div>

    <div v-else class="chart-empty">
      <span>至少需要两周数据</span>
    </div>
  </div>
</template>

<style scoped>
.week-compare {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 14px;
}

.chart-header {
  margin-bottom: 10px;
}

.chart-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

.compare-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.compare-row {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.compare-side {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.compare-week {
  font-size: 12px;
  color: var(--text-tertiary);
  font-weight: 600;
}

.compare-week.current {
  color: #EF4444;
}

.compare-val {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.compare-val.current {
  color: #EF4444;
}

.compare-time {
  font-size: 12px;
  color: var(--text-secondary);
}

.compare-vs {
  font-size: 14px;
  font-weight: 800;
  color: var(--text-tertiary);
  background: var(--bg-hover);
  padding: 4px 10px;
  border-radius: 20px;
}

.compare-delta {
  display: flex;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  padding: 8px;
  background: var(--bg-hover);
  border-radius: 8px;
}

.change-up { color: #16A34A; }
.change-down { color: #EF4444; }
.change-flat { color: var(--text-tertiary); }
.delta-sep { color: var(--border-color); }

.chart-empty {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  font-size: 13px;
}
</style>
