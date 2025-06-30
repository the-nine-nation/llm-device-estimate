import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 格式化显存大小
export function formatMemorySize(gb: number): string {
  if (gb < 1) {
    return `${(gb * 1024).toFixed(1)} MB`
  } else if (gb < 1024) {
    return `${gb.toFixed(2)} GB`
  } else {
    return `${(gb / 1024).toFixed(2)} TB`
  }
}

// 格式化参数数量
export function formatParameterCount(params: number): string {
  if (params < 1e6) {
    return `${(params / 1e3).toFixed(1)}K`
  } else if (params < 1e9) {
    return `${(params / 1e6).toFixed(1)}M`
  } else {
    return `${(params / 1e9).toFixed(1)}B`
  }
}

// 格式化数字
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('zh-CN').format(num)
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * 格式化时间长度
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds.toFixed(1)}秒`
  } else if (seconds < 3600) {
    return `${(seconds / 60).toFixed(1)}分钟`
  } else if (seconds < 86400) {
    return `${(seconds / 3600).toFixed(1)}小时`
  } else {
    return `${(seconds / 86400).toFixed(1)}天`
  }
} 