'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HelpIcon } from '@/components/ui/tooltip'
import { formatMemorySize, formatNumber } from '@/lib/utils'
import { TrainingResponse, InferenceResponse, GPUInfo } from '@/types/api'

// GPU推荐卡片
interface GPURecommendationProps {
  gpus: GPUInfo[]
  title?: string
}

export function GPURecommendation({ gpus, title = 'GPU推荐' }: GPURecommendationProps) {
  if (!gpus || gpus.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {gpus.slice(0, 5).map((gpu, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg border bg-card"
            >
              <div className="flex-1">
                <div className="font-medium">{gpu.name}</div>
                <div className="text-sm text-muted-foreground">
                  {formatMemorySize(gpu.memory_gb)} 显存
                  {gpu.memory_bandwidth_gb_s && (
                    <span className="ml-2">
                      • {gpu.memory_bandwidth_gb_s} GB/s 带宽
                    </span>
                  )}
                  {parseFloat(gpu.compute_capability) >= 7.0 && (
                    <span className="ml-2">• Tensor Cores</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <Badge variant={index === 0 ? 'default' : 'secondary'}>
                  推荐 #{index + 1}
                </Badge>
                                                        {gpu.fp16_tflops && (
                                            <div className="text-sm text-muted-foreground mt-1">
                                                {formatNumber(gpu.fp16_tflops)} TFLOPS FP16
                                            </div>
                                        )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// 显存分解展示
interface MemoryBreakdownProps {
  breakdown: Record<string, number>
  total: number
}

export function MemoryBreakdown({ breakdown, total }: MemoryBreakdownProps) {
  const items = Object.entries(breakdown).filter(([_, value]) => value > 0)
  
  const colors = [
    'bg-blue-500',
    'bg-green-500', 
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500'
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">显存分解</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 总览 */}
          <div className="text-center">
            <div className="text-2xl font-bold">{formatMemorySize(total)}</div>
            <div className="text-sm text-muted-foreground">总显存需求</div>
          </div>

          {/* 进度条 */}
          <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
            <div className="flex h-4 rounded-full overflow-hidden">
              {items.map(([name, value], index) => {
                const percentage = (value / total) * 100
                return (
                  <div
                    key={name}
                    className={colors[index % colors.length]}
                    style={{ width: `${percentage}%` }}
                    title={`${name}: ${formatMemorySize(value)} (${percentage.toFixed(1)}%)`}
                  />
                )
              })}
            </div>
          </div>

          {/* 详细列表 */}
          <div className="space-y-2">
            {items.map(([name, value], index) => {
              const percentage = (value / total) * 100
              const displayName = {
                model_weights: '模型权重',
                activations: '激活值',
                optimizer_states: '优化器状态',
                gradients: '梯度',
                kv_cache: 'KV Cache',
                framework_overhead: '框架开销',
                backend_overhead: '后端开销'
              }[name] || name

              // 为每个组件定义详细的计算公式说明
              const helpContent = {
                model_weights: `
模型权重显存计算公式：
• 全参数微调：参数量 × 精度字节数
• LoRA微调：(原模型参数 + LoRA参数) × 精度字节数

其中：
- FP32: 4字节/参数
- FP16/BF16: 2字节/参数
- LoRA参数 = rank × (input_dim + output_dim) × 适配层数

例如：7B模型 FP16 = 7,000,000,000 × 2字节 = 14GB
                `,
                activations: `
激活值显存计算公式：
• 基础激活值 = batch_size × seq_len × hidden_size × num_layers × bytes_per_element
• 注意力激活值 = batch_size × num_heads × seq_len² × num_layers × bytes_per_element

优化技术影响：
- 梯度检查点：减少70%激活值显存
- Flash Attention 2：减少30%-60%注意力内存
- Unsloth：减少75%激活值显存

例如：batch=8, seq=2048, hidden=4096, layers=32, FP16
基础：8×2048×4096×32×2 = 4.3GB
                `,
                optimizer_states: `
优化器状态显存计算公式：
• 可训练参数量 × 精度字节数 × 优化器倍数

优化器倍数：
- AdamW/Adam: 2倍 (保存momentum和variance)
- SGD: 1倍 (只保存momentum)

LoRA训练时：
- 全参数：所有模型参数
- LoRA：只有LoRA新增参数

DeepSpeed ZeRO分片：
- Stage 1/2/3: 在多GPU间分片，减少单卡占用
                `,
                gradients: `
梯度显存计算公式：
• 可训练参数量 × 精度字节数

训练方法影响：
- 全参数微调：所有模型参数的梯度
- LoRA微调：只计算LoRA参数的梯度

DeepSpeed ZeRO分片：
- Stage 2/3: 梯度在多GPU间分片

例如：7B模型 FP16 梯度 = 7,000,000,000 × 2字节 = 14GB
LoRA rank=32时：约58M参数 × 2字节 = 116MB
                `,
                kv_cache: `
KV Cache显存计算公式：
• 2 × batch_size × total_seq_len × num_layers × num_heads × head_dim × bytes_per_element

其中：
- 因子2：保存Key和Value
- total_seq_len = input_len + max_new_tokens
- head_dim = hidden_size / num_heads

例如：batch=1, seq=2048, layers=32, heads=32, hidden=4096, FP16
KV Cache = 2×1×2048×32×32×128×2 = 1GB
                `,
                framework_overhead: `
框架开销显存说明：
• 深度学习框架的基础内存开销

包含内容：
- 框架自身运行时内存
- 临时计算缓冲区
- 模型加载和管理开销
- 通信库内存(多卡时)

典型值：
- PyTorch: 1.5GB
- DeepSpeed: 2.0GB
- Transformers: 1.2GB

这是相对固定的开销，与模型大小关系较小。
                `,
                backend_overhead: `
推理后端开销说明：
• 推理引擎的额外内存开销

包含内容：
- 推理引擎运行时
- 批次管理和调度
- 内存池和缓存
- 优化算子内存

不同后端开销：
- vLLM: 1.2倍模型权重
- TensorRT-LLM: 1.3倍模型权重
- Transformers: 1.1倍模型权重

高性能后端通常有更多开销以换取更好性能。
                `
              }[name] || '该组件的详细计算说明暂未提供。'

              return (
                <div key={name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}
                    />
                    <span className="text-sm flex items-center">
                      {displayName}
                      <HelpIcon content={helpContent} side="right" />
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatMemorySize(value)}</div>
                    <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// 训练结果展示
interface TrainingResultProps {
  result: TrainingResponse
}

export function TrainingResult({ result }: TrainingResultProps) {
  return (
    <div className="space-y-6">
      {/* 基本信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">训练资源预估结果</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatMemorySize(result.total_memory_gb)}
              </div>
              <div className="text-sm text-muted-foreground">总显存需求</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-600">
                {formatMemorySize(result.memory_per_gpu)}
              </div>
              <div className="text-sm text-muted-foreground">单卡显存需求</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {result.min_gpu_count}-{result.optimal_gpu_count}
              </div>
              <div className="text-sm text-muted-foreground">推荐GPU数量</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatNumber(result.estimated_tokens_per_second || 0)}
              </div>
              <div className="text-sm text-muted-foreground">Tokens/秒</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {result.effective_batch_size}
              </div>
              <div className="text-sm text-muted-foreground">有效批次大小</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 显存分解 */}
      <MemoryBreakdown 
        breakdown={result.memory_breakdown}
        total={result.total_memory_gb}
      />

      {/* GPU推荐 */}
      <GPURecommendation gpus={result.recommended_gpus} />

      {/* 优化建议 */}
      {result.recommendations && Object.keys(result.recommendations).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">优化建议</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(result.recommendations).map(([category, suggestions]) => (
                <div key={category}>
                  <h4 className="font-medium mb-2 capitalize">
                    {category.replace(/_/g, ' ')}
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {Array.isArray(suggestions) ? suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    )) : (
                      <li>{suggestions}</li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// 推理结果展示
interface InferenceResultProps {
  result: InferenceResponse
}

export function InferenceResult({ result }: InferenceResultProps) {
  return (
    <div className="space-y-6">
      {/* 基本信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">推理资源预估结果</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatMemorySize(result.total_memory_gb)}
              </div>
              <div className="text-sm text-muted-foreground">总显存需求</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatNumber(result.estimated_throughput)}
              </div>
              <div className="text-sm text-muted-foreground">Tokens/秒吞吐</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {result.estimated_latency_p50_ms?.toFixed(1) || 0}ms
              </div>
              <div className="text-sm text-muted-foreground">P50延迟</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {result.max_concurrent_requests}
              </div>
              <div className="text-sm text-muted-foreground">最大并发</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 性能详情 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">性能指标</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-lg font-bold">{formatMemorySize(result.kv_cache_memory_gb)}</div>
              <div className="text-sm text-muted-foreground">KV Cache</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-lg font-bold">{result.estimated_latency_p99_ms?.toFixed(1) || 0}ms</div>
              <div className="text-sm text-muted-foreground">P99延迟</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-lg font-bold">{result.backend}</div>
              <div className="text-sm text-muted-foreground">推理后端</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 显存分解 */}
      <MemoryBreakdown 
        breakdown={result.memory_breakdown}
        total={result.total_memory_gb}
      />

      {/* GPU推荐 */}
      <GPURecommendation gpus={result.recommended_gpus} />

      {/* 扩展性分析 */}
      {result.scalability_analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">扩展性分析</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.scalability_analysis.throughput_scaling && (
                <div>
                  <h4 className="font-medium mb-2">吞吐量扩展</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    {Object.entries(result.scalability_analysis.throughput_scaling).map(([key, value]) => (
                      <div key={key} className="text-center p-2 bg-muted rounded">
                        <div className="font-medium">{formatNumber(value as number)}</div>
                        <div className="text-xs text-muted-foreground">{key.replace('_', ' ')}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 优化建议 */}
      {result.recommendations && Object.keys(result.recommendations).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">优化建议</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(result.recommendations).map(([category, suggestions]) => (
                <div key={category}>
                  <h4 className="font-medium mb-2 capitalize">
                    {category.replace(/_/g, ' ')}
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {Array.isArray(suggestions) ? suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    )) : (
                      <li>{suggestions}</li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 