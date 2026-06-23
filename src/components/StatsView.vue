<script setup lang="ts">
import { onMounted, onErrorCaptured, ref } from 'vue'
import { useHistoryStore } from '../stores/historyStore'
import SummaryCards from './SummaryCards.vue'
import DailyChart from './DailyChart.vue'
import CalendarHeatmap from './CalendarHeatmap.vue'
import WeekCompare from './WeekCompare.vue'

const store = useHistoryStore()
const hasError = ref(false)

onErrorCaptured((err) => {
  console.error('StatsView error:', err)
  hasError.value = true
  return false // 阻止向上传播
})

onMounted(() => {
  store.init()
})
</script>

<template>
  <div class="stats-view">
    <!-- 图表加载错误 -->
    <div v-if="hasError" class="empty-state">
      <div class="empty-icon">⚠️</div>
      <div class="empty-title">图表加载失败</div>
      <div class="empty-desc">请重启应用后重试</div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="store.isEmpty && !store.loading" class="empty-state">
      <div class="empty-icon">📊</div>
      <div class="empty-title">还没有数据</div>
      <div class="empty-desc">使用越久，数据越丰富<br/>开始你的第一个番茄吧 🍅</div>
    </div>

    <!-- 数据展示 -->
    <template v-else>
      <SummaryCards />
      <DailyChart />
      <CalendarHeatmap />
      <WeekCompare />
    </template>
  </div>
</template>

<style scoped>
.stats-view {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 20px 20px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 12px;
  color: var(--text-tertiary);
}

.empty-icon {
  font-size: 48px;
}

.empty-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-secondary);
}

.empty-desc {
  font-size: 13px;
  text-align: center;
  line-height: 1.6;
}
</style>
