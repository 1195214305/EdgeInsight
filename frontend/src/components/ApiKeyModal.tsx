import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Key, Eye, EyeOff, ExternalLink, Check, AlertCircle, Loader2 } from 'lucide-react'

interface ApiKeyModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (apiKey: string) => void
  currentKey?: string
}

const ApiKeyModal = ({ isOpen, onClose, onSave, currentKey }: ApiKeyModalProps) => {
  const [apiKey, setApiKey] = useState(currentKey || '')
  const [showKey, setShowKey] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)

  useEffect(() => {
    if (isOpen && currentKey) {
      setApiKey(currentKey)
    }
  }, [isOpen, currentKey])

  const handleTest = async () => {
    if (!apiKey.trim()) return

    setTesting(true)
    setTestResult(null)

    try {
      const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'qwen-turbo',
          messages: [{ role: 'user', content: '你好' }],
          max_tokens: 10
        })
      })

      if (response.ok) {
        setTestResult('success')
      } else {
        setTestResult('error')
      }
    } catch {
      setTestResult('error')
    } finally {
      setTesting(false)
    }
  }

  const handleSave = () => {
    if (apiKey.trim()) {
      onSave(apiKey.trim())
      onClose()
    }
  }

  const maskKey = (key: string) => {
    if (key.length <= 8) return key
    return key.slice(0, 4) + '****' + key.slice(-4)
  }

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="w-full max-w-lg bg-dark-900 rounded-2xl border border-dark-700 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-dark-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                  <Key className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">API 密钥设置</h2>
                  <p className="text-sm text-dark-400">配置通义千问 API 密钥</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-dark-800 transition-colors"
              >
                <X className="w-5 h-5 text-dark-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Info */}
              <div className="p-4 rounded-xl bg-primary-500/5 border border-primary-500/20">
                <p className="text-sm text-dark-300 leading-relaxed">
                  EdgeInsight 使用通义千问大模型进行智能数据分析。请输入您的 API 密钥以启用 AI 功能。
                  密钥仅保存在您的浏览器本地，不会上传到服务器。
                </p>
              </div>

              {/* API Key Input */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  通义千问 API 密钥
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value)
                      setTestResult(null)
                    }}
                    placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-4 py-3 pr-24 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      onClick={() => setShowKey(!showKey)}
                      className="p-2 rounded-lg hover:bg-dark-700 transition-colors"
                      title={showKey ? '隐藏密钥' : '显示密钥'}
                    >
                      {showKey ? (
                        <EyeOff className="w-4 h-4 text-dark-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-dark-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Test Result */}
                {testResult && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-3 flex items-center gap-2 text-sm ${
                      testResult === 'success' ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {testResult === 'success' ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>API 密钥验证成功</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4" />
                        <span>API 密钥无效，请检查后重试</span>
                      </>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Get API Key Link */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-dark-400">还没有 API 密钥？</span>
                <a
                  href="https://bailian.console.aliyun.com/?apiKey=1#/api-key"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary-400 hover:text-primary-300 transition-colors"
                >
                  前往阿里云百炼获取
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Current Key Display */}
              {currentKey && (
                <div className="p-3 rounded-lg bg-dark-800/50 border border-dark-700">
                  <div className="text-xs text-dark-500 mb-1">当前已保存的密钥</div>
                  <div className="text-sm text-dark-300 font-mono">{maskKey(currentKey)}</div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-dark-700 bg-dark-800/30">
              <button
                onClick={handleTest}
                disabled={!apiKey.trim() || testing}
                className="flex items-center gap-2 px-4 py-2 text-sm text-dark-300 hover:text-white hover:bg-dark-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    验证中...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    测试密钥
                  </>
                )}
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-dark-300 hover:text-white transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  disabled={!apiKey.trim()}
                  className="btn-primary text-sm px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  保存
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ApiKeyModal
