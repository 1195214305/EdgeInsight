import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  LineChart,
  PieChart,
  ScatterChart,
  Activity,
  Radar,
  Triangle,
  Gauge,
  Plus,
  X,
  Settings
} from 'lucide-react'
import { ChartConfig, DataSet } from '../store/useAppStore'
import { detectColumnTypes } from '../utils/dataAnalysis'

interface ChartConfigPanelProps {
  dataset: DataSet
  onAddChart: (config: ChartConfig) => void
  onClose: () => void
}

const chartTypes = [
  { type: 'bar', icon: BarChart3, label: '柱状图', desc: '对比不同类别的数值' },
  { type: 'line', icon: LineChart, label: '折线图', desc: '展示数据趋势变化' },
  { type: 'pie', icon: PieChart, label: '饼图', desc: '展示占比分布' },
  { type: 'scatter', icon: ScatterChart, label: '散点图', desc: '分析两个变量关系' },
  { type: 'area', icon: Activity, label: '面积图', desc: '强调数量变化' },
  { type: 'radar', icon: Radar, label: '雷达图', desc: '多维度对比' },
  { type: 'funnel', icon: Triangle, label: '漏斗图', desc: '展示转化流程' },
  { type: 'gauge', icon: Gauge, label: '仪表盘', desc: '展示指标完成度' }
] as const

const aggregations = [
  { value: 'sum', label: '求和' },
  { value: 'avg', label: '平均值' },
  { value: 'count', label: '计数' },
  { value: 'max', label: '最大值' },
  { value: 'min', label: '最小值' }
] as const

const ChartConfigPanel = ({ dataset, onAddChart, onClose }: ChartConfigPanelProps) => {
  const [selectedType, setSelectedType] = useState<ChartConfig['type']>('bar')
  const [title, setTitle] = useState('')
  const [xField, setXField] = useState('')
  const [yField, setYField] = useState('')
  const [aggregation, setAggregation] = useState<ChartConfig['aggregation']>('sum')

  const columnTypes = useMemo(() => detectColumnTypes(dataset.data), [dataset])

  const numericColumns = useMemo(
    () => Object.entries(columnTypes).filter(([, t]) => t === 'number').map(([c]) => c),
    [columnTypes]
  )

  const categoryColumns = useMemo(
    () => Object.entries(columnTypes).filter(([, t]) => t === 'string' || t === 'date').map(([c]) => c),
    [columnTypes]
  )

  const handleCreate = () => {
    if (!xField || !yField) return

    const config: ChartConfig = {
      id: `chart-${Date.now()}`,
      type: selectedType,
      title: title || `${xField}的${yField}${selectedType === 'pie' ? '占比' : '分布'}`,
      xField,
      yField,
      aggregation
    }

    onAddChart(config)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary-400" />
            <h2 className="text-xl font-semibold">添加图表</h2>
          </div>
          <button onClick={onClose} className="btn-ghost p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chart type selection */}
        <div className="mb-6">
          <label className="block text-sm text-dark-400 mb-3">选择图表类型</label>
          <div className="grid grid-cols-4 gap-3">
            {chartTypes.map(({ type, icon: Icon, label, desc }) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`p-4 rounded-xl border transition-all ${
                  selectedType === type
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-dark-700 hover:border-dark-600 hover:bg-dark-800/50'
                }`}
              >
                <Icon className={`w-6 h-6 mx-auto mb-2 ${
                  selectedType === type ? 'text-primary-400' : 'text-dark-400'
                }`} />
                <div className={`text-sm font-medium ${
                  selectedType === type ? 'text-white' : 'text-dark-300'
                }`}>
                  {label}
                </div>
                <div className="text-xs text-dark-500 mt-1 hidden sm:block">{desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Chart configuration */}
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm text-dark-400 mb-2">图表标题（可选）</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="自动生成标题"
              className="input-field"
            />
          </div>

          {/* X Field */}
          <div>
            <label className="block text-sm text-dark-400 mb-2">
              {selectedType === 'scatter' ? 'X轴字段（数值）' : '分组字段（类别）'}
            </label>
            <select
              value={xField}
              onChange={(e) => setXField(e.target.value)}
              className="input-field"
            >
              <option value="">请选择字段</option>
              {(selectedType === 'scatter' ? numericColumns : categoryColumns).map((col) => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>

          {/* Y Field */}
          <div>
            <label className="block text-sm text-dark-400 mb-2">
              {selectedType === 'scatter' ? 'Y轴字段（数值）' : '数值字段'}
            </label>
            <select
              value={yField}
              onChange={(e) => setYField(e.target.value)}
              className="input-field"
            >
              <option value="">请选择字段</option>
              {numericColumns.map((col) => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>

          {/* Aggregation */}
          {selectedType !== 'scatter' && (
            <div>
              <label className="block text-sm text-dark-400 mb-2">聚合方式</label>
              <div className="flex gap-2">
                {aggregations.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setAggregation(value)}
                    className={`px-4 py-2 rounded-lg text-sm transition-all ${
                      aggregation === value
                        ? 'bg-primary-500 text-white'
                        : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-8">
          <button onClick={onClose} className="flex-1 btn-secondary">
            取消
          </button>
          <button
            onClick={handleCreate}
            disabled={!xField || !yField}
            className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            创建图表
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ChartConfigPanel
