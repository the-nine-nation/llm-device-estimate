import axios from 'axios'
import type {
  TrainingRequest,
  TrainingResponse,
  InferenceRequest,
  InferenceResponse,
  ModelInfo,
  TrainingConfig,
  InferenceConfig,
  GPUInfo,
  ApiResponse,
  ApiError
} from '@/types/api'

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 在这里可以添加认证 token 等
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // 统一错误处理
    const apiError: ApiError = {
      message: error.response?.data?.message || error.message || '请求失败',
      code: error.response?.data?.code || error.code,
      details: error.response?.data?.details || error.response?.data,
    }
    return Promise.reject(apiError)
  }
)

// 训练相关 API
export const trainingApi = {
  // 训练资源预估
  estimate: async (params: TrainingRequest): Promise<TrainingResponse> => {
    const response = await apiClient.post<TrainingResponse>(
      '/training/estimate',
      params
    )
    return response.data
  },

  // 获取训练配置选项
  getConfigs: async (): Promise<TrainingConfig> => {
    const response = await apiClient.get<TrainingConfig>(
      '/training/configs'
    )
    return response.data
  },
}

// 推理相关 API
export const inferenceApi = {
  // 推理资源预估
  estimate: async (params: InferenceRequest): Promise<InferenceResponse> => {
    const response = await apiClient.post<InferenceResponse>(
      '/inference/estimate',
      params
    )
    return response.data
  },

  // 获取推理后端列表
  getBackends: async (): Promise<InferenceConfig> => {
    const response = await apiClient.get<InferenceConfig>(
      '/inference/backends'
    )
    return response.data
  },
}

// GPU 硬件相关 API (如果需要的话)
export const hardwareApi = {
  // 获取所有 GPU 信息
  getGPUs: async (): Promise<GPUInfo[]> => {
    const response = await apiClient.get<GPUInfo[]>('/hardware/gpus')
    return response.data
  },
}

// 导出默认 API 客户端
export default apiClient 