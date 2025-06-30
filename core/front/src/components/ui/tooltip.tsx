import React, { useState } from 'react'
import { cn } from '@/lib/utils'

interface TooltipProps {
  content: string
  children?: React.ReactNode
  className?: string
  side?: 'top' | 'bottom' | 'left' | 'right'
}

export function Tooltip({ content, children, className, side = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    const id = setTimeout(() => {
      setIsVisible(true)
    }, 1000) // 1秒延迟
    setTimeoutId(id)
  }

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
    setIsVisible(false)
  }

  const sideClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  }

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-800',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-800',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-800',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-800'
  }

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn("cursor-help", className)}
      >
        {children}
      </div>
      
      {isVisible && (
        <div className={cn(
          "absolute z-50 px-4 py-3 text-xs text-white bg-gray-900 rounded-lg shadow-xl min-w-[300px] max-w-[450px] border border-gray-700 whitespace-pre-line font-mono leading-relaxed",
          sideClasses[side]
        )}>
          {content}
          <div className={cn("absolute w-0 h-0 border-4", arrowClasses[side].replace('blue-600', 'gray-900'))} />
        </div>
      )}
    </div>
  )
}

interface HelpIconProps {
  content: string
  className?: string
  side?: 'top' | 'bottom' | 'left' | 'right'
}

export function HelpIcon({ content, className, side = 'top' }: HelpIconProps) {
  return (
    <Tooltip content={content} side={side}>
      <span className={cn(
        "inline-flex items-center justify-center w-4 h-4 ml-1 text-xs text-gray-400 bg-gray-100 rounded-full hover:text-gray-600 hover:bg-gray-200 transition-colors",
        className
      )}>
        ?
      </span>
    </Tooltip>
  )
} 