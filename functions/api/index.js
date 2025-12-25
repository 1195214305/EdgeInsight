// EdgeInsight - AI数据分析边缘函数
// 基于阿里云ESA边缘函数构建

const QWEN_API_KEY = 'sk-54ae495d0e8e4dfb92607467bfcdf357'
const QWEN_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'

// 处理CORS
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  }
}

// 主处理函数
async function handleRequest(request, env, ctx) {
  const url = new URL(request.url)
  const path = url.pathname

  // 处理CORS预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() })
  }

  // 路由分发
  if (path === '/api/analyze' && request.method === 'POST') {
    return handleAnalyze(request, env, ctx)
  }

  if (path === '/api/chat' && request.method === 'POST') {
    return handleChat(request, env, ctx)
  }

  if (path === '/api/health') {
    return handleHealth(request, env)
  }

  // 404
  return new Response(JSON.stringify({ error: 'Not Found' }), {
    status: 404,
    headers: corsHeaders()
  })
}

// AI数据分析接口
async function handleAnalyze(request, env, ctx) {
  try {
    const body = await request.json()
    const { question, dataset } = body

    if (!question || !dataset) {
      return new Response(JSON.stringify({ error: '缺少必要参数' }), {
        status: 400,
        headers: corsHeaders()
      })
    }

    // 构建分析提示词
    const systemPrompt = `你是一个专业的数据分析师AI助手。用户会给你一份数据的描述和一个问题，请你分析数据并回答问题。

数据信息：
- 数据名称: ${dataset.name}
- 列名: ${dataset.columns.join(', ')}
- 数据量: ${dataset.rowCount} 行
- 样本数据: ${JSON.stringify(dataset.sampleData.slice(0, 10), null, 2)}

请根据数据回答用户的问题。回答要求：
1. 简洁明了，突出关键数据
2. 如果涉及数值，给出具体数字
3. 如果适合可视化，建议合适的图表类型
4. 用中文回答`

    const userPrompt = question

    // 调用通义千问API
    const response = await fetch(QWEN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${QWEN_API_KEY}`
      },
      body: JSON.stringify({
        model: 'qwen-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`API调用失败: ${response.status}`)
    }

    const result = await response.json()
    const answer = result.choices?.[0]?.message?.content || '抱歉，无法生成分析结果'

    // 解析AI回答，提取洞察和图表建议
    const insights = extractInsights(answer)
    const charts = suggestCharts(question, dataset)

    return new Response(JSON.stringify({
      answer,
      insights,
      charts,
      timestamp: new Date().toISOString()
    }), {
      headers: corsHeaders()
    })

  } catch (error) {
    console.error('分析错误:', error)
    return new Response(JSON.stringify({
      error: '分析失败',
      message: error.message
    }), {
      status: 500,
      headers: corsHeaders()
    })
  }
}

// 流式对话接口
async function handleChat(request, env, ctx) {
  try {
    const body = await request.json()
    const { messages, dataset } = body

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: '缺少消息' }), {
        status: 400,
        headers: corsHeaders()
      })
    }

    // 构建系统提示
    let systemContent = '你是EdgeInsight的AI数据分析助手，帮助用户分析和理解数据。'
    if (dataset) {
      systemContent += `\n\n当前数据集: ${dataset.name}, 包含 ${dataset.columns.length} 列: ${dataset.columns.join(', ')}`
    }

    const apiMessages = [
      { role: 'system', content: systemContent },
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ]

    // 调用API
    const response = await fetch(QWEN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${QWEN_API_KEY}`
      },
      body: JSON.stringify({
        model: 'qwen-turbo',
        messages: apiMessages,
        max_tokens: 800,
        temperature: 0.7,
        stream: false
      })
    })

    if (!response.ok) {
      throw new Error(`API调用失败: ${response.status}`)
    }

    const result = await response.json()
    const content = result.choices?.[0]?.message?.content || '抱歉，无法生成回复'

    return new Response(JSON.stringify({
      content,
      timestamp: new Date().toISOString()
    }), {
      headers: corsHeaders()
    })

  } catch (error) {
    console.error('对话错误:', error)
    return new Response(JSON.stringify({
      error: '对话失败',
      message: error.message
    }), {
      status: 500,
      headers: corsHeaders()
    })
  }
}

// 健康检查接口
async function handleHealth(request, env) {
  const geo = request.cf || {}

  return new Response(JSON.stringify({
    status: 'ok',
    timestamp: new Date().toISOString(),
    edge: {
      colo: geo.colo || 'unknown',
      country: geo.country || 'unknown',
      city: geo.city || 'unknown',
      region: geo.region || 'unknown'
    },
    version: '1.0.0'
  }), {
    headers: corsHeaders()
  })
}

// 从AI回答中提取洞察
function extractInsights(answer) {
  const insights = []

  // 提取数字相关的洞察
  const numberMatches = answer.match(/[\d,]+\.?\d*/g)
  if (numberMatches && numberMatches.length > 0) {
    insights.push(`发现 ${numberMatches.length} 个关键数值`)
  }

  // 提取趋势相关词汇
  if (answer.includes('增长') || answer.includes('上升')) {
    insights.push('数据呈上升趋势')
  } else if (answer.includes('下降') || answer.includes('减少')) {
    insights.push('数据呈下降趋势')
  }

  // 提取最大最小值
  if (answer.includes('最高') || answer.includes('最大')) {
    insights.push('已识别最大值')
  }
  if (answer.includes('最低') || answer.includes('最小')) {
    insights.push('已识别最小值')
  }

  return insights
}

// 根据问题建议图表
function suggestCharts(question, dataset) {
  const charts = []
  const q = question.toLowerCase()

  const numericCols = dataset.columns.filter(col => {
    const sample = dataset.sampleData[0]
    return sample && typeof sample[col] === 'number'
  })

  const categoryCols = dataset.columns.filter(col => {
    const sample = dataset.sampleData[0]
    return sample && typeof sample[col] === 'string'
  })

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

// 导出处理函数
export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env, ctx)
  }
}
