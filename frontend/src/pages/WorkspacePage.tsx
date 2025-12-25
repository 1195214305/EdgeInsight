import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity,
  Database,
  Plus,
  Trash2,
  Download,
  Home,
  Table,
  BarChart3,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  RefreshCw,
  Sparkles,
  TrendingUp,
  PieChart,
  LineChart,
  Layers,
  Zap
} from 'lucide-react'
import { useAppStore, ChartConfig } from '../store/useAppStore'
import { detectColumnTypes, calculateStats, formatNumber } from '../utils/dataAnalysis'
import ChartRenderer from '../components/ChartRenderer'
import AIChatPanel from '../components/AIChatPanel'
import ChartConfigPanel from '../components/ChartConfigPanel'
import DataUploader from '../components/DataUploader'
import ApiKeyModal from '../components/ApiKeyModal'

const WorkspacePage = () => {
  const navigate = useNavigate()
  const { dataset, setDataset, charts, addChart, removeChart, clearAll } = useAppStore()
  const [activeTab, setActiveTab] = useState<'data' | 'charts' | 'report'>('charts')
  const [showConfigPanel, setShowConfigPanel] = useState(false)
  const [showUploader, setShowUploader] = useState(false)
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const [expandedChart, setExpandedChart] = useState<string | null>(null)
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false)
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)
  const [apiKey, setApiKey] = useState<string>('')

  // Load API key from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('edgeInsightApiKey')
    if (savedApiKey) {
      setApiKey(savedApiKey)
    }
  }, [])

  const handleSaveApiKey = (key: string) => {
    setApiKey(key)
    localStorage.setItem('edgeInsightApiKey', key)
  }

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('edgeInsightData')
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        setDataset(parsed)
      } catch {
        navigate('/')
      }
    } else {
      navigate('/')
    }
  }, [setDataset, navigate])

  const columnTypes = useMemo(
    () => (dataset ? detectColumnTypes(dataset.data) : {}),
    [dataset]
  )

  const numericColumns = useMemo(
    () => Object.entries(columnTypes).filter(([, t]) => t === 'number').map(([c]) => c),
    [columnTypes]
  )

  const stats = useMemo(() => {
    if (!dataset || numericColumns.length === 0) return []
    return numericColumns.slice(0, 4).map((col) => ({
      name: col,
      ...calculateStats(dataset.data, col)
    }))
  }, [dataset, numericColumns])

  const handleChartGenerated = (chart: ChartConfig) => {
    // Check if chart with same config already exists
    const exists = charts.some(
      (c) => c.xField === chart.xField && c.yField === chart.yField && c.type === chart.type
    )
    if (!exists) {
      addChart(chart)
    }
  }

  const handleExportReport = async () => {
    // Dynamic import for PDF generation
    const { jsPDF } = await import('jspdf')
    const html2canvas = (await import('html2canvas')).default

    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()

    // Title
    pdf.setFontSize(20)
    pdf.text('EdgeInsight 数据分析报告', pageWidth / 2, 20, { align: 'center' })

    pdf.setFontSize(12)
    pdf.text(`数据源: ${dataset?.name || '未知'}`, 20, 35)
    pdf.text(`生成时间: ${new Date().toLocaleString()}`, 20, 42)
    pdf.text(`数据量: ${dataset?.data.length || 0} 行`, 20, 49)

    // Stats
    pdf.setFontSize(14)
    pdf.text('数据统计', 20, 65)

    let yPos = 75
    stats.forEach((stat) => {
      pdf.setFontSize(10)
      pdf.text(`${stat.name}: 总和=${formatNumber(stat.sum)}, 平均=${formatNumber(stat.avg)}, 最大=${formatNumber(stat.max)}, 最小=${formatNumber(stat.min)}`, 20, yPos)
      yPos += 8
    })

    // Charts
    const chartElements = document.querySelectorAll('.chart-container')
    for (let i = 0; i < chartElements.length && i < 4; i++) {
      const canvas = await html2canvas(chartElements[i] as HTMLElement, {
        backgroundColor: '#0f172a',
        scale: 2
      })
      const imgData = canvas.toDataURL('image/png')

      if (yPos > 200) {
        pdf.addPage()
        yPos = 20
      }

      const imgWidth = 170
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      pdf.addImage(imgData, 'PNG', 20, yPos, imgWidth, imgHeight)
      yPos += imgHeight + 10
    }

    pdf.save(`EdgeInsight_Report_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const handleNewData = () => {
    clearAll()
    localStorage.removeItem('edgeInsightData')
    setShowUploader(true)
  }

  if (!dataset) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-dark-400">加载数据中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      {/* Header - 更精美的设计 */}
      <header className="h-16 border-b border-dark-800/50 flex items-center justify-between px-6 flex-shrink-0 bg-dark-900/30 backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-dark-800 group-hover:bg-dark-700 flex items-center justify-center transition-colors">
              <Home className="w-4 h-4" />
            </div>
          </button>
          <div className="h-6 w-px bg-dark-700" />
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-white">EdgeInsight</span>
              <span className="text-dark-500 text-sm ml-2">工作台</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* API密钥状态指示 */}
          <button
            onClick={() => setShowApiKeyModal(true)}
            className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
              apiKey
                ? 'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20'
                : 'bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/20'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${apiKey ? 'bg-emerald-400' : 'bg-orange-400'} animate-pulse`} />
            <span className={`text-xs ${apiKey ? 'text-emerald-400' : 'text-orange-400'}`}>
              {apiKey ? 'AI已就绪' : '未配置API'}
            </span>
          </button>

          <button onClick={() => setShowApiKeyModal(true)} className="btn-ghost flex items-center gap-2 text-sm">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">设置</span>
          </button>
          <button onClick={handleNewData} className="btn-ghost flex items-center gap-2 text-sm">
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">新数据</span>
          </button>
          <button onClick={handleExportReport} className="btn-primary flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">导出报告</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Data - 优化设计 */}
        <motion.div
          animate={{ width: leftPanelCollapsed ? 56 : 300 }}
          className="border-r border-dark-800/50 flex flex-col bg-dark-900/30 flex-shrink-0"
        >
          <div className="h-14 border-b border-dark-800/50 flex items-center justify-between px-4">
            {!leftPanelCollapsed && (
              <div className="flex items-center gap-2 text-sm font-medium">
                <div className="w-7 h-7 rounded-lg bg-primary-500/10 flex items-center justify-center">
                  <Database className="w-4 h-4 text-primary-400" />
                </div>
                <span>数据源</span>
              </div>
            )}
            <button
              onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
              className="btn-ghost p-1.5 rounded-lg"
            >
              {leftPanelCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {!leftPanelCollapsed && (
            <div className="flex-1 overflow-y-auto p-4">
              {/* Dataset info - 卡片式设计 */}
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-dark-800/80 to-dark-800/40 border border-dark-700/50 shadow-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
                    <Layers className="w-5 h-5 text-primary-400" />
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <Zap className="w-3 h-3 text-emerald-400" />
                    <span className="text-xs text-emerald-400">已就绪</span>
                  </div>
                </div>
                <div className="font-semibold text-white mb-1 truncate">{dataset.name}</div>
                <div className="flex items-center gap-3 text-xs text-dark-400">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {dataset.data.length} 行
                  </span>
                  <span className="flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" />
                    {dataset.columns.length} 列
                  </span>
                </div>
              </div>

              {/* Columns - 更好的视觉层次 */}
              <div className="mb-6">
                <div className="text-xs text-dark-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span>数据列</span>
                  <span className="px-1.5 py-0.5 rounded bg-dark-800 text-dark-400">{dataset.columns.length}</span>
                </div>
                <div className="space-y-1.5">
                  {dataset.columns.map((col) => (
                    <div
                      key={col}
                      className="flex items-center justify-between p-3 rounded-xl bg-dark-800/30 hover:bg-dark-800/60 transition-all duration-200 border border-transparent hover:border-dark-700/50 group"
                    >
                      <span className="text-sm text-dark-200 truncate group-hover:text-white transition-colors">{col}</span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        columnTypes[col] === 'number'
                          ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                          : columnTypes[col] === 'date'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                          : 'bg-purple-500/15 text-purple-400 border border-purple-500/20'
                      }`}>
                        {columnTypes[col] === 'number' ? '数值' : columnTypes[col] === 'date' ? '日期' : '文本'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick stats - 更精美的统计卡片 */}
              {stats.length > 0 && (
                <div>
                  <div className="text-xs text-dark-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span>快速统计</span>
                    <Sparkles className="w-3 h-3 text-accent-cyan" />
                  </div>
                  <div className="space-y-3">
                    {stats.map((stat) => (
                      <div key={stat.name} className="p-4 rounded-xl bg-dark-800/30 border border-dark-700/30">
                        <div className="text-sm text-dark-300 mb-3 font-medium">{stat.name}</div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-2 rounded-lg bg-dark-900/50">
                            <div className="text-xs text-dark-500 mb-1">总和</div>
                            <div className="text-sm font-semibold text-primary-400">{formatNumber(stat.sum)}</div>
                          </div>
                          <div className="p-2 rounded-lg bg-dark-900/50">
                            <div className="text-xs text-dark-500 mb-1">平均</div>
                            <div className="text-sm font-semibold text-accent-cyan">{formatNumber(stat.avg)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Center Panel - Charts/Data/Report */}
        <div className="flex-1 flex flex-col overflow-hidden bg-dark-950">
          {/* Tabs - 更现代的标签设计 */}
          <div className="h-14 border-b border-dark-800/50 flex items-center px-6 gap-2 bg-dark-900/20">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-dark-800/50">
              <button
                onClick={() => setActiveTab('charts')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'charts'
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'text-dark-400 hover:text-white hover:bg-dark-700/50'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                图表
              </button>
              <button
                onClick={() => setActiveTab('data')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'data'
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'text-dark-400 hover:text-white hover:bg-dark-700/50'
                }`}
              >
                <Table className="w-4 h-4" />
                数据表
              </button>
              <button
                onClick={() => setActiveTab('report')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'report'
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'text-dark-400 hover:text-white hover:bg-dark-700/50'
                }`}
              >
                <FileText className="w-4 h-4" />
                报告
              </button>
            </div>

            <div className="flex-1" />

            {activeTab === 'charts' && (
              <button
                onClick={() => setShowConfigPanel(true)}
                className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                添加图表
              </button>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'charts' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {charts.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-dark-800/50 flex items-center justify-center mb-6">
                      <BarChart3 className="w-10 h-10 text-dark-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">还没有图表</h3>
                    <p className="text-dark-400 mb-6 max-w-md">
                      点击下方按钮添加图表，或者在右侧AI助手中用自然语言描述你想要的分析
                    </p>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setShowConfigPanel(true)}
                        className="btn-primary flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        添加图表
                      </button>
                      <span className="text-dark-500">或</span>
                      <button
                        onClick={() => setRightPanelCollapsed(false)}
                        className="btn-secondary flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        使用AI助手
                      </button>
                    </div>
                  </div>
                ) : (
                  charts.map((chart) => (
                    <motion.div
                      key={chart.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group"
                    >
                      <ChartRenderer config={chart} dataset={dataset} height={280} />
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setExpandedChart(chart.id)}
                          className="p-1.5 rounded-lg bg-dark-800/80 hover:bg-dark-700 transition-colors"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeChart(chart.id)}
                          className="p-1.5 rounded-lg bg-dark-800/80 hover:bg-red-500/50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'data' && (
              <div className="overflow-x-auto rounded-xl border border-dark-700">
                <table className="w-full text-sm">
                  <thead className="bg-dark-800 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-dark-300 w-12">#</th>
                      {dataset.columns.map((col) => (
                        <th key={col} className="px-4 py-3 text-left font-medium text-dark-300 whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dataset.data.slice(0, 100).map((row, i) => (
                      <tr key={i} className="border-t border-dark-700 hover:bg-dark-800/30">
                        <td className="px-4 py-2 text-dark-500">{i + 1}</td>
                        {dataset.columns.map((col) => (
                          <td key={col} className="px-4 py-2 text-dark-200 whitespace-nowrap">
                            {String(row[col] ?? '-')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {dataset.data.length > 100 && (
                  <div className="p-4 text-center text-dark-400 text-sm border-t border-dark-700">
                    显示前 100 行，共 {dataset.data.length} 行数据
                  </div>
                )}
              </div>
            )}

            {activeTab === 'report' && (
              <div className="max-w-3xl mx-auto">
                <div className="glass-card mb-6">
                  <h2 className="text-2xl font-bold mb-4">数据分析报告</h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-dark-400">数据源：</span>
                      <span className="text-white">{dataset.name}</span>
                    </div>
                    <div>
                      <span className="text-dark-400">数据量：</span>
                      <span className="text-white">{dataset.data.length} 行</span>
                    </div>
                    <div>
                      <span className="text-dark-400">字段数：</span>
                      <span className="text-white">{dataset.columns.length} 列</span>
                    </div>
                    <div>
                      <span className="text-dark-400">生成时间：</span>
                      <span className="text-white">{new Date().toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {stats.length > 0 && (
                  <div className="glass-card mb-6">
                    <h3 className="text-lg font-semibold mb-4">数据统计</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {stats.map((stat) => (
                        <div key={stat.name} className="p-4 rounded-lg bg-dark-800/50">
                          <div className="text-sm text-dark-400 mb-2">{stat.name}</div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <div className="text-dark-500">总和</div>
                              <div className="text-lg font-semibold text-primary-400">{formatNumber(stat.sum)}</div>
                            </div>
                            <div>
                              <div className="text-dark-500">平均</div>
                              <div className="text-lg font-semibold text-accent-cyan">{formatNumber(stat.avg)}</div>
                            </div>
                            <div>
                              <div className="text-dark-500">最大</div>
                              <div className="text-lg font-semibold text-green-400">{formatNumber(stat.max)}</div>
                            </div>
                            <div>
                              <div className="text-dark-500">最小</div>
                              <div className="text-lg font-semibold text-orange-400">{formatNumber(stat.min)}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {charts.length > 0 && (
                  <div className="glass-card">
                    <h3 className="text-lg font-semibold mb-4">图表分析</h3>
                    <div className="space-y-4">
                      {charts.map((chart) => (
                        <ChartRenderer key={chart.id} config={chart} dataset={dataset} height={300} />
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 text-center">
                  <button onClick={handleExportReport} className="btn-primary">
                    <Download className="w-4 h-4 mr-2" />
                    导出 PDF 报告
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - AI Chat */}
        <motion.div
          animate={{ width: rightPanelCollapsed ? 48 : 360 }}
          className="border-l border-dark-800 flex flex-col bg-dark-900/50 flex-shrink-0"
        >
          <div className="h-12 border-b border-dark-800 flex items-center justify-between px-3">
            <button
              onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
              className="btn-ghost p-1"
            >
              {rightPanelCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {!rightPanelCollapsed && (
              <div className="flex items-center gap-2 text-sm font-medium">
                AI 助手
                <Settings className="w-4 h-4 text-dark-400" />
              </div>
            )}
          </div>

          {!rightPanelCollapsed && (
            <div className="flex-1 overflow-hidden">
              <AIChatPanel onChartGenerated={handleChartGenerated} apiKey={apiKey} onNeedApiKey={() => setShowApiKeyModal(true)} />
            </div>
          )}
        </motion.div>
      </div>

      {/* Chart Config Panel */}
      <AnimatePresence>
        {showConfigPanel && (
          <ChartConfigPanel
            dataset={dataset}
            onAddChart={addChart}
            onClose={() => setShowConfigPanel(false)}
          />
        )}
      </AnimatePresence>

      {/* Data Uploader */}
      {showUploader && (
        <DataUploader
          onClose={() => setShowUploader(false)}
          onDataUploaded={(data) => {
            setDataset(data)
            localStorage.setItem('edgeInsightData', JSON.stringify(data))
            setShowUploader(false)
          }}
        />
      )}

      {/* Expanded Chart Modal */}
      <AnimatePresence>
        {expandedChart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-dark-950/90 backdrop-blur-sm"
            onClick={() => setExpandedChart(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setExpandedChart(null)}
                className="absolute top-4 right-4 btn-ghost p-2"
              >
                <X className="w-6 h-6" />
              </button>
              {charts.find((c) => c.id === expandedChart) && (
                <ChartRenderer
                  config={charts.find((c) => c.id === expandedChart)!}
                  dataset={dataset}
                  height={500}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onSave={handleSaveApiKey}
        currentKey={apiKey}
      />
    </div>
  )
}

export default WorkspacePage
