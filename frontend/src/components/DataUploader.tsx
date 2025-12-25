import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, FileSpreadsheet, FileJson, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

interface DataUploaderProps {
  onClose: () => void
  onDataUploaded: (data: DataSet) => void
}

export interface DataSet {
  name: string
  columns: string[]
  data: Record<string, unknown>[]
  uploadTime: string
}

const DataUploader = ({ onClose, onDataUploaded }: DataUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<DataSet | null>(null)

  const processFile = useCallback(async (file: File) => {
    setIsProcessing(true)
    setError(null)

    try {
      const extension = file.name.split('.').pop()?.toLowerCase()
      let data: Record<string, unknown>[] = []
      let columns: string[] = []

      if (extension === 'csv') {
        const text = await file.text()
        const result = Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true
        })
        data = result.data as Record<string, unknown>[]
        columns = result.meta.fields || []
      } else if (extension === 'xlsx' || extension === 'xls') {
        const buffer = await file.arrayBuffer()
        const workbook = XLSX.read(buffer, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        data = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[]
        if (data.length > 0) {
          columns = Object.keys(data[0])
        }
      } else if (extension === 'json') {
        const text = await file.text()
        const parsed = JSON.parse(text)
        if (Array.isArray(parsed)) {
          data = parsed
        } else if (parsed.data && Array.isArray(parsed.data)) {
          data = parsed.data
        } else {
          throw new Error('JSON格式不正确，需要数组或包含data数组的对象')
        }
        if (data.length > 0) {
          columns = Object.keys(data[0])
        }
      } else {
        throw new Error('不支持的文件格式，请上传 CSV、Excel 或 JSON 文件')
      }

      if (data.length === 0) {
        throw new Error('文件中没有数据')
      }

      const dataset: DataSet = {
        name: file.name,
        columns,
        data,
        uploadTime: new Date().toISOString()
      }

      setPreview(dataset)
    } catch (err) {
      setError(err instanceof Error ? err.message : '文件处理失败')
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      processFile(file)
    }
  }, [processFile])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }, [processFile])

  const handleConfirm = () => {
    if (preview) {
      onDataUploaded(preview)
    }
  }

  const handlePasteData = () => {
    const textarea = document.createElement('textarea')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.focus()

    document.execCommand('paste')

    setTimeout(() => {
      const text = textarea.value
      document.body.removeChild(textarea)

      if (text) {
        try {
          // Try parsing as JSON first
          const jsonData = JSON.parse(text)
          if (Array.isArray(jsonData) && jsonData.length > 0) {
            const dataset: DataSet = {
              name: '粘贴的数据',
              columns: Object.keys(jsonData[0]),
              data: jsonData,
              uploadTime: new Date().toISOString()
            }
            setPreview(dataset)
            return
          }
        } catch {
          // Not JSON, try CSV
          const result = Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true
          })
          if (result.data.length > 0) {
            const dataset: DataSet = {
              name: '粘贴的数据',
              columns: result.meta.fields || [],
              data: result.data as Record<string, unknown>[],
              uploadTime: new Date().toISOString()
            }
            setPreview(dataset)
            return
          }
        }
        setError('无法解析粘贴的数据')
      }
    }, 100)
  }

  return (
    <AnimatePresence>
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
          className="glass-card w-full max-w-2xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">上传数据</h2>
            <button onClick={onClose} className="btn-ghost p-2">
              <X className="w-5 h-5" />
            </button>
          </div>

          {!preview ? (
            <>
              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`
                  relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200
                  ${isDragging
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-dark-600 hover:border-dark-500 hover:bg-dark-800/30'
                  }
                `}
              >
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls,.json"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                {isProcessing ? (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-dark-300">正在处理文件...</p>
                  </div>
                ) : (
                  <>
                    <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-primary-400' : 'text-dark-400'}`} />
                    <p className="text-lg mb-2">
                      {isDragging ? '释放文件以上传' : '拖拽文件到此处，或点击选择'}
                    </p>
                    <p className="text-dark-400 text-sm">
                      支持 CSV、Excel (.xlsx/.xls)、JSON 格式
                    </p>
                  </>
                )}
              </div>

              {/* Supported formats */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-800/50">
                  <FileSpreadsheet className="w-8 h-8 text-green-500" />
                  <div>
                    <div className="font-medium text-sm">CSV</div>
                    <div className="text-dark-400 text-xs">逗号分隔</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-800/50">
                  <FileSpreadsheet className="w-8 h-8 text-blue-500" />
                  <div>
                    <div className="font-medium text-sm">Excel</div>
                    <div className="text-dark-400 text-xs">.xlsx / .xls</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-800/50">
                  <FileJson className="w-8 h-8 text-yellow-500" />
                  <div>
                    <div className="font-medium text-sm">JSON</div>
                    <div className="text-dark-400 text-xs">数组格式</div>
                  </div>
                </div>
              </div>

              {/* Paste option */}
              <div className="mt-6 pt-6 border-t border-dark-700">
                <button
                  onClick={handlePasteData}
                  className="w-full btn-secondary flex items-center justify-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  从剪贴板粘贴数据
                </button>
              </div>

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-red-400">上传失败</div>
                    <div className="text-dark-300 text-sm mt-1">{error}</div>
                  </div>
                </motion.div>
              )}
            </>
          ) : (
            <>
              {/* Preview */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <div>
                    <div className="font-medium">{preview.name}</div>
                    <div className="text-dark-400 text-sm">
                      {preview.data.length} 行数据，{preview.columns.length} 列
                    </div>
                  </div>
                </div>

                {/* Column preview */}
                <div className="mb-4">
                  <div className="text-sm text-dark-400 mb-2">数据列</div>
                  <div className="flex flex-wrap gap-2">
                    {preview.columns.map((col, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full bg-primary-500/10 text-primary-400 text-sm border border-primary-500/20"
                      >
                        {col}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Data preview table */}
                <div className="text-sm text-dark-400 mb-2">数据预览（前5行）</div>
                <div className="overflow-x-auto rounded-lg border border-dark-700">
                  <table className="w-full text-sm">
                    <thead className="bg-dark-800">
                      <tr>
                        {preview.columns.map((col, i) => (
                          <th key={i} className="px-4 py-2 text-left font-medium text-dark-300 whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.data.slice(0, 5).map((row, i) => (
                        <tr key={i} className="border-t border-dark-700">
                          {preview.columns.map((col, j) => (
                            <td key={j} className="px-4 py-2 text-dark-200 whitespace-nowrap">
                              {String(row[col] ?? '-')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => setPreview(null)}
                  className="flex-1 btn-secondary"
                >
                  重新选择
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 btn-primary"
                >
                  开始分析
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default DataUploader
