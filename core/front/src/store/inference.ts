import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  InferenceRequest,
  InferenceResponse,
  ModelInfo
} from '@/types/api'
import {
  InferenceBackend,
  QuantizationMethod,
  PrecisionType
} from '@/types/api'
import { inferenceApi } from '@/lib/api'

interface InferenceState {
  // 表单配置
  config: InferenceRequest
  
  // API状态
  isLoading: boolean
  error: string | null
  result: InferenceResponse | null
  
  // 界面状态
  showAdvanced: boolean
  showCustomModel: boolean
  
  // Actions
  updateConfig: <K extends keyof InferenceRequest>(
    key: K,
    value: InferenceRequest[K]
  ) => void
  
  setCustomModel: (model: ModelInfo) => void
  toggleAdvanced: () => void
  toggleCustomModel: () => void
  
  // API调用
  estimateInference: () => Promise<void>
  clearError: () => void
  resetConfig: () => void
}

// 默认配置
const defaultConfig: InferenceRequest = {
  model_id: undefined,
  custom_model: undefined,
  backend: InferenceBackend.VLLM,
  precision: PrecisionType.FP16,
  quantization: QuantizationMethod.NONE,
  max_batch_size: 32,
  max_sequence_length: 2048,
  max_new_tokens: 1024,
  tensor_parallel: 1,
  pipeline_parallel: 1,
  kv_cache_dtype: undefined,
  kv_cache_quantization: undefined,
  target_throughput: undefined,
  target_latency_ms: undefined,
  max_gpu_count: 8,
  gpu_memory_limit_gb: undefined
}

export const useInferenceStore = create<InferenceState>()(
  persist(
    (set, get) => ({
      config: defaultConfig,
      isLoading: false,
      error: null,
      result: null,
      showAdvanced: false,
      showCustomModel: false,

      updateConfig: (key, value) => {
        set((state) => ({
          config: {
            ...state.config,
            [key]: value
          }
        }))
      },

      setCustomModel: (model) => {
        set((state) => ({
          config: {
            ...state.config,
            custom_model: model,
            model_id: undefined
          }
        }))
      },

      toggleAdvanced: () => {
        set((state) => ({
          showAdvanced: !state.showAdvanced
        }))
      },

      toggleCustomModel: () => {
        set((state) => ({
          showCustomModel: !state.showCustomModel,
          config: {
            ...state.config,
            model_id: !state.showCustomModel ? undefined : state.config.model_id,
            custom_model: !state.showCustomModel ? undefined : state.config.custom_model
          }
        }))
      },

      estimateInference: async () => {
        const { config } = get()
        
        set({ isLoading: true, error: null })
        
        try {
          const result = await inferenceApi.estimate(config)
          set({ result, isLoading: false })
        } catch (error: any) {
          set({ 
            error: error.message || '推理预估失败',
            isLoading: false 
          })
        }
      },

      clearError: () => {
        set({ error: null })
      },

      resetConfig: () => {
        set({
          config: defaultConfig,
          result: null,
          error: null,
          showAdvanced: false,
          showCustomModel: false
        })
      }
    }),
    {
      name: 'inference-config',
      partialize: (state) => ({
        config: state.config,
        showAdvanced: state.showAdvanced,
        showCustomModel: state.showCustomModel
      })
    }
  )
) 