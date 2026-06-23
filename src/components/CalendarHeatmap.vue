<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { HeatmapChart } from 'echarts/charts'
import { CalendarComponent, TooltipComponent, VisualMapComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useHistoryStore } from '../stores/historyStore'

use([HeatmapChart, CalendarComponent, TooltipComponent, VisualMapComponent, CanvasRenderer])

const store = useHistoryStore()

const option = computed(() => {
  const now = new Date()
  const year = now.getFullYear()

  // 生成最近3个月的数据
  const data: [string, number][] = []
  const endDate = now
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - 3)

  // 聚合已有数据
  const dayMap = new Map<string, number>()
  for (const d of store.dailyStats) {
    if (d.sessions > 0) {
      dayMap.set(d.date, d.sessions)
    }
  }

  // 填充日历数据
  const d = new Date(startDate)
  while (d <= endDate) {
    const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
    data.push([key, dayMap.get(key) || 0])
    d.setDate(d.getDate() + 1)
  }

  return {
    tooltip: {
      formatter: (params: any) => {
        const val = params.value?.[1] || 0
        return `${params.value?.[0]}<br/>🍅 ${val} 个番茄`
      }
    },
    visualMap: {
      min: 0,
      max: data.reduce((m, d) => Math.max(m, d[1]), 4),
      type: 'piecewise',
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      pieces: [
        { min: 0, max: 0, color: '#F1F5F9', label: '无' },
        { min: 1, max: 1, color: '#FEE2E2', label: '1' },
        { min: 2, max: 3, color: '#FCA5A5', label: '2-3' },
        { min: 4, max: 6, color: '#EF4444', label: '4-6' },
        { min: 7, max: 99, color: '#B91C1C', label: '7+' }
      ],
      textStyle: { fontSize: 10 }
    },
    calendar: {
      top: 20,
      left: 20,
      right: 20,
      bottom: 80,
      cellSize: [16, 16],
      range: [startDate.getTime(), endDate.getTime()],
      yearLabel: { show: true, fontSize: 12 },
      dayLabel: {
        fontSize: 10,
        nameMap: ['日', '一', '二', '三', '四', '五', '六']
      },
      monthLabel: { fontSize: 11 },
      splitLine: { lineStyle: { color: '#E2E8F0' } },
      itemStyle: {
        borderRadius: 3
      }
    },
    series: [{
      type: 'heatmap',
      coordinateSystem: 'calendar',
      data
    }]
  }
})
</script>

<template>
  <div class="calendar-heatmap">
    <div class="chart-header">
      <span class="chart-title">番茄热力图</span>
    </div>
    <VChart
      v-if="store.dailyStats.some(d => d.sessions > 0)"
      :option="option"
      autoresize
      style="height: 200px"
    />
    <div v-else class="chart-empty">
      <span>使用越久，热力图越丰富 🍅</span>
    </div>
  </div>
</template>

<style scoped>
.calendar-heatmap {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 14px;
}

.chart-header {
  margin-bottom: 4px;
}

.chart-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
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
