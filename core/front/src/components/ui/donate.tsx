'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, Coffee, X } from 'lucide-react'

interface DonateProps {
  className?: string
  compact?: boolean
}

export function Donate({ className, compact = false }: DonateProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (compact) {
    return (
      <div className={className}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(true)}
          className="text-pink-600 border-pink-200 hover:bg-pink-50 hover:border-pink-300"
        >
          <Heart className="w-4 h-4 mr-1" />
          赞赏支持
        </Button>
        
        {isExpanded && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 overflow-y-auto">
            <div className="bg-white rounded-lg p-4 max-w-sm w-full relative max-h-[90vh] overflow-y-auto my-auto">
                              <button
                  onClick={() => setIsExpanded(false)}
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 z-[10000] bg-white rounded-full shadow-sm"
                >
                <X className="w-5 h-5" />
              </button>
              <DonateCard compact={true} />
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={className}>
      <DonateCard />
    </div>
  )
}

function DonateCard({ compact: isCompactModal = false }: { compact?: boolean }) {
  return (
    <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50">
      <CardHeader className={`text-center ${isCompactModal ? 'pb-2' : 'pb-4'}`}>
        <CardTitle className={`flex items-center justify-center gap-2 text-pink-700 ${isCompactModal ? 'text-lg' : ''}`}>
          <Coffee className={`${isCompactModal ? 'w-4 h-4' : 'w-5 h-5'}`} />
          请开发者喝杯咖啡
        </CardTitle>
        <p className={`text-gray-600 ${isCompactModal ? 'text-xs mt-1' : 'text-sm mt-2'}`}>
          如果这个工具对您有帮助，欢迎赞赏支持 ☕
        </p>
      </CardHeader>
      <CardContent className={`text-center ${isCompactModal ? 'space-y-2' : 'space-y-4'}`}>
        <div className="relative inline-block">
          <img
            src="/donate.png"
            alt="赞赏码"
            className={`mx-auto rounded-lg shadow-md border border-gray-200 ${
              isCompactModal ? 'w-36 h-36' : 'w-48 h-48'
            }`}
          />
          <div className="absolute -bottom-1 -right-1 bg-pink-500 text-white text-xs px-2 py-1 rounded-full">
            微信/支付宝
          </div>
        </div>
        <div className={isCompactModal ? 'space-y-1' : 'space-y-2'}>
          <p className="text-xs text-gray-500">
            扫描二维码，选择金额随心赞赏
          </p>
          <div className="flex items-center justify-center gap-2 text-pink-600">
            <Heart className="w-4 h-4 fill-current" />
            <span className="text-sm font-medium">感谢您的支持</span>
            <Heart className="w-4 h-4 fill-current" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default Donate 