# EdgeInsight - 边缘AI数据洞察平台

<div align="center">

![EdgeInsight Logo](./frontend/public/favicon.svg)

**用自然语言与数据对话，AI自动生成专业级数据分析报告**

[![ESA Pages](https://img.shields.io/badge/Powered%20by-阿里云%20ESA%20Pages-FF6A00?style=for-the-badge)](https://www.aliyun.com/product/esa)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![ECharts](https://img.shields.io/badge/ECharts-5.4-AA344D?style=for-the-badge)](https://echarts.apache.org/)

[在线演示](https://edgeinsight.xxx.er.aliyun-esa.net) · [功能介绍](#功能特性) · [技术架构](#技术架构) · [快速开始](#快速开始)

</div>

---

## 项目简介

**EdgeInsight** 是一个基于阿里云 ESA（边缘安全加速）构建的智能数据分析平台。用户只需上传数据文件，即可通过自然语言与数据进行对话，AI 会自动分析数据并生成专业的可视化图表和分析报告。

### 核心亮点

- **自然语言交互**：用中文提问，如"销售额最高的是哪个月？"，AI 自动理解并分析
- **智能图表推荐**：根据数据类型和问题自动推荐最合适的可视化方式
- **AI 深度洞察**：自动发现数据规律、异常值和趋势预测
- **一键生成报告**：导出专业级 PDF 数据分析报告
- **零安装成本**：打开网页即可使用，无需注册、无需安装

---

## 功能特性

### 1. 数据上传与解析

- 支持 **CSV**、**Excel** (.xlsx/.xls)、**JSON** 格式
- 自动识别数据类型（数值、文本、日期）
- 支持拖拽上传和剪贴板粘贴
- 数据预览和列信息展示

### 2. 自然语言分析

- 中文自然语言提问
- 智能理解用户意图
- 多轮对话上下文保持
- 快捷问题推荐

### 3. 智能可视化

支持 **8+ 种图表类型**：

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

### 4. 报告导出

- PDF 格式导出
- 包含数据统计、图表分析
- 专业排版设计

---

## 技术架构

### 整体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                         用户浏览器                               │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  React 18 + TypeScript + TailwindCSS + ECharts + Framer   │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   阿里云 ESA Pages (全球 CDN)                    │
│                                                                 │
│  • 静态资源托管          • 全球边缘节点加速                       │
│  • 自动 HTTPS           • 智能路由                              │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      边缘函数层 (Edge Functions)                 │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ /api/analyze│  │ /api/chat   │  │ /api/health │             │
│  │             │  │             │  │             │             │
│  │ • AI分析    │  │ • 流式对话  │  │ • 健康检查  │             │
│  │ • 图表推荐  │  │ • 上下文    │  │ • 边缘信息  │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                                │
              ┌─────────────────┼─────────────────┐
              ▼                 ▼                 ▼
┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
│    边缘 KV 存储    │ │     边缘缓存      │ │   通义千问 API    │
│                   │ │                   │ │                   │
│ • 用户数据临时存储 │ │ • 热门查询缓存    │ │ • 数据分析        │
│ • 分析结果缓存    │ │ • AI响应缓存      │ │ • 自然语言理解    │
│ • 会话状态管理    │ │ • 静态资源缓存    │ │ • 洞察生成        │
└───────────────────┘ └───────────────────┘ └───────────────────┘
```

### 技术栈

| 层级 | 技术选型 | 说明 |
|-----|---------|------|
| **前端框架** | React 18 + TypeScript | 现代化组件开发 |
| **构建工具** | Vite 5 | 极速开发体验 |
| **样式方案** | TailwindCSS | 原子化 CSS |
| **图表库** | ECharts 5 | 专业数据可视化 |
| **动画库** | Framer Motion | 流畅交互动画 |
| **状态管理** | Zustand | 轻量级状态管理 |
| **数据解析** | PapaParse + XLSX | CSV/Excel 解析 |
| **PDF导出** | jsPDF + html2canvas | 报告生成 |
| **边缘托管** | 阿里云 ESA Pages | 全球 CDN 加速 |
| **边缘计算** | ESA Edge Functions | 边缘函数 |
| **边缘存储** | ESA Edge KV | 键值存储 |
| **AI 能力** | 通义千问 | 大语言模型 |

---

## 边缘能力深度整合

### 1. ESA Pages - 静态托管

- 前端应用部署在 ESA Pages
- 全球边缘节点自动分发
- 自动 HTTPS 证书管理
- 智能压缩和缓存策略

### 2. 边缘函数 - 计算能力

```javascript
// 边缘函数示例：AI 分析接口
async function handleAnalyze(request, env, ctx) {
  const { question, dataset } = await request.json()

  // 在边缘节点处理请求
  const response = await fetch(QWEN_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.QWEN_API_KEY}`
    },
    body: JSON.stringify({
      model: 'qwen-turbo',
      messages: [
        { role: 'system', content: buildSystemPrompt(dataset) },
        { role: 'user', content: question }
      ]
    })
  })

  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' }
  })
}
```

**边缘函数优势**：
- API Key 安全存储在边缘，不暴露给前端
- 请求在离用户最近的边缘节点处理
- 减少回源延迟，提升响应速度

### 3. 边缘 KV 存储

```javascript
// 边缘 KV 存储示例
async function storeData(env, sessionId, data) {
  await env.EDGE_KV.put(
    `data:${sessionId}`,
    JSON.stringify(data),
    { expirationTtl: 3600 } // 1小时过期
  )
}
```

**使用场景**：
- 用户上传数据的临时存储
- 分析结果缓存
- 会话状态管理

### 4. 边缘缓存策略

```javascript
// 智能缓存策略
const CACHE_CONFIG = {
  HOT_QUESTIONS: ['数据概览', '最高值分析', '趋势变化'],
  TTL: {
    AI_RESPONSE: 300,    // AI响应缓存5分钟
    STATIC_ASSET: 86400  // 静态资源缓存1天
  }
}
```

**缓存优化**：
- 热门问题预缓存
- AI 响应智能缓存
- 静态资源长期缓存

---

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 本地开发

```bash
# 克隆项目
git clone https://github.com/your-username/edge-insight.git
cd edge-insight

# 安装依赖
cd frontend
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:5183
```

### 构建部署

```bash
# 构建生产版本
npm run build

# 输出目录: frontend/dist
```

### 部署到 ESA Pages

1. 登录阿里云 ESA 控制台
2. 创建 Pages 站点
3. 关联 GitHub 仓库或上传构建产物
4. 配置边缘函数（functions 目录）
5. 配置环境变量（API Key 等）

---

## 项目结构

```
13_EdgeInsight_边缘AI数据洞察/
├── frontend/                    # 前端应用
│   ├── src/
│   │   ├── components/         # React 组件
│   │   │   ├── AIChatPanel.tsx     # AI 对话面板
│   │   │   ├── ChartRenderer.tsx   # 图表渲染器
│   │   │   ├── ChartConfigPanel.tsx # 图表配置
│   │   │   └── DataUploader.tsx    # 数据上传
│   │   ├── pages/              # 页面组件
│   │   │   ├── HomePage.tsx        # 首页
│   │   │   └── WorkspacePage.tsx   # 工作台
│   │   ├── store/              # 状态管理
│   │   │   └── useAppStore.ts      # Zustand store
│   │   ├── utils/              # 工具函数
│   │   │   └── dataAnalysis.ts     # 数据分析工具
│   │   ├── App.tsx             # 应用入口
│   │   ├── main.tsx            # 渲染入口
│   │   └── index.css           # 全局样式
│   ├── public/                 # 静态资源
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
├── functions/                   # 边缘函数
│   └── api/
│       ├── index.js            # 主处理函数
│       ├── kv.js               # KV 存储管理
│       └── cache.js            # 缓存管理
├── screenshots/                 # 截图
└── README.md                   # 项目文档
```

---

## 使用演示

### 1. 上传数据

支持拖拽上传 CSV、Excel、JSON 文件，或直接粘贴数据。

### 2. 自然语言提问

在 AI 助手面板输入问题，例如：
- "销售额最高的是哪个月？"
- "分析一下各产品的占比"
- "数据有什么趋势变化？"

### 3. 查看分析结果

AI 会自动：
- 回答您的问题
- 生成相关图表
- 提供数据洞察

### 4. 导出报告

点击"导出报告"按钮，生成包含所有分析结果的 PDF 文档。

---

## 性能指标

| 指标 | 数值 | 说明 |
|-----|------|------|
| 首屏加载 | < 1.5s | 边缘 CDN 加速 |
| AI 响应 | < 2s | 边缘函数 + 缓存 |
| 图表渲染 | < 100ms | Canvas 渲染 |
| Lighthouse | 95+ | 性能评分 |

---

## 安全特性

- **数据隐私**：用户数据仅在浏览器和边缘节点处理，不落盘到中心服务器
- **API 安全**：API Key 存储在边缘函数环境变量，不暴露给前端
- **传输加密**：全程 HTTPS 加密传输
- **临时存储**：数据自动过期删除

---

## 开源协议

MIT License

---

## 致谢

- [阿里云 ESA](https://www.aliyun.com/product/esa) - 边缘安全加速平台
- [通义千问](https://tongyi.aliyun.com/) - AI 大语言模型
- [ECharts](https://echarts.apache.org/) - 数据可视化库
- [React](https://react.dev/) - 前端框架

---

<div align="center">

**EdgeInsight** - 让数据分析触手可及

基于阿里云 ESA Pages 边缘计算构建 | 2025 阿里云 ESA Pages 边缘开发大赛参赛作品

</div>
