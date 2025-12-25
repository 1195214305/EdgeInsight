import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  MessageSquare,
  BarChart3,
  FileText,
  Sparkles,
  ArrowRight,
  Database,
  Zap,
  Globe,
  Shield,
  TrendingUp,
  PieChart,
  LineChart,
  Activity,
  ChevronRight,
  Play,
  Check
} from 'lucide-react'
import DataUploader from '../components/DataUploader'

const HomePage = () => {
  const navigate = useNavigate()
  const [showUploader, setShowUploader] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)

  // 自动切换特性展示
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const features = [
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: '自然语言交互',
      description: '用中文提问，AI自动理解并分析数据',
      detail: '无需学习复杂的查询语言，直接用自然语言描述你想了解的内容',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: '智能图表推荐',
      description: '根据数据类型自动推荐最合适的可视化方式',
      detail: '支持柱状图、折线图、饼图、散点图等20+种图表类型',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'AI深度洞察',
      description: '自动发现数据规律、异常值和趋势预测',
      detail: '基于通义千问大模型，提供专业级数据分析建议',
      color: 'from-cyan-500 to-blue-600'
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: '一键生成报告',
      description: '导出专业级PDF数据分析报告',
      detail: '包含数据概览、图表、洞察和建议的完整报告',
      color: 'from-emerald-500 to-teal-600'
    }
  ]

  const techStack = [
    { icon: <Globe className="w-5 h-5" />, label: 'ESA Pages', desc: '全球CDN加速' },
    { icon: <Zap className="w-5 h-5" />, label: '边缘函数', desc: '毫秒级响应' },
    { icon: <Database className="w-5 h-5" />, label: '边缘KV', desc: '数据临时存储' },
    { icon: <Shield className="w-5 h-5" />, label: '边缘缓存', desc: '智能缓存策略' }
  ]

  const steps = [
    { num: '01', title: '上传数据', desc: '支持CSV、Excel、JSON格式' },
    { num: '02', title: '提出问题', desc: '用自然语言描述分析需求' },
    { num: '03', title: '获取洞察', desc: 'AI自动生成分析结果和图表' }
  ]

  const handleDataUploaded = (data: unknown) => {
    localStorage.setItem('edgeInsightData', JSON.stringify(data))
    navigate('/workspace')
  }

  return (
    <div className="min-h-screen bg-dark-950 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0">
        {/* 渐变光晕 */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent-purple/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-cyan/5 rounded-full blur-[200px]" />

        {/* 网格背景 */}
        <div className="absolute inset-0 data-grid opacity-20" />
      </div>

      {/* 导航栏 */}
      <header className="relative z-10 px-6 py-5">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">EdgeInsight</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-6"
          >
            <a href="#features" className="text-dark-300 hover:text-white transition-colors text-sm">功能特性</a>
            <a href="#tech" className="text-dark-300 hover:text-white transition-colors text-sm">技术架构</a>
            <button onClick={() => setShowUploader(true)} className="btn-primary text-sm">
              开始分析
            </button>
          </motion.div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 px-6 pt-16 pb-24">
        <div className="max-w-7xl mx-auto">
          {/* Hero 内容 */}
          <div className="text-center max-w-4xl mx-auto mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm mb-8"
            >
              <Sparkles className="w-4 h-4" />
              <span>基于阿里云 ESA 边缘计算构建</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold mb-8 leading-tight"
            >
              <span className="text-white">用</span>
              <span className="gradient-text">自然语言</span>
              <br />
              <span className="text-white">与数据对话</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-dark-300 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              上传数据，用中文提问，AI自动生成专业级数据分析报告。
              <br />
              无需编程、无需安装，打开即用。
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button
                onClick={() => setShowUploader(true)}
                className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-105"
              >
                <Upload className="w-5 h-5" />
                上传数据开始分析
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => {
                  const demoData = generateDemoData()
                  localStorage.setItem('edgeInsightData', JSON.stringify(demoData))
                  navigate('/workspace')
                }}
                className="flex items-center gap-3 px-8 py-4 bg-dark-800/80 hover:bg-dark-700 text-white font-medium rounded-xl transition-all duration-300 border border-dark-600 hover:border-dark-500"
              >
                <Play className="w-5 h-5" />
                体验演示数据
              </button>
            </motion.div>
          </div>

          {/* 数据统计 */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto mb-24"
          >
            {[
              { value: '20+', label: '图表类型' },
              { value: '<100ms', label: '响应延迟' },
              { value: '100%', label: '数据隐私' },
              { value: '0', label: '安装成本' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                  {stat.value}
                </div>
                <div className="text-dark-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* 功能特性 Section */}
          <section id="features" className="mb-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-sm text-primary-400 tracking-widest uppercase mb-4">Features</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                强大的功能特性
              </h2>
              <p className="text-dark-400 max-w-2xl mx-auto">
                结合AI大模型与边缘计算，为您提供极速、智能、安全的数据分析体验
              </p>
            </motion.div>

            {/* 特性展示 - 左右布局 */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* 左侧：特性列表 */}
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setActiveFeature(index)}
                    className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                      activeFeature === index
                        ? 'bg-dark-800/80 border border-primary-500/30 shadow-lg shadow-primary-500/10'
                        : 'bg-dark-900/50 border border-dark-700/50 hover:bg-dark-800/50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center flex-shrink-0`}>
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">{feature.title}</h3>
                        <p className="text-dark-400 text-sm">{feature.description}</p>
                        <AnimatePresence>
                          {activeFeature === index && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="text-dark-300 text-sm mt-3 pt-3 border-t border-dark-700"
                            >
                              {feature.detail}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-dark-500 transition-transform ${activeFeature === index ? 'rotate-90 text-primary-400' : ''}`} />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* 右侧：预览图 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="glass-card gradient-border overflow-hidden">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="ml-4 text-dark-400 text-sm">EdgeInsight Workspace</span>
                  </div>
                  <div className="grid grid-cols-12 gap-4 h-[350px]">
                    {/* 左侧面板 */}
                    <div className="col-span-3 bg-dark-800/50 rounded-xl p-4">
                      <div className="text-xs text-dark-400 mb-3 uppercase tracking-wide">数据源</div>
                      <div className="space-y-2">
                        {['销售数据.csv', '用户增长.xlsx', '产品分析.json'].map((file, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-dark-700/50 text-xs">
                            <Database className="w-3 h-3 text-primary-400" />
                            <span className="truncate text-dark-300">{file}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 中间图表区 */}
                    <div className="col-span-6 bg-dark-800/50 rounded-xl p-4">
                      <div className="grid grid-cols-2 gap-3 h-full">
                        <div className="bg-dark-900/50 rounded-lg p-3 flex items-center justify-center">
                          <BarChart3 className="w-12 h-12 text-primary-400 opacity-60" />
                        </div>
                        <div className="bg-dark-900/50 rounded-lg p-3 flex items-center justify-center">
                          <LineChart className="w-12 h-12 text-accent-cyan opacity-60" />
                        </div>
                        <div className="bg-dark-900/50 rounded-lg p-3 flex items-center justify-center">
                          <PieChart className="w-12 h-12 text-accent-purple opacity-60" />
                        </div>
                        <div className="bg-dark-900/50 rounded-lg p-3 flex items-center justify-center">
                          <TrendingUp className="w-12 h-12 text-emerald-400 opacity-60" />
                        </div>
                      </div>
                    </div>

                    {/* 右侧AI面板 */}
                    <div className="col-span-3 bg-dark-800/50 rounded-xl p-4 flex flex-col">
                      <div className="text-xs text-dark-400 mb-3 flex items-center gap-2 uppercase tracking-wide">
                        <Sparkles className="w-3 h-3 text-accent-cyan" />
                        AI 助手
                      </div>
                      <div className="flex-1 space-y-2 overflow-hidden">
                        <div className="bg-dark-700/50 rounded-lg p-2 text-xs">
                          <span className="text-dark-400">你：</span>
                          <span className="text-dark-200">销售额最高的是哪个月？</span>
                        </div>
                        <div className="bg-primary-500/10 rounded-lg p-2 text-xs border border-primary-500/20">
                          <span className="text-primary-400">AI：</span>
                          <span className="text-dark-200">根据数据分析，12月销售额最高...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* 光晕效果 */}
                <div className="absolute -inset-4 bg-gradient-to-r from-primary-500/10 via-accent-purple/10 to-accent-cyan/10 rounded-3xl blur-2xl -z-10" />
              </motion.div>
            </div>
          </section>

          {/* 使用步骤 */}
          <section className="mb-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-sm text-primary-400 tracking-widest uppercase mb-4">How it works</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                三步开启数据洞察
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="relative"
                >
                  <div className="text-6xl font-bold text-dark-800 mb-4">{step.num}</div>
                  <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-dark-400">{step.desc}</p>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-8 right-0 translate-x-1/2">
                      <ArrowRight className="w-6 h-6 text-dark-700" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </section>

          {/* 技术架构 Section */}
          <section id="tech" className="mb-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-sm text-primary-400 tracking-widest uppercase mb-4">Technology</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                基于阿里云 ESA 构建
              </h2>
              <p className="text-dark-400 max-w-2xl mx-auto">
                深度整合 ESA Pages、边缘函数、边缘KV存储、边缘缓存，打造完整的边缘应用生态
              </p>
            </motion.div>

            <div className="glass-card max-w-4xl mx-auto">
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                {techStack.map((tech, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center p-4"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mx-auto mb-3 text-primary-400">
                      {tech.icon}
                    </div>
                    <div className="font-semibold text-white mb-1">{tech.label}</div>
                    <div className="text-dark-400 text-sm">{tech.desc}</div>
                  </motion.div>
                ))}
              </div>

              {/* 架构流程图 */}
              <div className="pt-8 border-t border-dark-700">
                <div className="text-center text-dark-400 text-sm mb-6">技术架构</div>
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <div className="px-4 py-2 rounded-lg bg-dark-800 text-sm text-dark-300">用户浏览器</div>
                  <ArrowRight className="w-4 h-4 text-dark-500" />
                  <div className="px-4 py-2 rounded-lg bg-primary-500/20 text-primary-400 text-sm border border-primary-500/30">ESA Pages CDN</div>
                  <ArrowRight className="w-4 h-4 text-dark-500" />
                  <div className="px-4 py-2 rounded-lg bg-accent-purple/20 text-accent-purple text-sm border border-accent-purple/30">边缘函数</div>
                  <ArrowRight className="w-4 h-4 text-dark-500" />
                  <div className="px-4 py-2 rounded-lg bg-accent-cyan/20 text-accent-cyan text-sm border border-accent-cyan/30">通义千问 API</div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card gradient-border max-w-3xl mx-auto py-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                准备好开始了吗？
              </h2>
              <p className="text-dark-400 mb-10 max-w-lg mx-auto">
                上传您的数据，体验AI驱动的智能数据分析
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => setShowUploader(true)}
                  className="btn-primary text-lg px-10 py-4"
                >
                  立即开始分析
                </button>
                <div className="flex items-center gap-2 text-dark-400 text-sm">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>无需注册，免费使用</span>
                </div>
              </div>
            </motion.div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-dark-800 py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-dark-400">
              <Activity className="w-5 h-5" />
              <span>EdgeInsight - 边缘AI数据洞察平台</span>
            </div>
            <div className="text-dark-500 text-sm text-center md:text-right">
              本项目由<a href="https://www.aliyun.com/product/esa" className="text-primary-400 hover:underline">阿里云ESA</a>提供加速、计算和保护
            </div>
          </div>
          <div className="mt-4 flex justify-center">
            <img
              src="https://img.alicdn.com/imgextra/i3/O1CN01H1UU3i1Cti9lYtFrs_!!6000000000139-2-tps-7534-844.png"
              alt="阿里云ESA"
              className="h-8 opacity-60 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>
      </footer>

      {/* Data Uploader Modal */}
      <AnimatePresence>
        {showUploader && (
          <DataUploader
            onClose={() => setShowUploader(false)}
            onDataUploaded={handleDataUploaded}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// 生成演示数据
function generateDemoData() {
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  const products = ['产品A', '产品B', '产品C', '产品D']
  const regions = ['华东', '华南', '华北', '西南', '西北']

  const data = []
  for (let i = 0; i < 100; i++) {
    data.push({
      月份: months[Math.floor(Math.random() * 12)],
      产品: products[Math.floor(Math.random() * products.length)],
      地区: regions[Math.floor(Math.random() * regions.length)],
      销售额: Math.floor(Math.random() * 100000) + 10000,
      销量: Math.floor(Math.random() * 1000) + 100,
      利润率: (Math.random() * 0.3 + 0.1).toFixed(2),
      客户数: Math.floor(Math.random() * 500) + 50
    })
  }

  return {
    name: '销售数据示例',
    columns: ['月份', '产品', '地区', '销售额', '销量', '利润率', '客户数'],
    data,
    uploadTime: new Date().toISOString()
  }
}

export default HomePage
