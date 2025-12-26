# EdgeInsight - 边缘AI数据洞察平台

<div align="center">

**用自然语言与数据对话，AI自动生成专业级数据分析报告**

[![在线演示](https://img.shields.io/badge/在线演示-EdgeInsight-orange?style=for-the-badge)](https://edgeinsight.8a5362ec.er.aliyun-esa.net)
[![GitHub](https://img.shields.io/badge/GitHub-源码-black?style=for-the-badge&logo=github)](https://github.com/1195214305/EdgeInsight)

</div>

---

## 本项目由[阿里云ESA](https://www.aliyun.com/product/esa)提供加速、计算和保护

![阿里云ESA](https://img.alicdn.com/imgextra/i3/O1CN01H1UU3i1Cti9lYtFrs_!!6000000000139-2-tps-7534-844.png)

---

## 项目简介

**EdgeInsight** 是一个基于阿里云 ESA 边缘计算平台构建的智能数据分析应用。用户只需上传数据文件（CSV/Excel/JSON），即可通过**自然语言**与数据对话，AI 会自动分析数据并生成专业的可视化图表和分析报告。

### 核心特点

- **零门槛使用**：无需编程、无需安装、无需注册，打开浏览器即可使用
- **自然语言交互**：用中文提问，如"销售额最高的是哪个月？"
- **智能图表推荐**：AI 根据数据类型自动推荐最合适的可视化方式
- **一键导出报告**：生成专业级 PDF 数据分析报告

---

## 创意卓越

### 1. 让数据分析"说人话"

传统数据分析工具需要学习 SQL、Python 或复杂的操作界面。EdgeInsight 让用户直接用中文提问：

- "哪个产品销量最高？"
- "分析一下各地区的销售占比"
- "数据有什么异常吗？"

AI 自动理解意图，生成分析结果和图表。

### 2. 双模式智能分析

- **边缘 AI 模式**：通过边缘函数调用通义千问 API，API Key 安全存储在边缘
- **本地分析模式**：用户配置自己的 API Key，直接在浏览器调用

### 3. 专业级可视化

支持 8+ 种图表类型，每种图表都有明确的适用场景：

| 图表类型 | 适用场景 |
|---------|---------|
| 柱状图 | 对比不同类别的数值 |
| 折线图 | 展示数据趋势变化 |
| 饼图 | 展示占比分布 |
| 散点图 | 分析两个变量关系 |
| 面积图 | 强调数量变化 |
| 雷达图 | 多维度对比 |
| 漏斗图 | 展示转化流程 |
| 仪表盘 | 展示指标完成度 |

### 4. 温暖专业的视觉设计

采用暖色系（橙色/琥珀色）配色方案，营造温暖、专业的视觉体验，告别千篇一律的"AI味"蓝紫渐变。

---

## 应用价值

### 1. 企业数据分析

- 销售数据快速分析
- 业务指标可视化
- 数据驱动决策支持
- 减少对专业分析师的依赖

### 2. 个人数据探索

- 个人财务数据分析
- 学习成绩趋势分析
- 运动健康数据可视化

### 3. 快速汇报场景

- 临时数据分析需求
- 会议前快速生成图表
- 一键导出 PDF 报告

### 4. 数据隐私保护

- 数据仅在浏览器和边缘节点处理
- 不落盘到中心服务器
- 临时存储自动过期删除

---

## How We Use Edge

### 边缘函数在本项目中的不可替代性

EdgeInsight 深度整合了阿里云 ESA 的完整边缘生态，边缘计算是本项目的核心架构支撑：

### 1. API Key 安全代理（核心价值）

```
用户浏览器 → ESA 边缘函数 → 通义千问 API
              ↑
         API Key 安全存储
```

**为什么必须用边缘函数？**
- 通义千问 API Key 不能暴露在前端代码中
- 传统方案需要自建后端服务器，成本高、延迟大
- 边缘函数让 API Key 安全存储在边缘环境变量，用户无感知
- 请求在离用户最近的边缘节点处理，延迟最低

### 2. 流式响应处理

```javascript
// 边缘函数实现流式 AI 响应
export async function onRequest(context) {
  const response = await fetch(QWEN_API_URL, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${context.env.API_KEY}` },
    body: JSON.stringify({ stream: true, ... })
  });

  // 边缘函数直接转发流式响应
  return new Response(response.body, {
    headers: { 'Content-Type': 'text/event-stream' }
  });
}
```

**边缘函数优势**：
- 支持 ReadableStream 流式响应
- AI 分析结果实时展示，用户体验更好
- 边缘节点处理，减少回源延迟

### 3. 边缘 KV 存储

```javascript
// 用户数据临时存储
await context.env.EDGE_KV.put(
  `session:${sessionId}`,
  JSON.stringify(userData),
  { expirationTtl: 3600 } // 1小时自动过期
);
```

**使用场景**：
- 用户上传数据的临时存储
- 分析结果缓存
- 会话状态管理

### 4. 智能缓存策略

```javascript
// 热门问题缓存
const cacheKey = `analysis:${hashQuestion(question)}`;
const cached = await caches.default.match(cacheKey);
if (cached) return cached;

// 执行分析后缓存结果
const response = await analyzeData(question, data);
ctx.waitUntil(caches.default.put(cacheKey, response.clone()));
```

**缓存优化**：
- 相同问题秒级响应
- 减少 AI API 调用成本
- 提升用户体验

### 5. 全球 CDN 加速

- 前端静态资源部署在 ESA Pages
- 全球边缘节点自动分发
- 自动 HTTPS 证书管理
- 首屏加载 < 1.5s

### 边缘架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                         用户浏览器                               │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  React 18 + TypeScript + TailwindCSS + ECharts            │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   阿里云 ESA Pages (全球 CDN)                    │
│  • 静态资源托管    • 全球边缘节点加速    • 自动 HTTPS            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      边缘函数层 (Edge Functions)                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ /api/analyze│  │ /api/chat   │  │ /api/health │             │
│  │ • AI分析    │  │ • 流式对话  │  │ • 健康检查  │             │
│  │ • 图表推荐  │  │ • 上下文    │  │ • 边缘信息  │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                                │
              ┌─────────────────┼─────────────────┐
              ▼                 ▼                 ▼
┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
│    边缘 KV 存储    │ │     边缘缓存      │ │   通义千问 API    │
│ • 数据临时存储    │ │ • 热门查询缓存    │ │ • 数据分析        │
│ • 分析结果缓存    │ │ • AI响应缓存      │ │ • 自然语言理解    │
└───────────────────┘ └───────────────────┘ └───────────────────┘
```

---

## 技术栈

| 层级 | 技术选型 | 说明 |
|-----|---------|------|
| **前端框架** | React 18 + TypeScript | 现代化组件开发 |
| **构建工具** | Vite 5 | 极速开发体验 |
| **样式方案** | TailwindCSS 3 | 原子化 CSS |
| **图表库** | ECharts 5 | 专业数据可视化 |
| **动画库** | Framer Motion | 流畅交互动画 |
| **状态管理** | Zustand | 轻量级状态管理 |
| **数据解析** | PapaParse + XLSX | CSV/Excel 解析 |
| **PDF导出** | jsPDF + html2canvas | 报告生成 |
| **边缘托管** | 阿里云 ESA Pages | 全球 CDN 加速 |
| **边缘计算** | ESA Edge Functions | 边缘函数 |
| **边缘存储** | ESA Edge KV | 键值存储 |
| **AI 能力** | 通义千问 qwen-turbo | 大语言模型 |

---

## 快速开始

### 在线体验

访问 [https://edgeinsight.8a5362ec.er.aliyun-esa.net](https://edgeinsight.8a5362ec.er.aliyun-esa.net)

### 本地开发

```bash
# 克隆项目
git clone https://github.com/1195214305/EdgeInsight.git
cd EdgeInsight

# 安装依赖
cd frontend
npm install

# 启动开发服务器
npm run dev
```

---

## 性能指标

| 指标 | 数值 | 说明 |
|-----|------|------|
| 首屏加载 | < 1.5s | 边缘 CDN 加速 |
| AI 响应 | < 2s | 边缘函数 + 缓存 |
| 图表渲染 | < 100ms | Canvas 渲染 |
| Lighthouse | 95+ | 性能评分 |

---

## 项目结构

```
EdgeInsight/
├── frontend/                    # 前端应用
│   ├── src/
│   │   ├── components/         # React 组件
│   │   ├── pages/              # 页面组件
│   │   ├── store/              # 状态管理
│   │   └── utils/              # 工具函数
│   └── public/                 # 静态资源
├── functions/                   # 边缘函数
│   └── api/
│       ├── analyze.js          # AI 分析接口
│       ├── chat.js             # 对话接口
│       └── health.js           # 健康检查
└── README.md
```

---

## 开源协议

MIT License

---

<div align="center">

**EdgeInsight** - 让数据分析触手可及

基于阿里云 ESA Pages 边缘计算构建

2025 阿里云 ESA Pages 边缘开发大赛参赛作品

</div>
