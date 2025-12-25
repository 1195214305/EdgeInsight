// EdgeInsight - 边缘KV存储管理
// 用于临时存储用户数据和分析结果

// KV存储键前缀
const KEY_PREFIX = {
  DATA: 'data:',
  ANALYSIS: 'analysis:',
  REPORT: 'report:',
  CACHE: 'cache:'
}

// 数据过期时间（秒）
const TTL = {
  DATA: 3600,        // 数据1小时过期
  ANALYSIS: 1800,    // 分析结果30分钟过期
  REPORT: 7200,      // 报告2小时过期
  CACHE: 300         // 缓存5分钟过期
}

// 存储数据
async function storeData(env, sessionId, data) {
  const key = `${KEY_PREFIX.DATA}${sessionId}`
  const value = JSON.stringify({
    data,
    createdAt: Date.now()
  })

  // 使用边缘KV存储
  if (env.EDGE_KV) {
    await env.EDGE_KV.put(key, value, { expirationTtl: TTL.DATA })
    return { success: true, key }
  }

  // 降级到内存存储（仅用于开发）
  globalThis.__kvStore = globalThis.__kvStore || new Map()
  globalThis.__kvStore.set(key, { value, expireAt: Date.now() + TTL.DATA * 1000 })
  return { success: true, key }
}

// 获取数据
async function getData(env, sessionId) {
  const key = `${KEY_PREFIX.DATA}${sessionId}`

  if (env.EDGE_KV) {
    const value = await env.EDGE_KV.get(key)
    if (value) {
      return JSON.parse(value)
    }
    return null
  }

  // 降级到内存存储
  if (globalThis.__kvStore) {
    const item = globalThis.__kvStore.get(key)
    if (item && item.expireAt > Date.now()) {
      return JSON.parse(item.value)
    }
  }
  return null
}

// 删除数据
async function deleteData(env, sessionId) {
  const key = `${KEY_PREFIX.DATA}${sessionId}`

  if (env.EDGE_KV) {
    await env.EDGE_KV.delete(key)
    return { success: true }
  }

  if (globalThis.__kvStore) {
    globalThis.__kvStore.delete(key)
  }
  return { success: true }
}

// 缓存分析结果
async function cacheAnalysis(env, hash, result) {
  const key = `${KEY_PREFIX.CACHE}${hash}`
  const value = JSON.stringify(result)

  if (env.EDGE_KV) {
    await env.EDGE_KV.put(key, value, { expirationTtl: TTL.CACHE })
    return true
  }

  if (!globalThis.__kvStore) {
    globalThis.__kvStore = new Map()
  }
  globalThis.__kvStore.set(key, { value, expireAt: Date.now() + TTL.CACHE * 1000 })
  return true
}

// 获取缓存的分析结果
async function getCachedAnalysis(env, hash) {
  const key = `${KEY_PREFIX.CACHE}${hash}`

  if (env.EDGE_KV) {
    const value = await env.EDGE_KV.get(key)
    if (value) {
      return JSON.parse(value)
    }
    return null
  }

  if (globalThis.__kvStore) {
    const item = globalThis.__kvStore.get(key)
    if (item && item.expireAt > Date.now()) {
      return JSON.parse(item.value)
    }
  }
  return null
}

// 生成简单哈希
function simpleHash(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

// 处理KV存储请求
async function handleKVRequest(request, env) {
  const url = new URL(request.url)
  const path = url.pathname

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  }

  // 存储数据
  if (path === '/api/kv/store' && request.method === 'POST') {
    try {
      const { sessionId, data } = await request.json()
      const result = await storeData(env, sessionId, data)
      return new Response(JSON.stringify(result), { headers })
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers
      })
    }
  }

  // 获取数据
  if (path === '/api/kv/get' && request.method === 'GET') {
    const sessionId = url.searchParams.get('sessionId')
    if (!sessionId) {
      return new Response(JSON.stringify({ error: '缺少sessionId' }), {
        status: 400,
        headers
      })
    }
    const data = await getData(env, sessionId)
    return new Response(JSON.stringify({ data }), { headers })
  }

  // 删除数据
  if (path === '/api/kv/delete' && request.method === 'DELETE') {
    const sessionId = url.searchParams.get('sessionId')
    if (!sessionId) {
      return new Response(JSON.stringify({ error: '缺少sessionId' }), {
        status: 400,
        headers
      })
    }
    const result = await deleteData(env, sessionId)
    return new Response(JSON.stringify(result), { headers })
  }

  return new Response(JSON.stringify({ error: 'Not Found' }), {
    status: 404,
    headers
  })
}

export {
  storeData,
  getData,
  deleteData,
  cacheAnalysis,
  getCachedAnalysis,
  simpleHash,
  handleKVRequest
}
