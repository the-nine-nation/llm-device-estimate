// 与后端API对应的TypeScript类型定义

export interface ModelInfo {
  id: string
  name: string
  family: string
  parameters: number
  hidden_size: number
  num_layers: number
  num_heads: number
  vocab_size: number
  context_length: number
  architecture: string
  precision: PrecisionType
  size_category: ModelSize
}

export interface GPUInfo {
  name: string
  memory_gb: number
  memory_bandwidth_gb_s: number
  compute_capability: string
  fp16_tflops?: number
}

export interface ResourceEstimate {
  total_memory_gb: number
  model_memory_gb: number
  activation_memory_gb: number
  optimizer_memory_gb?: number
  gradient_memory_gb?: number
  framework_overhead_gb: number
  recommended_gpus: GPUInfo[]
  min_gpu_count: number
  optimal_gpu_count: number
}

// 枚举类型
export enum PrecisionType {
  FP32 = 'fp32',
  FP16 = 'fp16',
  BF16 = 'bf16'
}

export enum ModelSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  XLARGE = 'xlarge'
}

export enum TrainingMethod {
  FULL_FINETUNING = 'full_finetuning',
  LORA = 'lora'
}

export enum OptimizerType {
  ADAMW = 'adamw',
  ADAM = 'adam',
  SGD = 'sgd'
}

export enum DeepSpeedStage {
  STAGE0 = 'stage0',
  STAGE1 = 'stage1',
  STAGE2 = 'stage2',
  STAGE3 = 'stage3'
}

export enum AccelerationMethod {
  NONE = 'none',
  FLASH_ATTENTION_2 = 'flash_attention_2',
  UNSLOTH = 'unsloth'
}

export enum InferenceBackend {
  VLLM = 'vllm',
  PYTORCH = 'pytorch',
  TRANSFORMERS = 'transformers',
  TENSORRT_LLM = 'tensorrt_llm',
  FASTCHAT = 'fastchat',
  TGI = 'tgi'
}

export enum QuantizationMethod {
  NONE = 'none',
  INT8 = 'int8',
  INT4 = 'int4',
  GPTQ = 'gptq',
  AWQ = 'awq'
}

// 训练相关接口
export interface LoRAConfig {
  rank: number
  alpha: number
  dropout: number
  target_modules?: string
}

export interface TrainingRequest {
  model_id?: string
  parameters_billion?: number
  custom_model?: ModelInfo
  training_method: TrainingMethod
  precision: PrecisionType
  batch_size: number
  sequence_length: number
  gradient_accumulation_steps: number
  optimizer: OptimizerType
  learning_rate: number
  weight_decay: number
  data_parallel: number
  tensor_parallel: number
  pipeline_parallel: number
  deepspeed_stage?: DeepSpeedStage
  lora_config?: LoRAConfig
  gradient_checkpointing: boolean
  acceleration_method: AccelerationMethod
}

export interface TrainingResponse extends ResourceEstimate {
  training_method: TrainingMethod
  effective_batch_size: number
  memory_per_gpu: number
  memory_breakdown: Record<string, number>
  estimated_tokens_per_second?: number
  estimated_time_per_epoch?: string
  recommendations: Record<string, any>
}

// 推理相关接口
export interface InferenceRequest {
  model_id?: string
  custom_model?: ModelInfo
  backend: InferenceBackend
  precision: PrecisionType
  quantization: QuantizationMethod
  max_batch_size: number
  max_sequence_length: number
  max_new_tokens: number
  tensor_parallel: number
  pipeline_parallel: number
  kv_cache_dtype?: string
  kv_cache_quantization?: string
  target_throughput?: number
  target_latency_ms?: number
  max_gpu_count?: number
  gpu_memory_limit_gb?: number
}

export interface InferenceResponse extends ResourceEstimate {
  backend: InferenceBackend
  quantization: QuantizationMethod
  kv_cache_memory_gb: number
  max_concurrent_requests: number
  estimated_throughput: number
  estimated_latency_p50_ms: number
  estimated_latency_p99_ms: number
  memory_breakdown: Record<string, number>
  recommendations: Record<string, any>
  scalability_analysis: Record<string, any>
}

// 配置选项
export interface TrainingConfig {
  training_methods: Array<{
    id: string
    name: string
    description: string
  }>
  precision_types: Array<{
    id: string
    name: string
    description: string
  }>
  optimizers: Array<{
    id: string
    name: string
    description: string
  }>
  deepspeed_stages: Array<{
    id: string
    name: string
    description: string
  }>
}

export interface InferenceConfig {
  backends: Array<{
    id: string
    name: string
    description: string
    features: string[]
  }>
  quantization_methods: Array<{
    id: string
    name: string
    description: string
  }>
}

// API响应格式
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface ApiError {
  message: string
  code?: string
  details?: any
} 