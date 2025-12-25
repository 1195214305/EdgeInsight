// EdgeInsight - 边缘缓存管理
// 用于缓存热门查询和AI响应

// 缓存配置
const CACHE_CONFIG = {
  // 热门问题缓存
  HOT_QUESTIONS: [
    '数据概览',
    '最高值分析',
    '趋势变化',
    '占比分布',
    '平均值',
    '总和'
  ],
  // 缓存时间（秒）
  TTL: {
    AI_RESPONSE: 300,      // AI响应缓存5分钟
    CHART_CONFIG: 600,     // 图表配置缓存10分钟
    STATIC_ASSET: 86400    // 静态资源缓存1天
  }
}

// 生成缓存键
function generateCacheKey(type, params) {
  const sortedParams = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&')
  return `edge-insight:${type}:${sortedParams}`
}

// 检查是否应该缓存
function shouldCache(question) {
  const q = question.toLowerCase()
  return CACHE_CONFIG.HOT_QUESTIONS.some(hot => q.includes(hot.toLowerCase()))
}

// 边缘缓存中间件
async function cacheMiddleware(request, env, ctx, handler) {
  // 只缓存GET请求和特定POST请求
  if (request.method !== 'GET' && request.method !== 'POST') {
    return handler(request, env, ctx)
  }

  const url = new URL(request.url)

  // 对于分析请求，检查是否可以使用缓存
  if (url.pathname === '/api/analyze' && request.method === 'POST') {
    const body = await request.clone().json()
    const { question, dataset } = body

    // 检查是否是热门问题
    if (shouldCache(question)) {
      const cacheKey = generateCacheKey('analyze', {
        question: question.substring(0, 50),
        datasetName: dataset?.name || 'unknown',
        columns: dataset?.columns?.join(',') || ''
      })

      // 尝试从缓存获取
      const cache = caches.default
      const cachedResponse = await cache.match(new Request(cacheKey))

      if (cachedResponse) {
        console.log('Cache hit:', cacheKey)
        return cachedResponse
      }

      // 执行原始请求
      const response = await handler(request, env, ctx)

      // 缓存成功的响应
      if (response.ok) {
        const responseToCache = response.clone()
        ctx.waitUntil(
          cache.put(
            new Request(cacheKey),
            new Response(responseToCache.body, {
              headers: {
                ...Object.fromEntries(responseToCache.headers),
                'Cache-Control': `max-age=${CACHE_CONFIG.TTL.AI_RESPONSE}`,
                'X-Cache-Status': 'MISS'
              }
            })
          )
        )
      }

      return response
    }
  }

  // 对于静态资源，使用更长的缓存时间
  if (url.pathname.match(/\.(js|css|png|jpg|svg|woff2?)$/)) {
    const response = await handler(request, env, ctx)
    return new Response(response.body, {
      headers: {
        ...Object.fromEntries(response.headers),
        'Cache-Control': `public, max-age=${CACHE_CONFIG.TTL.STATIC_ASSET}`
      }
    })
  }

  return handler(request, env, ctx)
}

// 预热缓存
async function warmupCache(env, ctx, dataset) {
  const warmupQuestions = CACHE_CONFIG.HOT_QUESTIONS

  for (const question of warmupQuestions) {
    const cacheKey = generateCacheKey('analyze', {
      question,
      datasetName: dataset?.name || 'unknown',
      columns: dataset?.columns?.join(',') || ''
    })

    // 检查是否已缓存
    const cache = caches.default
    const cached = await cache.match(new Request(cacheKey))

    if (!cached) {
      // 预热缓存（异步执行）
      ctx.waitUntil(
        fetch(new Request(`${env.ORIGIN_URL}/api/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question, dataset })
        }))
      )
    }
  }
}

// 清除缓存
async function clearCache(pattern) {
  const cache = caches.default
  const keys = await cache.keys()

  let cleared = 0
  for (const key of keys) {
    if (key.url.includes(pattern)) {
      await cache.delete(key)
      cleared++
    }
  }

  return { cleared }
}

// 获取缓存统计
async function getCacheStats() {
  // 注意：实际的缓存统计需要根据ESA的API来实现
  return {
    enabled: true,
    hotQuestions: CACHE_CONFIG.HOT_QUESTIONS.length,
    ttl: CACHE_CONFIG.TTL
  }
}

export {
  CACHE_CONFIG,
  generateCacheKey,
  shouldCache,
  cacheMiddleware,
  warmupCache,
  clearCache,
  getCacheStats
}
