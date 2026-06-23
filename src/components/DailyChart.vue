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
  const dates = data.map(d => d.date.slice(5))
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
      axisLabel: { fontSize: 10, color: '#A09A94' },
      axisLine: { lineStyle: { color: '#E8E3DB' } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: { fontSize: 10, color: '#A09A94' },
      splitLine: { lineStyle: { color: '#E8E3DB', type: 'dashed' } }
    },
    series: [{
      type: 'bar',
      data: values,
      itemStyle: {
        color: '#E04040',
        borderRadius: [4, 4, 0, 0]
      },
      barMaxWidth: 24,
      emphasis: {
        itemStyle: { color: '#C83030' }
      }
    }]
  }
})
</script>

<template>
  <div class="daily-chart">
    <div class="chart-header">
      <span class="chart-title">每日趋势</span>
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
  border-radius: var(--radius-lg);
  padding: 16px;
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
  gap: 2px;
  background: var(--bg-hover);
  border-radius: var(--radius-sm);
  padding: 2px;
}

.range-btn {
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.range-btn.active {
  background: var(--bg-card);
  color: var(--color-work);
  box-shadow: var(--shadow-sm);
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
