import { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { ChartConfig, DataSet } from '../store/useAppStore'
import { aggregateData } from '../utils/dataAnalysis'

interface ChartRendererProps {
  config: ChartConfig
  dataset: DataSet
  height?: number
}

const ChartRenderer = ({ config, dataset, height = 300 }: ChartRendererProps) => {
  const option = useMemo(() => {
    const { type, title, xField, yField, aggregation = 'sum' } = config

    if (!xField || !yField) {
      return {
        title: { text: title, textStyle: { color: '#e2e8f0' } },
        graphic: {
          type: 'text',
          left: 'center',
          top: 'middle',
          style: {
            text: '请配置图表字段',
            fill: '#64748b',
            fontSize: 14
          }
        }
      }
    }

    const aggregatedData = aggregateData(dataset.data, xField, yField, aggregation)

    // Sort data for better visualization
    const sortedData = [...aggregatedData].sort((a, b) => {
      // Try to sort by month order if it looks like months
      const monthOrder = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
      const aIndex = monthOrder.indexOf(a.name)
      const bIndex = monthOrder.indexOf(b.name)
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex
      }
      return 0
    })

    const baseOption = {
      title: {
        text: title,
        textStyle: { color: '#e2e8f0', fontSize: 14, fontWeight: 500 },
        left: 'center',
        top: 10
      },
      tooltip: {
        trigger: type === 'pie' ? 'item' : 'axis',
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderColor: 'rgba(99, 102, 241, 0.3)',
        textStyle: { color: '#e2e8f0' },
        formatter: type === 'pie' ? '{b}: {c} ({d}%)' : undefined
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: 60,
        containLabel: true
      }
    }

    const colors = [
      '#6366f1', '#a855f7', '#06b6d4', '#22c55e', '#f97316',
      '#ec4899', '#8b5cf6', '#14b8a6', '#eab308', '#ef4444'
    ]

    switch (type) {
      case 'bar':
        return {
          ...baseOption,
          color: colors,
          xAxis: {
            type: 'category',
            data: sortedData.map((d) => d.name),
            axisLine: { lineStyle: { color: '#334155' } },
            axisLabel: { color: '#94a3b8', rotate: sortedData.length > 8 ? 45 : 0 }
          },
          yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: '#334155' } },
            axisLabel: { color: '#94a3b8' },
            splitLine: { lineStyle: { color: '#1e293b' } }
          },
          series: [{
            type: 'bar',
            data: sortedData.map((d) => d.value),
            itemStyle: {
              borderRadius: [4, 4, 0, 0],
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: '#6366f1' },
                  { offset: 1, color: '#4f46e5' }
                ]
              }
            },
            emphasis: {
              itemStyle: {
                color: {
                  type: 'linear',
                  x: 0, y: 0, x2: 0, y2: 1,
                  colorStops: [
                    { offset: 0, color: '#818cf8' },
                    { offset: 1, color: '#6366f1' }
                  ]
                }
              }
            }
          }]
        }

      case 'line':
        return {
          ...baseOption,
          color: colors,
          xAxis: {
            type: 'category',
            data: sortedData.map((d) => d.name),
            axisLine: { lineStyle: { color: '#334155' } },
            axisLabel: { color: '#94a3b8' },
            boundaryGap: false
          },
          yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: '#334155' } },
            axisLabel: { color: '#94a3b8' },
            splitLine: { lineStyle: { color: '#1e293b' } }
          },
          series: [{
            type: 'line',
            data: sortedData.map((d) => d.value),
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            lineStyle: { width: 3, color: '#6366f1' },
            itemStyle: { color: '#6366f1', borderWidth: 2, borderColor: '#fff' },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(99, 102, 241, 0.3)' },
                  { offset: 1, color: 'rgba(99, 102, 241, 0)' }
                ]
              }
            }
          }]
        }

      case 'pie':
        return {
          ...baseOption,
          color: colors,
          legend: {
            orient: 'vertical',
            right: 10,
            top: 'center',
            textStyle: { color: '#94a3b8' }
          },
          series: [{
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['40%', '55%'],
            avoidLabelOverlap: true,
            itemStyle: {
              borderRadius: 8,
              borderColor: '#0f172a',
              borderWidth: 2
            },
            label: {
              show: false
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 14,
                fontWeight: 'bold',
                color: '#e2e8f0'
              }
            },
            labelLine: { show: false },
            data: sortedData.map((d) => ({ name: d.name, value: d.value }))
          }]
        }

      case 'scatter':
        const scatterData = dataset.data.map((row) => [
          Number(row[xField]) || 0,
          Number(row[yField]) || 0
        ])
        return {
          ...baseOption,
          xAxis: {
            type: 'value',
            name: xField,
            nameTextStyle: { color: '#94a3b8' },
            axisLine: { lineStyle: { color: '#334155' } },
            axisLabel: { color: '#94a3b8' },
            splitLine: { lineStyle: { color: '#1e293b' } }
          },
          yAxis: {
            type: 'value',
            name: yField,
            nameTextStyle: { color: '#94a3b8' },
            axisLine: { lineStyle: { color: '#334155' } },
            axisLabel: { color: '#94a3b8' },
            splitLine: { lineStyle: { color: '#1e293b' } }
          },
          series: [{
            type: 'scatter',
            data: scatterData,
            symbolSize: 10,
            itemStyle: {
              color: '#6366f1',
              shadowBlur: 10,
              shadowColor: 'rgba(99, 102, 241, 0.5)'
            }
          }]
        }

      case 'area':
        return {
          ...baseOption,
          color: colors,
          xAxis: {
            type: 'category',
            data: sortedData.map((d) => d.name),
            axisLine: { lineStyle: { color: '#334155' } },
            axisLabel: { color: '#94a3b8' },
            boundaryGap: false
          },
          yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: '#334155' } },
            axisLabel: { color: '#94a3b8' },
            splitLine: { lineStyle: { color: '#1e293b' } }
          },
          series: [{
            type: 'line',
            data: sortedData.map((d) => d.value),
            smooth: true,
            areaStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(99, 102, 241, 0.5)' },
                  { offset: 1, color: 'rgba(99, 102, 241, 0.05)' }
                ]
              }
            },
            lineStyle: { width: 2, color: '#6366f1' }
          }]
        }

      case 'radar':
        const maxValue = Math.max(...sortedData.map((d) => d.value))
        return {
          ...baseOption,
          radar: {
            indicator: sortedData.map((d) => ({ name: d.name, max: maxValue * 1.2 })),
            axisName: { color: '#94a3b8' },
            splitLine: { lineStyle: { color: '#1e293b' } },
            splitArea: { areaStyle: { color: ['rgba(99, 102, 241, 0.05)', 'rgba(99, 102, 241, 0.1)'] } }
          },
          series: [{
            type: 'radar',
            data: [{
              value: sortedData.map((d) => d.value),
              name: yField,
              areaStyle: { color: 'rgba(99, 102, 241, 0.3)' },
              lineStyle: { color: '#6366f1' },
              itemStyle: { color: '#6366f1' }
            }]
          }]
        }

      case 'funnel':
        return {
          ...baseOption,
          color: colors,
          series: [{
            type: 'funnel',
            left: '10%',
            top: 60,
            bottom: 20,
            width: '80%',
            min: 0,
            max: Math.max(...sortedData.map((d) => d.value)),
            minSize: '0%',
            maxSize: '100%',
            sort: 'descending',
            gap: 2,
            label: {
              show: true,
              position: 'inside',
              color: '#fff'
            },
            itemStyle: {
              borderColor: '#0f172a',
              borderWidth: 1
            },
            data: sortedData.sort((a, b) => b.value - a.value).map((d) => ({
              name: d.name,
              value: d.value
            }))
          }]
        }

      case 'gauge':
        const total = sortedData.reduce((s, d) => s + d.value, 0)
        const avg = total / sortedData.length
        return {
          ...baseOption,
          series: [{
            type: 'gauge',
            center: ['50%', '60%'],
            startAngle: 200,
            endAngle: -20,
            min: 0,
            max: Math.max(...sortedData.map((d) => d.value)) * 1.2,
            splitNumber: 5,
            itemStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 1, y2: 0,
                colorStops: [
                  { offset: 0, color: '#6366f1' },
                  { offset: 1, color: '#06b6d4' }
                ]
              }
            },
            progress: {
              show: true,
              width: 20
            },
            pointer: { show: false },
            axisLine: {
              lineStyle: {
                width: 20,
                color: [[1, '#1e293b']]
              }
            },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: {
              distance: 25,
              color: '#94a3b8',
              fontSize: 10
            },
            title: {
              show: true,
              offsetCenter: [0, '70%'],
              color: '#94a3b8'
            },
            detail: {
              valueAnimation: true,
              fontSize: 24,
              offsetCenter: [0, '40%'],
              color: '#e2e8f0',
              formatter: '{value}'
            },
            data: [{ value: Math.round(avg), name: '平均值' }]
          }]
        }

      default:
        return baseOption
    }
  }, [config, dataset])

  return (
    <div className="chart-container">
      <ReactECharts
        option={option}
        style={{ height: `${height}px`, width: '100%' }}
        opts={{ renderer: 'canvas' }}
        theme="dark"
      />
    </div>
  )
}

export default ChartRenderer
