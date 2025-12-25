import { create } from 'zustand'

export interface DataSet {
  name: string
  columns: string[]
  data: Record<string, unknown>[]
  uploadTime: string
}

export interface ChartConfig {
  id: string
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'radar' | 'heatmap' | 'funnel' | 'gauge'
  title: string
  xField?: string
  yField?: string
  seriesField?: string
  aggregation?: 'sum' | 'avg' | 'count' | 'max' | 'min'
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  charts?: ChartConfig[]
  insights?: string[]
}

interface AppState {
  dataset: DataSet | null
  charts: ChartConfig[]
  messages: Message[]
  isAnalyzing: boolean
  selectedChart: string | null

  setDataset: (dataset: DataSet | null) => void
  addChart: (chart: ChartConfig) => void
  removeChart: (id: string) => void
  updateChart: (id: string, config: Partial<ChartConfig>) => void
  addMessage: (message: Message) => void
  setIsAnalyzing: (isAnalyzing: boolean) => void
  setSelectedChart: (id: string | null) => void
  clearAll: () => void
}

export const useAppStore = create<AppState>((set) => ({
  dataset: null,
  charts: [],
  messages: [],
  isAnalyzing: false,
  selectedChart: null,

  setDataset: (dataset) => set({ dataset }),

  addChart: (chart) => set((state) => ({
    charts: [...state.charts, chart]
  })),

  removeChart: (id) => set((state) => ({
    charts: state.charts.filter((c) => c.id !== id)
  })),

  updateChart: (id, config) => set((state) => ({
    charts: state.charts.map((c) =>
      c.id === id ? { ...c, ...config } : c
    )
  })),

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),

  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),

  setSelectedChart: (selectedChart) => set({ selectedChart }),

  clearAll: () => set({
    dataset: null,
    charts: [],
    messages: [],
    isAnalyzing: false,
    selectedChart: null
  })
}))
