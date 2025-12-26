import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, User, Loader2, Lightbulb, TrendingUp, AlertTriangle, Key } from 'lucide-react'
import { useAppStore, Message, ChartConfig } from '../store/useAppStore'
import { detectColumnTypes, calculateStats, getUniqueValues, aggregateData } from '../utils/dataAnalysis'

// 通义千问API URL
const QWEN_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'

interface AIChatPanelProps {
  onChartGenerated?: (chart: ChartConfig) => void
  apiKey?: string
  onNeedApiKey?: () => void
}

const AIChatPanel = ({ onChartGenerated, apiKey, onNeedApiKey }: AIChatPanelProps) => {
  const { dataset, messages, addMessage, isAnalyzing, setIsAnalyzing } = useAppStore()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 直接调用通义千问API进行分析
  const callQwenAPI = async (question: string, datasetInfo: { name: string; columns: string[]; sampleData: Record<string, unknown>[]; rowCount: number }) => {
    if (!apiKey) {
      throw new Error('未配置API密钥')
    }

    const systemPrompt = `你是一个专业的数据分析师AI助手。用户会给你一份数据的描述和一个问题，请你分析数据并回答问题。

数据信息：
- 数据名称: ${datasetInfo.name}
- 列名: ${datasetInfo.columns.join(', ')}
- 数据量: ${datasetInfo.rowCount} 行
- 样本数据: ${JSON.stringify(datasetInfo.sampleData.slice(0, 10), null, 2)}

请根据数据回答用户的问题。回答要求：
1. 简洁明了，突出关键数据
2. 如果涉及数值，给出具体数字
3. 如果适合可视化，建议合适的图表类型
4. 用中文回答`

    const response = await fetch(QWEN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'qwen-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`API调用失败: ${response.status}`)
    }

    const result = await response.json()
    return result.choices?.[0]?.message?.content || '抱歉，无法生成分析结果'
  }

  // 从AI回答中提取洞察
  const extractInsights = (answer: string): string[] => {
    const insights: string[] = []

    const numberMatches = answer.match(/[\d,]+\.?\d*/g)
    if (numberMatches && numberMatches.length > 0) {
      insights.push(`发现 ${numberMatches.length} 个关键数值`)
    }

    if (answer.includes('增长') || answer.includes('上升')) {
      insights.push('数据呈上升趋势')
    } else if (answer.includes('下降') || answer.includes('减少')) {
      insights.push('数据呈下降趋势')
    }

    if (answer.includes('最高') || answer.includes('最大')) {
      insights.push('已识别最大值')
    }
    if (answer.includes('最低') || answer.includes('最小')) {
      insights.push('已识别最小值')
    }

    return insights
  }

  // 根据问题建议图表
  const suggestCharts = (question: string, data: typeof dataset): ChartConfig[] => {
    if (!data) return []

    const charts: ChartConfig[] = []
    const q = question.toLowerCase()
    const types = detectColumnTypes(data.data)

    const numericCols = Object.entries(types).filter(([, t]) => t === 'number').map(([c]) => c)
    const categoryCols = Object.entries(types).filter(([, t]) => t === 'string' || t === 'date').map(([c]) => c)

    if (categoryCols.length > 0 && numericCols.length > 0) {
      if (q.includes('趋势') || q.includes('变化') || q.includes('时间')) {
        charts.push({
          id: `line-${Date.now()}`,
          type: 'line',
          title: `${numericCols[0]}趋势`,
          xField: categoryCols[0],
          yField: numericCols[0],
          aggregation: 'sum'
        })
      } else if (q.includes('占比') || q.includes('比例') || q.includes('分布')) {
        charts.push({
          id: `pie-${Date.now()}`,
          type: 'pie',
          title: `${categoryCols[0]}占比`,
          xField: categoryCols[0],
          yField: numericCols[0],
          aggregation: 'sum'
        })
      } else {
        charts.push({
          id: `bar-${Date.now()}`,
          type: 'bar',
          title: `${categoryCols[0]}的${numericCols[0]}对比`,
          xField: categoryCols[0],
          yField: numericCols[0],
          aggregation: 'sum'
        })
      }
    }

    return charts
  }

  const analyzeQuestion = async (question: string) => {
    if (!dataset) return

    setIsAnalyzing(true)

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: new Date().toISOString()
    }
    addMessage(userMessage)

    const datasetInfo = {
      name: dataset.name,
      columns: dataset.columns,
      sampleData: dataset.data.slice(0, 50),
      rowCount: dataset.data.length
    }

    try {
      // 首先尝试调用边缘函数
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, dataset: datasetInfo })
      })

      if (response.ok) {
        const result = await response.json()
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: result.answer,
          timestamp: new Date().toISOString(),
          insights: result.insights,
          charts: result.charts
        }
        addMessage(aiMessage)

        if (result.charts && onChartGenerated) {
          result.charts.forEach((chart: ChartConfig) => {
            onChartGenerated(chart)
          })
        }
      } else {
        throw new Error('Edge function not available')
      }
    } catch {
      // 边缘函数不可用，尝试直接调用通义千问API
      if (!apiKey) {
        // 没有API密钥，使用本地分析并提示用户配置
        const localResult = performLocalAnalysis(question, dataset)
        localResult.content += '\n\n💡 **提示**：配置通义千问API密钥后可获得更智能的AI分析。点击右上角"设置"按钮配置。'
        addMessage(localResult)

        if (localResult.charts && onChartGenerated) {
          localResult.charts.forEach((chart) => {
            onChartGenerated(chart)
          })
        }
      } else {
        try {
          const answer = await callQwenAPI(question, datasetInfo)
          const insights = extractInsights(answer)
          const charts = suggestCharts(question, dataset)

          const aiMessage: Message = {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: answer,
            timestamp: new Date().toISOString(),
            insights: insights.length > 0 ? insights : undefined,
            charts: charts.length > 0 ? charts : undefined
          }
          addMessage(aiMessage)

          if (charts.length > 0 && onChartGenerated) {
            charts.forEach((chart) => {
              onChartGenerated(chart)
            })
          }
        } catch (apiError) {
          console.error('API调用失败:', apiError)
          // 最后回退到本地分析
          const localResult = performLocalAnalysis(question, dataset)
          localResult.content += '\n\n⚠️ AI分析暂时不可用，已使用本地分析。请检查API密钥是否正确。'
          addMessage(localResult)

          if (localResult.charts && onChartGenerated) {
            localResult.charts.forEach((chart) => {
              onChartGenerated(chart)
            })
          }
        }
      }
    } finally {
      setIsAnalyzing(false)
    }
  }

  const performLocalAnalysis = (question: string, data: typeof dataset): Message => {
    if (!data) {
      return {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: '请先上传数据后再进行分析。',
        timestamp: new Date().toISOString()
      }
    }

    const types = detectColumnTypes(data.data)
    const numericCols = Object.entries(types).filter(([, t]) => t === 'number').map(([c]) => c)
    const categoryCols = Object.entries(types).filter(([, t]) => t === 'string' || t === 'date').map(([c]) => c)

    const lowerQuestion = question.toLowerCase()
    let answer = ''
    const insights: string[] = []
    const charts: ChartConfig[] = []

    // Analyze based on question keywords
    if (lowerQuestion.includes('最高') || lowerQuestion.includes('最大') || lowerQuestion.includes('max')) {
      // Find maximum
      if (numericCols.length > 0) {
        const col = numericCols.find((c) => lowerQuestion.includes(c.toLowerCase())) || numericCols[0]
        const stats = calculateStats(data.data, col)

        if (categoryCols.length > 0) {
          const groupCol = categoryCols[0]
          const aggregated = aggregateData(data.data, groupCol, col, 'sum')
          const maxItem = aggregated.reduce((max, item) => item.value > max.value ? item : max, aggregated[0])

          answer = `根据数据分析，**${groupCol}**为"**${maxItem.name}**"时，**${col}**最高，达到 **${maxItem.value.toLocaleString()}**。`
          insights.push(`${col}的整体最大值为 ${stats.max.toLocaleString()}`)
          insights.push(`${col}的平均值为 ${stats.avg.toLocaleString()}`)

          charts.push({
            id: `bar-${Date.now()}`,
            type: 'bar',
            title: `各${groupCol}的${col}对比`,
            xField: groupCol,
            yField: col,
            aggregation: 'sum'
          })
        } else {
          answer = `**${col}**的最大值为 **${stats.max.toLocaleString()}**。`
        }
      }
    } else if (lowerQuestion.includes('最低') || lowerQuestion.includes('最小') || lowerQuestion.includes('min')) {
      // Find minimum
      if (numericCols.length > 0) {
        const col = numericCols.find((c) => lowerQuestion.includes(c.toLowerCase())) || numericCols[0]
        const stats = calculateStats(data.data, col)

        if (categoryCols.length > 0) {
          const groupCol = categoryCols[0]
          const aggregated = aggregateData(data.data, groupCol, col, 'sum')
          const minItem = aggregated.reduce((min, item) => item.value < min.value ? item : min, aggregated[0])

          answer = `根据数据分析，**${groupCol}**为"**${minItem.name}**"时，**${col}**最低，为 **${minItem.value.toLocaleString()}**。`
          insights.push(`${col}的整体最小值为 ${stats.min.toLocaleString()}`)
        } else {
          answer = `**${col}**的最小值为 **${stats.min.toLocaleString()}**。`
        }
      }
    } else if (lowerQuestion.includes('趋势') || lowerQuestion.includes('变化') || lowerQuestion.includes('trend')) {
      // Trend analysis
      if (numericCols.length > 0 && categoryCols.length > 0) {
        const valueCol = numericCols[0]
        const timeCol = categoryCols.find((c) => types[c] === 'date') || categoryCols[0]
        const aggregated = aggregateData(data.data, timeCol, valueCol, 'sum')

        const values = aggregated.map((d) => d.value)
        const trend = values[values.length - 1] > values[0] ? '上升' : values[values.length - 1] < values[0] ? '下降' : '平稳'
        const changeRate = ((values[values.length - 1] - values[0]) / values[0] * 100).toFixed(1)

        answer = `**${valueCol}**整体呈**${trend}**趋势，从首期到末期变化率为 **${changeRate}%**。`
        insights.push(`数据共有 ${aggregated.length} 个时间点`)
        insights.push(`最高点: ${Math.max(...values).toLocaleString()}`)
        insights.push(`最低点: ${Math.min(...values).toLocaleString()}`)

        charts.push({
          id: `line-${Date.now()}`,
          type: 'line',
          title: `${valueCol}趋势图`,
          xField: timeCol,
          yField: valueCol,
          aggregation: 'sum'
        })
      }
    } else if (lowerQuestion.includes('占比') || lowerQuestion.includes('比例') || lowerQuestion.includes('分布')) {
      // Distribution analysis
      if (categoryCols.length > 0 && numericCols.length > 0) {
        const groupCol = categoryCols.find((c) => lowerQuestion.includes(c.toLowerCase())) || categoryCols[0]
        const valueCol = numericCols[0]
        const aggregated = aggregateData(data.data, groupCol, valueCol, 'sum')
        const total = aggregated.reduce((s, d) => s + d.value, 0)

        const topItems = [...aggregated].sort((a, b) => b.value - a.value).slice(0, 3)
        answer = `**${groupCol}**的${valueCol}分布如下：\n\n`
        topItems.forEach((item, i) => {
          const percent = (item.value / total * 100).toFixed(1)
          answer += `${i + 1}. **${item.name}**: ${item.value.toLocaleString()} (${percent}%)\n`
        })

        insights.push(`共有 ${aggregated.length} 个类别`)
        insights.push(`总计: ${total.toLocaleString()}`)

        charts.push({
          id: `pie-${Date.now()}`,
          type: 'pie',
          title: `${groupCol}占比分布`,
          xField: groupCol,
          yField: valueCol,
          aggregation: 'sum'
        })
      }
    } else if (lowerQuestion.includes('平均') || lowerQuestion.includes('均值') || lowerQuestion.includes('avg')) {
      // Average analysis
      if (numericCols.length > 0) {
        const col = numericCols.find((c) => lowerQuestion.includes(c.toLowerCase())) || numericCols[0]
        const stats = calculateStats(data.data, col)

        answer = `**${col}**的平均值为 **${stats.avg.toLocaleString()}**。`
        insights.push(`最大值: ${stats.max.toLocaleString()}`)
        insights.push(`最小值: ${stats.min.toLocaleString()}`)
        insights.push(`中位数: ${stats.median.toLocaleString()}`)
        insights.push(`数据量: ${stats.count} 条`)
      }
    } else if (lowerQuestion.includes('总') || lowerQuestion.includes('合计') || lowerQuestion.includes('sum')) {
      // Sum analysis
      if (numericCols.length > 0) {
        const col = numericCols.find((c) => lowerQuestion.includes(c.toLowerCase())) || numericCols[0]
        const stats = calculateStats(data.data, col)

        answer = `**${col}**的总和为 **${stats.sum.toLocaleString()}**。`
        insights.push(`数据量: ${stats.count} 条`)
        insights.push(`平均值: ${stats.avg.toLocaleString()}`)
      }
    } else if (lowerQuestion.includes('有哪些') || lowerQuestion.includes('类别') || lowerQuestion.includes('种类')) {
      // Category listing
      if (categoryCols.length > 0) {
        const col = categoryCols.find((c) => lowerQuestion.includes(c.toLowerCase())) || categoryCols[0]
        const uniqueValues = getUniqueValues(data.data, col)

        answer = `**${col}**共有 **${uniqueValues.length}** 个不同的值：\n\n`
        uniqueValues.slice(0, 10).forEach((v, i) => {
          answer += `${i + 1}. ${v}\n`
        })
        if (uniqueValues.length > 10) {
          answer += `\n...等共 ${uniqueValues.length} 个`
        }
      }
    } else {
      // General overview
      answer = `我来为您分析这份数据：\n\n`
      answer += `**数据概览**\n`
      answer += `- 数据名称: ${data.name}\n`
      answer += `- 总行数: ${data.data.length}\n`
      answer += `- 列数: ${data.columns.length}\n\n`

      answer += `**数值列统计**\n`
      numericCols.slice(0, 3).forEach((col) => {
        const stats = calculateStats(data.data, col)
        answer += `- ${col}: 总和 ${stats.sum.toLocaleString()}, 平均 ${stats.avg.toLocaleString()}\n`
      })

      insights.push('您可以问我更具体的问题，例如：')
      insights.push('"销售额最高的是哪个月？"')
      insights.push('"分析一下趋势变化"')
      insights.push('"各产品的占比是多少？"')

      // Add a default chart
      if (categoryCols.length > 0 && numericCols.length > 0) {
        charts.push({
          id: `bar-${Date.now()}`,
          type: 'bar',
          title: `${categoryCols[0]}的${numericCols[0]}分布`,
          xField: categoryCols[0],
          yField: numericCols[0],
          aggregation: 'sum'
        })
      }
    }

    return {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content: answer,
      timestamp: new Date().toISOString(),
      insights: insights.length > 0 ? insights : undefined,
      charts: charts.length > 0 ? charts : undefined
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isAnalyzing) return

    analyzeQuestion(input.trim())
    setInput('')
  }

  const quickQuestions = [
    '数据概览',
    '最高值分析',
    '趋势变化',
    '占比分布'
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-dark-700">
        <Sparkles className="w-5 h-5 text-accent-cyan" />
        <span className="font-medium">AI 数据助手</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-primary-400 mx-auto mb-4 opacity-50" />
            <p className="text-dark-400 mb-4">用自然语言提问，AI帮你分析数据</p>

            {/* API密钥状态提示 */}
            {!apiKey && (
              <div className="mb-4 mx-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <div className="flex items-center justify-center gap-2 text-sm text-orange-400">
                  <Key className="w-4 h-4" />
                  <span>未配置API密钥，AI功能受限</span>
                </div>
                {onNeedApiKey && (
                  <button
                    onClick={onNeedApiKey}
                    className="mt-2 text-xs text-orange-300 hover:text-orange-200 underline"
                  >
                    点击配置通义千问API密钥
                  </button>
                )}
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-2">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => analyzeQuestion(q)}
                  className="px-3 py-1.5 text-sm rounded-full bg-dark-800 hover:bg-dark-700 text-dark-300 hover:text-white transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}

                <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-primary-500 text-white'
                        : 'bg-dark-800 text-dark-100'
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {msg.content.split('**').map((part, i) =>
                        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                      )}
                    </div>
                  </div>

                  {/* Insights */}
                  {msg.insights && msg.insights.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {msg.insights.map((insight, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 text-xs text-dark-400"
                        >
                          {insight.startsWith('您可以') || insight.startsWith('"') ? (
                            <Lightbulb className="w-3 h-3 mt-0.5 text-yellow-500" />
                          ) : insight.includes('最') ? (
                            <TrendingUp className="w-3 h-3 mt-0.5 text-green-500" />
                          ) : (
                            <AlertTriangle className="w-3 h-3 mt-0.5 text-blue-500" />
                          )}
                          <span>{insight}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-dark-700 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-dark-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            </div>
            <div className="bg-dark-800 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-dark-400">
                <span>正在分析数据</span>
                <span className="animate-pulse">...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-dark-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入问题，例如：销售额最高的是哪个月？"
            className="flex-1 input-field text-sm"
            disabled={isAnalyzing || !dataset}
          />
          <button
            type="submit"
            disabled={isAnalyzing || !input.trim() || !dataset}
            className="btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  )
}

export default AIChatPanel
