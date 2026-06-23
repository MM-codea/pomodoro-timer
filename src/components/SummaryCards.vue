<script setup lang="ts">
import { computed } from 'vue'
import { useHistoryStore } from '../stores/historyStore'

const store = useHistoryStore()

const cards = computed(() => {
  const s = store.stats
  if (!s) return []
  return [
    {
      icon: '🍅',
      label: '本月番茄',
      value: s.dailyStats.filter(d => d.sessions > 0).reduce((a, d) => a + d.sessions, 0),
      unit: '个'
    },
    {
      icon: '⏰',
      label: '总专注时长',
      value: s.totalFocusHours,
      unit: '小时'
    },
    {
      icon: '🔥',
      label: '连续天数',
      value: s.currentStreak,
      unit: '天'
    },
    {
      icon: '📈',
      label: '日均番茄',
      value: s.monthlyAvg,
      unit: '个/天'
    }
  ]
})
</script>

<template>
  <div class="summary-cards">
    <div
      v-for="card in cards"
      :key="card.label"
      class="summary-card"
    >
      <div class="card-icon">{{ card.icon }}</div>
      <div class="card-info">
        <div class="card-value">
          {{ card.value }}<span class="card-unit">{{ card.unit }}</span>
        </div>
        <div class="card-label">{{ card.label }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.summary-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 12px 14px;
  transition: transform 0.2s;
}

.summary-card:hover {
  transform: translateY(-2px);
}

.card-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.card-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}

.card-unit {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-tertiary);
  margin-left: 2px;
}

.card-label {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
}
</style>
