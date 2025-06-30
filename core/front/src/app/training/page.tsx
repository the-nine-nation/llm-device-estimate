'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  FormProvider, 
  FormField, 
  FormLabel, 
  FormInput, 
  FormSelect, 
  useFormContext 
} from '@/components/ui/form'
import { LoadingOverlay } from '@/components/ui/loading'
import { TrainingResult } from '@/components/features/result-display'
import { HelpIcon } from '@/components/ui/tooltip'
import { trainingApi } from '@/lib/api'
import { TrainingRequest, TrainingResponse, TrainingConfig, AccelerationMethod } from '@/types/api'
import { cn } from '@/lib/utils'

export default function TrainingPage() {
  const [isCalculating, setIsCalculating] = useState(false)
  const [result, setResult] = useState<TrainingResponse | null>(null)
  const [config, setConfig] = useState<TrainingConfig | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [gpuCount, setGpuCount] = useState(1)
  const [trainingMethod, setTrainingMethod] = useState('lora')

  // 获取训练配置选项
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const configData = await trainingApi.getConfigs()
        setConfig(configData)
      } catch (err) {
        console.error('获取配置失败:', err)
      }
    }
    fetchConfig()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCalculating(true)
    setError(null)
    
    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement)
      
      // 获取参数数量
      const parametersBillion = parseFloat(formData.get('parameters_billion') as string)
      
      const request: TrainingRequest = {
        parameters_billion: parametersBillion,
        training_method: formData.get('training_method') as any,
        precision: formData.get('precision') as any,
        batch_size: parseInt(formData.get('batch_size') as string),
        sequence_length: parseInt(formData.get('sequence_length') as string),
        gradient_accumulation_steps: parseInt(formData.get('gradient_accumulation_steps') as string),
        optimizer: formData.get('optimizer') as any,
        learning_rate: parseFloat(formData.get('learning_rate') as string),
        weight_decay: parseFloat(formData.get('weight_decay') as string),
        data_parallel: parseInt(formData.get('gpu_count') as string) || 1,
        tensor_parallel: 1, // 智能计算
        pipeline_parallel: 1, // 智能计算
        gradient_checkpointing: formData.has('gradient_checkpointing'),
        deepspeed_stage: formData.get('deepspeed_stage') as any || undefined,
        acceleration_method: formData.get('acceleration_method') as AccelerationMethod || AccelerationMethod.NONE,
        lora_config: formData.get('training_method') === 'lora' ? {
          rank: parseInt(formData.get('lora_rank') as string) || 16,
          alpha: parseInt(formData.get('lora_alpha') as string) || 32,
          dropout: parseFloat(formData.get('lora_dropout') as string) || 0.1,
          target_modules: 'q_proj,v_proj,k_proj,o_proj'
        } : undefined
      }
      
      console.log('发送请求:', request)
      const response = await trainingApi.estimate(request)
      console.log('收到响应:', response)
      setResult(response)
    } catch (err: any) {
      console.error('请求错误:', err)
      setError(err.message || '计算失败，请检查输入参数')
    } finally {
      setIsCalculating(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">训练资源预估</h1>
        <p className="text-muted-foreground">
          估算大语言模型训练所需的GPU显存、计算资源和时间
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* 配置表单 */}
        <Card>
          <CardHeader>
            <CardTitle>训练配置</CardTitle>
          </CardHeader>
          <CardContent>
            <LoadingOverlay isLoading={isCalculating} message="正在计算资源需求...">
              <FormProvider onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* 模型参数数量 */}
                  <FormField name="parameters_billion">
                    <FormLabel className="flex items-center">
                      模型参数数量 (B)
                      <HelpIcon content="指定模型的参数规模，单位为十亿(B)。例如：7表示70亿参数。参数量越大，模型能力越强，但所需显存和计算资源也越多。常见规模：7B、13B、70B等。" />
                    </FormLabel>
                    <FormInput 
                      name="parameters_billion"
                      type="number" 
                      step="0.1"
                      defaultValue="7"
                      min="0.1"
                      max="1000"
                      placeholder="例如: 7 (表示7B参数)"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      常见模型: 7B (LLaMA-7B), 13B (LLaMA-13B), 70B (LLaMA-70B)
                    </p>
                  </FormField>

                  {/* 训练方法 */}
                  <FormField name="training_method">
                    <FormLabel className="flex items-center">
                      训练方法
                      <HelpIcon content="选择训练策略。全参数微调：训练模型的所有参数，效果最好但资源需求高；LoRA微调：只训练少量新增参数，大幅减少显存占用，效果接近全参数微调。" />
                    </FormLabel>
                    <FormSelect 
                      name="training_method" 
                      defaultValue="lora"
                      onChange={(e) => setTrainingMethod(e.target.value)}
                    >
                      <option value="full_finetuning">全参数微调</option>
                      <option value="lora">LoRA微调</option>
                    </FormSelect>
                    <p className="text-xs text-muted-foreground mt-1">
                      全参数微调：训练所有参数，效果最好但资源需求高<br/>
                      LoRA微调：只训练少量参数，资源需求低，效果接近全参数微调
                    </p>
                  </FormField>

                  {/* LoRA配置 */}
                  {trainingMethod === 'lora' && (
                    <div className="space-y-4 border-l-4 border-blue-200 bg-blue-50 p-4 rounded-md">
                      <h4 className="font-medium text-blue-900">LoRA参数配置</h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        {/* LoRA Rank */}
                        <FormField name="lora_rank">
                          <FormLabel className="flex items-center text-sm">
                            LoRA Rank
                            <HelpIcon content="LoRA的秩，控制新增参数的数量。Rank越大，模型容量越强但显存占用越高。推荐值：8-64。常用：rank=16适合大多数任务，rank=32用于复杂任务。" />
                          </FormLabel>
                          <FormSelect name="lora_rank" defaultValue="16">
                            <option value="8">8 (最小)</option>
                            <option value="16">16 (推荐)</option>
                            <option value="32">32 (常用)</option>
                            <option value="64">64 (较大)</option>
                            <option value="128">128 (很大)</option>
                          </FormSelect>
                        </FormField>

                        {/* LoRA Alpha */}
                        <FormField name="lora_alpha">
                          <FormLabel className="flex items-center text-sm">
                            LoRA Alpha
                            <HelpIcon content="LoRA的缩放参数，通常设为rank的2倍。Alpha/rank的比值控制LoRA层的学习强度。较大的alpha会让LoRA影响更强。" />
                          </FormLabel>
                          <FormSelect name="lora_alpha" defaultValue="32">
                            <option value="16">16</option>
                            <option value="32">32 (推荐)</option>
                            <option value="64">64</option>
                            <option value="128">128</option>
                          </FormSelect>
                        </FormField>
                      </div>

                      <p className="text-xs text-blue-700 mt-2">
                        💡 提示：rank越大，LoRA参数越多，显存占用越高但效果可能更好。建议从rank=16开始尝试。
                      </p>
                    </div>
                  )}

                  {/* 精度 */}
                  <FormField name="precision">
                    <FormLabel className="flex items-center">
                      精度
                      <HelpIcon content="选择训练时的数值精度。FP16：半精度，显存占用减半，训练速度快，推荐选择；BF16：Google的半精度格式，数值稳定性更好；FP32：单精度，精度最高但显存占用大。" />
                    </FormLabel>
                    <FormSelect name="precision" defaultValue="fp16">
                      <option value="fp16">FP16</option>
                      <option value="bf16">BF16</option>
                      <option value="fp32">FP32</option>
                    </FormSelect>
                  </FormField>

                  {/* 加速方法 */}
                  <FormField name="acceleration_method">
                    <FormLabel className="flex items-center">
                      加速方法
                      <HelpIcon content="选择训练加速技术。无加速：使用标准训练方式；Flash Attention 2：减少30%-60%激活值显存，支持更长序列；Unsloth：减少75%激活值显存，显存效率提升4倍，但仅支持单卡训练。" />
                    </FormLabel>
                    <FormSelect 
                      name="acceleration_method" 
                      defaultValue="none"
                    >
                      <option value="none">无加速</option>
                      <option value="flash_attention_2">Flash Attention 2</option>
                      <option 
                        value="unsloth" 
                        disabled={gpuCount > 1}
                      >
                        Unsloth {gpuCount > 1 ? '(仅支持单卡)' : ''}
                      </option>
                    </FormSelect>
                    <p className="text-xs text-muted-foreground mt-1">
                      Flash Attention 2: 减少30%-60%激活值显存，支持更长序列<br/>
                      Unsloth: 减少75%激活值显存，显存效率提升4倍，仅支持单卡训练
                    </p>
                  </FormField>

                  <div className="grid grid-cols-2 gap-4">
                    {/* 批次大小 */}
                    <FormField name="batch_size">
                      <FormLabel className="flex items-center">
                        批次大小
                        <HelpIcon content="每个训练步骤处理的样本数量。越大训练越稳定但显存占用越高。建议范围：1-32。如果显存不足，可以减少批次大小并增加梯度累积步数。" />
                      </FormLabel>
                      <FormInput 
                        name="batch_size"
                        type="number" 
                        defaultValue="8"
                        min="1"
                        max="128"
                      />
                    </FormField>

                    {/* 序列长度 */}
                    <FormField name="sequence_length">
                      <FormLabel className="flex items-center">
                        序列长度
                        <HelpIcon content="每个训练样本的最大token数量。决定了模型能处理的上下文长度。越长显存占用越高，建议范围：512-8192。常用值：2048、4096。" />
                      </FormLabel>
                      <FormInput 
                        name="sequence_length"
                        type="number" 
                        defaultValue="2048"
                        min="128"
                        max="8192"
                      />
                    </FormField>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* 梯度累积 */}
                    <FormField name="gradient_accumulation_steps">
                      <FormLabel className="flex items-center">
                        梯度累积步数
                        <HelpIcon content="在更新模型参数前累积多少步的梯度。可以在不增加显存的情况下增大有效批次大小。例如：batch_size=8，accumulation_steps=4，等效于batch_size=32的训练效果。" />
                      </FormLabel>
                      <FormInput 
                        name="gradient_accumulation_steps"
                        type="number" 
                        defaultValue="4"
                        min="1"
                        max="32"
                      />
                    </FormField>

                    {/* 优化器 */}
                    <FormField name="optimizer">
                      <FormLabel className="flex items-center">
                        优化器
                        <HelpIcon content="选择梯度下降优化算法。AdamW：推荐选择，带权重衰减的Adam，训练稳定；Adam：经典优化器，收敛快；SGD：随机梯度下降，简单但可能需要精细调参。" />
                      </FormLabel>
                      <FormSelect name="optimizer" defaultValue="adamw">
                        <option value="adamw">AdamW</option>
                        <option value="adam">Adam</option>
                        <option value="sgd">SGD</option>
                      </FormSelect>
                    </FormField>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* 学习率 */}
                    <FormField name="learning_rate">
                      <FormLabel className="flex items-center">
                        学习率
                        <HelpIcon content="控制模型参数更新的步长。太高可能导致训练不稳定，太低训练收敛慢。LoRA微调推荐：1e-4到5e-4；全参数微调推荐：1e-5到1e-4。建议从较小值开始调试。" />
                      </FormLabel>
                      <FormInput 
                        name="learning_rate"
                        type="number" 
                        step="0.00001"
                        defaultValue="0.0002"
                        min="0.00001"
                        max="0.01"
                      />
                    </FormField>

                    {/* 权重衰减 */}
                    <FormField name="weight_decay">
                      <FormLabel className="flex items-center">
                        权重衰减
                        <HelpIcon content="L2正则化系数，防止模型过拟合。通过惩罚大权重值来提高模型泛化能力。推荐值：0.01-0.1。设为0表示不使用权重衰减。较大的模型通常需要更大的权重衰减。" />
                      </FormLabel>
                      <FormInput 
                        name="weight_decay"
                        type="number" 
                        step="0.001"
                        defaultValue="0.01"
                        min="0"
                        max="0.1"
                      />
                    </FormField>
                  </div>

                  {/* GPU卡数 */}
                  <FormField name="gpu_count">
                    <FormLabel className="flex items-center">
                      使用GPU数量
                      <HelpIcon content="选择用于训练的GPU数量。单卡训练简单但限制较大；多卡训练可以使用DeepSpeed等技术减少单卡显存占用，支持更大模型训练。注意：Unsloth仅支持单卡。" />
                    </FormLabel>
                    <FormSelect 
                      name="gpu_count" 
                      defaultValue="1"
                      onChange={(e) => setGpuCount(parseInt(e.target.value))}
                    >
                      <option value="1">1卡训练</option>
                      <option value="2">2卡训练</option>
                      <option value="4">4卡训练</option>
                      <option value="8">8卡训练</option>
                    </FormSelect>
                    <p className="text-xs text-muted-foreground mt-1">
                      多卡训练时可以使用DeepSpeed进行显存优化
                    </p>
                  </FormField>



                  {/* 高级选项 */}
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="font-medium">高级选项</h4>
                    
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        name="gradient_checkpointing"
                        value="true"
                        defaultChecked
                        className="rounded"
                      />
                      <FormLabel className="text-sm flex items-center">
                        梯度检查点
                        <HelpIcon content="以计算换显存的技术。重新计算激活值而不是存储，可减少30-70%显存占用，但训练时间会增加10-20%。大模型训练时非常有用。" />
                      </FormLabel>
                    </div>

                    {gpuCount > 1 && (
                      <FormField name="deepspeed_stage">
                        <FormLabel className="flex items-center">
                          DeepSpeed ZeRO阶段
                          <HelpIcon content="微软的显存优化技术。Stage 1：分片优化器状态；Stage 2：分片优化器状态+梯度，推荐选择；Stage 3：分片所有参数+优化器+梯度，显存减少最多但通信开销较大。" />
                        </FormLabel>
                        <FormSelect name="deepspeed_stage" defaultValue="stage2">
                          <option value="">不使用</option>
                          <option value="stage1">Stage 1 - 优化器分片</option>
                          <option value="stage2">Stage 2 - 优化器+梯度分片</option>
                          <option value="stage3">Stage 3 - 优化器+梯度+参数分片</option>
                        </FormSelect>
                        <p className="text-xs text-muted-foreground mt-1">
                          多卡训练时推荐使用Stage 2或Stage 3来减少显存占用
                        </p>
                      </FormField>
                    )}
                  </div>

                  {error && (
                    <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                      {error}
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isCalculating}
                  >
                    {isCalculating ? '计算中...' : '开始预估'}
                  </Button>
                </div>
              </FormProvider>
            </LoadingOverlay>
          </CardContent>
        </Card>

        {/* 结果展示 */}
        <div className="space-y-6">
          {result ? (
            <TrainingResult result={result} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>预估结果</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-12">
                  <div className="mb-4">
                    <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      📊
                    </div>
                  </div>
                  <p>请填写训练配置并点击"开始预估"查看结果</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 