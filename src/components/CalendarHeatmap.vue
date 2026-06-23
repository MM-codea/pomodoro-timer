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

  const data: [string, number][] = []
  const endDate = now
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - 3)

  const dayMap = new Map<string, number>()
  for (const d of store.dailyStats) {
    if (d.sessions > 0) {
      dayMap.set(d.date, d.sessions)
    }
  }

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
        { min: 0, max: 0, color: '#F3F0EB', label: '无' },
        { min: 1, max: 1, color: '#FBE8E8', label: '1' },
        { min: 2, max: 3, color: '#F0A8A8', label: '2-3' },
        { min: 4, max: 6, color: '#E04040', label: '4-6' },
        { min: 7, max: 99, color: '#B02020', label: '7+' }
      ],
      textStyle: { fontSize: 10, color: '#A09A94' }
    },
    calendar: {
      top: 20,
      left: 20,
      right: 20,
      bottom: 80,
      cellSize: [16, 16],
      range: [startDate.getTime(), endDate.getTime()],
      yearLabel: { show: true, fontSize: 12, color: '#6B6560' },
      dayLabel: {
        fontSize: 10,
        nameMap: ['日', '一', '二', '三', '四', '五', '六'],
        color: '#A09A94'
      },
      monthLabel: { fontSize: 11, color: '#6B6560' },
      splitLine: { lineStyle: { color: '#E8E3DB' } },
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
      <span class="chart-title">热力图</span>
    </div>
    <VChart
      v-if="store.dailyStats.some(d => d.sessions > 0)"
      :option="option"
      autoresize
      style="height: 200px"
    />
    <div v-else class="chart-empty">
      <span>开始专注，点亮热力图</span>
    </div>
  </div>
</template>

<style scoped>
.calendar-heatmap {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 16px;
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
