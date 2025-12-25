import { DataSet, ChartConfig } from '../store/useAppStore'

// Detect column types
export function detectColumnTypes(data: Record<string, unknown>[]): Record<string, 'number' | 'string' | 'date'> {
  if (data.length === 0) return {}

  const types: Record<string, 'number' | 'string' | 'date'> = {}
  const sample = data.slice(0, 100)

  Object.keys(data[0]).forEach((col) => {
    const values = sample.map((row) => row[col]).filter((v) => v != null)

    // Check if all values are numbers
    const allNumbers = values.every((v) => typeof v === 'number' || !isNaN(Number(v)))
    if (allNumbers && values.length > 0) {
      types[col] = 'number'
      return
    }

    // Check if values look like dates
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}$/,
      /^\d{4}\/\d{2}\/\d{2}$/,
      /^\d{2}-\d{2}-\d{4}$/,
      /^\d{1,2}月$/,
      /^Q[1-4]$/
    ]
    const looksLikeDate = values.some((v) =>
      typeof v === 'string' && datePatterns.some((p) => p.test(v))
    )
    if (looksLikeDate) {
      types[col] = 'date'
      return
    }

    types[col] = 'string'
  })

  return types
}

// Get unique values for a column
export function getUniqueValues(data: Record<string, unknown>[], column: string): unknown[] {
  const values = new Set(data.map((row) => row[column]))
  return Array.from(values).filter((v) => v != null)
}

// Aggregate data
export function aggregateData(
  data: Record<string, unknown>[],
  groupBy: string,
  valueField: string,
  aggregation: 'sum' | 'avg' | 'count' | 'max' | 'min' = 'sum'
): { name: string; value: number }[] {
  const groups: Record<string, number[]> = {}

  data.forEach((row) => {
    const key = String(row[groupBy] ?? 'Unknown')
    const value = Number(row[valueField]) || 0

    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(value)
  })

  return Object.entries(groups).map(([name, values]) => {
    let value: number
    switch (aggregation) {
      case 'sum':
        value = values.reduce((a, b) => a + b, 0)
        break
      case 'avg':
        value = values.reduce((a, b) => a + b, 0) / values.length
        break
      case 'count':
        value = values.length
        break
      case 'max':
        value = Math.max(...values)
        break
      case 'min':
        value = Math.min(...values)
        break
    }
    return { name, value: Math.round(value * 100) / 100 }
  })
}

// Generate chart recommendations based on data
export function recommendCharts(dataset: DataSet): ChartConfig[] {
  const types = detectColumnTypes(dataset.data)
  const numericCols = Object.entries(types).filter(([, t]) => t === 'number').map(([c]) => c)
  const categoryCols = Object.entries(types).filter(([, t]) => t === 'string' || t === 'date').map(([c]) => c)

  const recommendations: ChartConfig[] = []

  // Bar chart for category vs numeric
  if (categoryCols.length > 0 && numericCols.length > 0) {
    recommendations.push({
      id: `bar-${Date.now()}`,
      type: 'bar',
      title: `${categoryCols[0]}的${numericCols[0]}分布`,
      xField: categoryCols[0],
      yField: numericCols[0],
      aggregation: 'sum'
    })
  }

  // Line chart for time series
  const timeCols = Object.entries(types).filter(([, t]) => t === 'date').map(([c]) => c)
  if (timeCols.length > 0 && numericCols.length > 0) {
    recommendations.push({
      id: `line-${Date.now() + 1}`,
      type: 'line',
      title: `${numericCols[0]}趋势`,
      xField: timeCols[0],
      yField: numericCols[0],
      aggregation: 'sum'
    })
  }

  // Pie chart for category distribution
  if (categoryCols.length > 0 && numericCols.length > 0) {
    recommendations.push({
      id: `pie-${Date.now() + 2}`,
      type: 'pie',
      title: `${categoryCols[0]}占比`,
      xField: categoryCols[0],
      yField: numericCols[0],
      aggregation: 'sum'
    })
  }

  // Scatter plot for two numeric columns
  if (numericCols.length >= 2) {
    recommendations.push({
      id: `scatter-${Date.now() + 3}`,
      type: 'scatter',
      title: `${numericCols[0]} vs ${numericCols[1]}`,
      xField: numericCols[0],
      yField: numericCols[1]
    })
  }

  return recommendations
}

// Calculate basic statistics
export function calculateStats(data: Record<string, unknown>[], column: string): {
  min: number
  max: number
  avg: number
  sum: number
  count: number
  median: number
} {
  const values = data
    .map((row) => Number(row[column]))
    .filter((v) => !isNaN(v))
    .sort((a, b) => a - b)

  if (values.length === 0) {
    return { min: 0, max: 0, avg: 0, sum: 0, count: 0, median: 0 }
  }

  const sum = values.reduce((a, b) => a + b, 0)
  const avg = sum / values.length
  const median = values.length % 2 === 0
    ? (values[values.length / 2 - 1] + values[values.length / 2]) / 2
    : values[Math.floor(values.length / 2)]

  return {
    min: values[0],
    max: values[values.length - 1],
    avg: Math.round(avg * 100) / 100,
    sum: Math.round(sum * 100) / 100,
    count: values.length,
    median: Math.round(median * 100) / 100
  }
}

// Find correlations between numeric columns
export function findCorrelations(
  data: Record<string, unknown>[],
  col1: string,
  col2: string
): number {
  const pairs = data
    .map((row) => [Number(row[col1]), Number(row[col2])])
    .filter(([a, b]) => !isNaN(a) && !isNaN(b))

  if (pairs.length < 2) return 0

  const n = pairs.length
  const sumX = pairs.reduce((s, [x]) => s + x, 0)
  const sumY = pairs.reduce((s, [, y]) => s + y, 0)
  const sumXY = pairs.reduce((s, [x, y]) => s + x * y, 0)
  const sumX2 = pairs.reduce((s, [x]) => s + x * x, 0)
  const sumY2 = pairs.reduce((s, [, y]) => s + y * y, 0)

  const numerator = n * sumXY - sumX * sumY
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))

  if (denominator === 0) return 0
  return Math.round((numerator / denominator) * 100) / 100
}

// Format number for display
export function formatNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B'
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toFixed(2)
}
