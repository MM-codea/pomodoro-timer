<script setup lang="ts">
import { computed, ref } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useHistoryStore } from '../stores/historyStore'

use([BarChart, GridComponent, TooltipComponent, CanvasRenderer])

const store = useHistoryStore()
const range = ref<7 | 14 | 30>(7)

const option = computed(() => {
  const data = store.dailyStats.slice(-range.value)
  const dates = data.map(d => d.date.slice(5)) // MM-DD
  const values = data.map(d => d.sessions)

  return {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const p = params[0]
        return `${p.axisValue}<br/>🍅 ${p.value} 个番茄`
      }
    },
    grid: { top: 8, right: 12, bottom: 24, left: 32 },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: { fontSize: 10, rotate: 0 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: { fontSize: 10 },
      splitLine: { lineStyle: { color: '#E2E8F0', type: 'dashed' } }
    },
    series: [{
      type: 'bar',
      data: values,
      itemStyle: {
        color: '#EF4444',
        borderRadius: [4, 4, 0, 0]
      },
      barMaxWidth: 24,
      emphasis: {
        itemStyle: { color: '#DC2626' }
      }
    }]
  }
})
</script>

<template>
  <div class="daily-chart">
    <div class="chart-header">
      <span class="chart-title">每日番茄趋势</span>
      <div class="range-tabs">
        <button
          v-for="r in ([7, 14, 30] as const)"
          :key="r"
          class="range-btn"
          :class="{ active: range === r }"
          @click="range = r"
        >{{ r }}天</button>
      </div>
    </div>
    <VChart
      v-if="store.dailyStats.length > 0"
      :option="option"
      autoresize
      style="height: 180px"
    />
    <div v-else class="chart-empty">暂无数据</div>
  </div>
</template>

<style scoped>
.daily-chart {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 14px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.chart-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

.range-tabs {
  display: flex;
  gap: 4px;
}

.range-btn {
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-secondary);
  font-size: 11px;
  padding: 2px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.range-btn.active {
  background: #EF4444;
  color: #fff;
  border-color: #EF4444;
}

.chart-empty {
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  font-size: 13px;
}
</style>
