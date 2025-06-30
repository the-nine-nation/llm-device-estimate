'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading'
import { InferenceResult } from '@/components/features/result-display'
import { HelpIcon } from '@/components/ui/tooltip'
import { 
  Zap, 
  Settings, 
  BarChart3, 
  Cpu, 
  ChevronDown, 
  ChevronUp,
  AlertCircle,
  RefreshCw,
  HelpCircle
} from 'lucide-react'
import { inferenceApi } from '@/lib/api'

export default function InferencePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  // 表单状态
  const [formData, setFormData] = useState({
    parametersB: '7',
    backend: 'vllm',
    precision: 'fp16',
    quantization: 'none',
    maxBatchSize: 32,
    maxSequenceLength: 2048,
    maxNewTokens: 1024,
    tensorParallel: 1,
    pipelineParallel: 1,
    maxGpuCount: 8,
    targetThroughput: '',
    targetLatency: '',
    gpuMemoryLimit: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const parametersB = parseFloat(formData.parametersB)
      
      // 创建自定义模型
      const customModel = {
        id: `custom-${parametersB}b`,
        name: `自定义模型 ${parametersB}B`,
        family: 'custom',
        parameters: parametersB * 1e9,
        hidden_size: Math.round(parametersB * 4096 / 7),
        num_layers: Math.round(parametersB * 32 / 7),
        num_heads: Math.round(parametersB * 32 / 7),
        vocab_size: 32000,
        context_length: formData.maxSequenceLength,
        architecture: 'transformer',
        precision: formData.precision,
        size_category: parametersB < 1 ? 'small' : parametersB < 10 ? 'medium' : parametersB < 50 ? 'large' : 'xlarge'
      }

      const requestData = {
        custom_model: customModel,
        backend: formData.backend,
        precision: formData.precision,
        quantization: formData.quantization,
        max_batch_size: formData.maxBatchSize,
        max_sequence_length: formData.maxSequenceLength,
        max_new_tokens: formData.maxNewTokens,
        tensor_parallel: formData.tensorParallel,
        pipeline_parallel: formData.pipelineParallel,
        max_gpu_count: formData.maxGpuCount,
        target_throughput: formData.targetThroughput ? parseInt(formData.targetThroughput) : undefined,
        target_latency_ms: formData.targetLatency ? parseInt(formData.targetLatency) : undefined,
        gpu_memory_limit_gb: formData.gpuMemoryLimit ? parseInt(formData.gpuMemoryLimit) : undefined
      }

      const response = await inferenceApi.estimate(requestData)
      setResult(response)
    } catch (err: any) {
      setError(err.message || '推理预估失败')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      parametersB: '7',
      backend: 'vllm',
      precision: 'fp16',
      quantization: 'none',
      maxBatchSize: 32,
      maxSequenceLength: 2048,
      maxNewTokens: 1024,
      tensorParallel: 1,
      pipelineParallel: 1,
      maxGpuCount: 8,
      targetThroughput: '',
      targetLatency: '',
      gpuMemoryLimit: ''
    })
    setResult(null)
    setError(null)
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          推理资源预估
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          预估大语言模型推理的显存占用、KV Cache、吞吐量和延迟等关键指标
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="ml-auto"
              >
                关闭
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 模型配置 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  模型配置
                </CardTitle>
                <CardDescription>
                  设置推理模型的基本参数
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium flex items-center">
                    模型参数数量 (B)
                    <HelpIcon content="选择模型的参数规模。参数量越大，模型性能越强，但推理所需的显存和计算资源也越多。常见规模：7B适合单卡推理，70B需要多卡部署。" />
                  </label>
                  <select 
                    className="w-full mt-1 p-2 border rounded-md"
                    value={formData.parametersB}
                    onChange={(e) => setFormData({...formData, parametersB: e.target.value})}
                  >
                    <option value="0.5">0.5B参数</option>
                    <option value="1">1B参数</option>
                    <option value="3">3B参数</option>
                    <option value="7">7B参数</option>
                    <option value="13">13B参数</option>
                    <option value="30">30B参数</option>
                    <option value="70">70B参数</option>
                    <option value="175">175B参数</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium flex items-center">
                      推理后端
                      <HelpIcon content="选择推理框架。vLLM：高性能推理引擎，推荐首选；PyTorch：原生框架；Transformers：Hugging Face官方库；TensorRT-LLM：NVIDIA优化框架；FastChat：对话优化；TGI：Hugging Face推理。" />
                    </label>
                    <select 
                      className="w-full mt-1 p-2 border rounded-md"
                      value={formData.backend}
                      onChange={(e) => setFormData({...formData, backend: e.target.value})}
                    >
                      <option value="vllm">vLLM</option>
                      <option value="pytorch">PyTorch</option>
                      <option value="transformers">Transformers</option>
                      <option value="tensorrt_llm">TensorRT-LLM</option>
                      <option value="fastchat">FastChat</option>
                      <option value="tgi">TGI</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium flex items-center">
                      精度类型
                      <HelpIcon content="选择推理时的数值精度。FP16：半精度，速度快显存少，推荐选择；BF16：数值稳定性更好的半精度；FP32：单精度，精度最高但速度慢显存大。" />
                    </label>
                    <select 
                      className="w-full mt-1 p-2 border rounded-md"
                      value={formData.precision}
                      onChange={(e) => setFormData({...formData, precision: e.target.value})}
                    >
                      <option value="fp32">FP32</option>
                      <option value="fp16">FP16</option>
                      <option value="bf16">BF16</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium flex items-center">
                    量化方法
                    <HelpIcon content="模型权重量化技术，减少显存占用。无量化：原始精度；INT8：8位整数，轻微精度损失；INT4：4位整数，显存减半；GPTQ/AWQ：高级量化算法，平衡精度和效率。" />
                  </label>
                  <select 
                    className="w-full mt-1 p-2 border rounded-md"
                    value={formData.quantization}
                    onChange={(e) => setFormData({...formData, quantization: e.target.value})}
                  >
                    <option value="none">无量化</option>
                    <option value="int8">INT8</option>
                    <option value="int4">INT4</option>
                    <option value="gptq">GPTQ</option>
                    <option value="awq">AWQ</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* 推理参数 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  推理参数
                </CardTitle>
                <CardDescription>
                  配置批次大小、序列长度和输出参数
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium flex items-center">
                      最大批次大小
                      <HelpIcon content="推理时并行处理的请求数量。越大吞吐量越高但延迟增加，显存占用也更多。根据GPU显存和延迟要求调整，常用值：8-64。" />
                    </label>
                    <input
                      type="number"
                      className="w-full mt-1 p-2 border rounded-md"
                      value={formData.maxBatchSize}
                      onChange={(e) => setFormData({...formData, maxBatchSize: parseInt(e.target.value) || 1})}
                      min="1"
                      max="1024"
                      placeholder="32"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium flex items-center">
                      最大序列长度
                      <HelpIcon content="模型能处理的最大输入长度（包含提示词）。决定了上下文窗口大小，越长显存占用越高。常用值：2048、4096、8192。" />
                    </label>
                    <input
                      type="number"
                      className="w-full mt-1 p-2 border rounded-md"
                      value={formData.maxSequenceLength}
                      onChange={(e) => setFormData({...formData, maxSequenceLength: parseInt(e.target.value) || 2048})}
                      min="128"
                      max="32768"
                      placeholder="2048"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium flex items-center">
                      最大新生成Token
                      <HelpIcon content="模型单次生成的最大token数量。影响KV Cache显存占用和单次对话长度。常用值：512-2048，设置过大会显著增加显存需求。" />
                    </label>
                    <input
                      type="number"
                      className="w-full mt-1 p-2 border rounded-md"
                      value={formData.maxNewTokens}
                      onChange={(e) => setFormData({...formData, maxNewTokens: parseInt(e.target.value) || 1024})}
                      min="1"
                      max="8192"
                      placeholder="1024"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 并行配置 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  并行配置
                </CardTitle>
                <CardDescription>
                  设置张量并行和流水线并行
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium flex items-center">
                      张量并行
                      <HelpIcon content="将模型层在多个GPU间切分。适用于单层无法放入单个GPU的大模型。增加张量并行度可减少单卡显存，但会增加GPU间通信开销。" />
                    </label>
                    <input
                      type="number"
                      className="w-full mt-1 p-2 border rounded-md"
                      value={formData.tensorParallel}
                      onChange={(e) => setFormData({...formData, tensorParallel: parseInt(e.target.value) || 1})}
                      min="1"
                      max="8"
                      placeholder="1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">流水线并行</label>
                    <input
                      type="number"
                      className="w-full mt-1 p-2 border rounded-md"
                      value={formData.pipelineParallel}
                      onChange={(e) => setFormData({...formData, pipelineParallel: parseInt(e.target.value) || 1})}
                      min="1"
                      max="8"
                      placeholder="1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">最大GPU数量</label>
                    <input
                      type="number"
                      className="w-full mt-1 p-2 border rounded-md"
                      value={formData.maxGpuCount}
                      onChange={(e) => setFormData({...formData, maxGpuCount: parseInt(e.target.value) || 8})}
                      min="1"
                      max="64"
                      placeholder="8"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 高级选项 */}
            <Card>
              <CardHeader>
                <CardTitle 
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  <HelpCircle className="h-5 w-5" />
                  高级选项
                  {showAdvanced ? (
                    <ChevronUp className="h-4 w-4 ml-auto" />
                  ) : (
                    <ChevronDown className="h-4 w-4 ml-auto" />
                  )}
                </CardTitle>
                {showAdvanced && (
                  <CardDescription>
                    性能目标和GPU限制配置
                  </CardDescription>
                )}
              </CardHeader>
              {showAdvanced && (
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">目标吞吐量 (tokens/s)</label>
                      <input
                        type="number"
                        className="w-full mt-1 p-2 border rounded-md"
                        value={formData.targetThroughput}
                        onChange={(e) => setFormData({...formData, targetThroughput: e.target.value})}
                        placeholder="自动计算"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">目标延迟 (ms)</label>
                      <input
                        type="number"
                        className="w-full mt-1 p-2 border rounded-md"
                        value={formData.targetLatency}
                        onChange={(e) => setFormData({...formData, targetLatency: e.target.value})}
                        placeholder="自动计算"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">GPU显存限制 (GB)</label>
                    <input
                      type="number"
                      className="w-full mt-1 p-2 border rounded-md"
                      value={formData.gpuMemoryLimit}
                      onChange={(e) => setFormData({...formData, gpuMemoryLimit: e.target.value})}
                      placeholder="使用GPU全部显存"
                    />
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Submit Button */}
            <div className="flex gap-4 justify-center">
              <Button 
                type="submit" 
                size="lg" 
                className="px-8"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner className="h-4 w-4 mr-2" />
                    预估中...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    开始预估
                  </>
                )}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                size="lg"
                onClick={resetForm}
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                重置配置
              </Button>
            </div>
          </form>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          {result ? (
            <InferenceResult result={result} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>推理性能预估</CardTitle>
                <CardDescription>
                  配置参数后点击"开始预估"查看结果
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>等待开始推理资源预估...</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 