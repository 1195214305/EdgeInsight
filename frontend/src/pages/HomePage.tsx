import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  MessageSquare,
  BarChart3,
  FileText,
  ArrowRight,
  Database,
  Zap,
  Globe,
  Shield,
  TrendingUp,
  Activity,
  Play,
  Check,
  Settings,
  Key
} from 'lucide-react'
import DataUploader from '../components/DataUploader'
import ApiKeyModal from '../components/ApiKeyModal'

const HomePage = () => {
  const navigate = useNavigate()
  const [showUploader, setShowUploader] = useState(false)
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const [apiKey, setApiKey] = useState<string>('')

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

  const features = [
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: '自然语言交互',
      description: '用中文提问，AI自动理解并分析数据'
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: '智能图表推荐',
      description: '根据数据类型自动推荐最合适的可视化方式'
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: 'AI深度洞察',
      description: '自动发现数据规律、异常值和趋势预测'
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: '一键生成报告',
      description: '导出专业级PDF数据分析报告'
    }
  ]

  const techStack = [
    { icon: <Globe className="w-5 h-5" />, label: 'ESA Pages', desc: '全球CDN加速' },
    { icon: <Zap className="w-5 h-5" />, label: '边缘函数', desc: '毫秒级响应' },
    { icon: <Database className="w-5 h-5" />, label: '边缘KV', desc: '数据临时存储' },
    { icon: <Shield className="w-5 h-5" />, label: '边缘缓存', desc: '智能缓存策略' }
  ]

  const handleDataUploaded = (data: unknown) => {
    localStorage.setItem('edgeInsightData', JSON.stringify(data))
    navigate('/workspace')
  }

  return (
    <div className="min-h-screen bg-dark-950 relative">
      {/* 简洁的背景 */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-cyan/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 data-grid opacity-30" />
      </div>

      {/* 导航栏 */}
      <header className="relative z-10 px-6 py-4 border-b border-dark-800/50">
        <nav className="max-w-6xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-primary-500 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-white">EdgeInsight</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            {/* API密钥状态 */}
            <button
              onClick={() => setShowApiKeyModal(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                apiKey
                  ? 'bg-primary-500/10 text-primary-400 hover:bg-primary-500/20'
                  : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
              }`}
            >
              <Key className="w-4 h-4" />
              <span className="hidden sm:inline">{apiKey ? 'AI已配置' : '配置API'}</span>
            </button>
            <button
              onClick={() => setShowApiKeyModal(true)}
              className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button onClick={() => setShowUploader(true)} className="btn-primary text-sm py-2">
              开始分析
            </button>
          </motion.div>
        </nav>
      </header>

      {/* 主内容 */}
      <main className="relative z-10 px-6 pt-20 pb-24">
        <div className="max-w-6xl mx-auto">
          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 text-primary-400 text-sm mb-6"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>基于阿里云 ESA 边缘计算</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-white"
            >
              用<span className="gradient-text">自然语言</span>与数据对话
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-dark-400 mb-10 leading-relaxed"
            >
              上传数据，用中文提问，AI自动生成专业级数据分析报告
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button
                onClick={() => setShowUploader(true)}
                className="group flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-all"
              >
                <Upload className="w-5 h-5" />
                上传数据开始分析
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => {
                  const demoData = generateDemoData()
                  localStorage.setItem('edgeInsightData', JSON.stringify(demoData))
                  navigate('/workspace')
                }}
                className="flex items-center gap-2 px-6 py-3 bg-dark-800 hover:bg-dark-700 text-white font-medium rounded-lg transition-all border border-dark-700"
              >
                <Play className="w-5 h-5" />
                体验演示数据
              </button>
            </motion.div>

            {/* API配置提示 */}
            {!apiKey && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 inline-flex items-center gap-2 text-sm text-amber-400"
              >
                <Key className="w-4 h-4" />
                <span>请先配置通义千问API密钥以启用AI分析功能</span>
                <button
                  onClick={() => setShowApiKeyModal(true)}
                  className="underline hover:text-amber-300"
                >
                  立即配置
                </button>
              </motion.div>
            )}
          </div>

          {/* 数据统计 */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto mb-24"
          >
            {[
              { value: '20+', label: '图表类型' },
              { value: '<100ms', label: '响应延迟' },
              { value: '100%', label: '数据隐私' },
              { value: '0', label: '安装成本' }
            ].map((stat, index) => (
              <div key={index} className="text-center p-4">
                <div className="text-2xl md:text-3xl font-bold text-primary-400 mb-1">
                  {stat.value}
                </div>
                <div className="text-dark-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* 功能特性 */}
          <section className="mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                核心功能
              </h2>
              <p className="text-dark-400">
                AI驱动的智能数据分析
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-5 rounded-xl bg-dark-900/50 border border-dark-800 hover:border-dark-700 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center mb-4 text-primary-400">
                    {feature.icon}
                  </div>
                  <h3 className="text-base font-medium text-white mb-2">{feature.title}</h3>
                  <p className="text-dark-400 text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* 技术架构 */}
          <section className="mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                技术架构
              </h2>
              <p className="text-dark-400">
                基于阿里云 ESA 边缘计算构建
              </p>
            </motion.div>

            <div className="max-w-3xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {techStack.map((tech, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center p-4 rounded-xl bg-dark-900/50 border border-dark-800"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center mx-auto mb-3 text-primary-400">
                      {tech.icon}
                    </div>
                    <div className="font-medium text-white text-sm mb-1">{tech.label}</div>
                    <div className="text-dark-500 text-xs">{tech.desc}</div>
                  </motion.div>
                ))}
              </div>

              {/* 架构流程 */}
              <div className="flex items-center justify-center gap-2 flex-wrap text-sm">
                <span className="px-3 py-1.5 rounded bg-dark-800 text-dark-300">用户浏览器</span>
                <ArrowRight className="w-4 h-4 text-dark-600" />
                <span className="px-3 py-1.5 rounded bg-primary-500/20 text-primary-400">ESA CDN</span>
                <ArrowRight className="w-4 h-4 text-dark-600" />
                <span className="px-3 py-1.5 rounded bg-accent-orange/20 text-accent-orange">边缘函数</span>
                <ArrowRight className="w-4 h-4 text-dark-600" />
                <span className="px-3 py-1.5 rounded bg-accent-teal/20 text-accent-teal">通义千问</span>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-xl mx-auto p-8 rounded-2xl bg-dark-900/50 border border-dark-800"
            >
              <h2 className="text-2xl font-bold text-white mb-3">
                准备好开始了吗？
              </h2>
              <p className="text-dark-400 mb-6">
                上传您的数据，体验AI驱动的智能数据分析
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => setShowUploader(true)}
                  className="btn-primary"
                >
                  立即开始分析
                </button>
                <div className="flex items-center gap-2 text-dark-500 text-sm">
                  <Check className="w-4 h-4 text-primary-400" />
                  <span>无需注册，免费使用</span>
                </div>
              </div>
            </motion.div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-dark-800 py-6 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-dark-500 text-sm">
            <Activity className="w-4 h-4" />
            <span>EdgeInsight - 边缘AI数据洞察平台</span>
          </div>
          <div className="text-dark-600 text-sm">
            由<a href="https://www.aliyun.com/product/esa" className="text-primary-400 hover:underline mx-1">阿里云ESA</a>提供支持
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AnimatePresence>
        {showUploader && (
          <DataUploader
            onClose={() => setShowUploader(false)}
            onDataUploaded={handleDataUploaded}
          />
        )}
      </AnimatePresence>

      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onSave={handleSaveApiKey}
        currentKey={apiKey}
      />
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
