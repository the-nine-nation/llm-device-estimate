import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  TrainingMethod,
  PrecisionType,
  OptimizerType,
  DeepSpeedStage,
  AccelerationMethod,
  type TrainingRequest,
  type TrainingResponse,
  type ModelInfo,
  type LoRAConfig
} from '@/types/api'

interface TrainingState {
  // 配置状态
  selectedModel?: ModelInfo
  customModel?: Partial<ModelInfo>
  trainingMethod: TrainingMethod
  precision: PrecisionType
  batchSize: number
  sequenceLength: number
  gradientAccumulationSteps: number
  optimizer: OptimizerType
  learningRate: number
  weightDecay: number
  dataParallel: number
  tensorParallel: number
  pipelineParallel: number
  deepspeedStage?: DeepSpeedStage
  loraConfig?: LoRAConfig
  gradientCheckpointing: boolean
  accelerationMethod: AccelerationMethod

  // 结果状态
  result?: TrainingResponse
  isLoading: boolean
  error?: string

  // Actions
  setModel: (model: ModelInfo) => void
  setCustomModel: (model: Partial<ModelInfo>) => void
  setTrainingMethod: (method: TrainingMethod) => void
  setPrecision: (precision: PrecisionType) => void
  setBatchSize: (size: number) => void
  setSequenceLength: (length: number) => void
  setGradientAccumulationSteps: (steps: number) => void
  setOptimizer: (optimizer: OptimizerType) => void
  setLearningRate: (rate: number) => void
  setWeightDecay: (decay: number) => void
  setDataParallel: (dp: number) => void
  setTensorParallel: (tp: number) => void
  setPipelineParallel: (pp: number) => void
  setDeepSpeedStage: (stage: DeepSpeedStage) => void
  setLoRAConfig: (config: LoRAConfig) => void
  setGradientCheckpointing: (enabled: boolean) => void
  setAccelerationMethod: (method: AccelerationMethod) => void
  setResult: (result: TrainingResponse) => void
  setLoading: (loading: boolean) => void
  setError: (error: string) => void
  clearError: () => void
  resetConfig: () => void
  getTrainingRequest: () => TrainingRequest
}

const defaultState = {
  trainingMethod: TrainingMethod.LORA,
  precision: PrecisionType.FP16,
  batchSize: 8,
  sequenceLength: 2048,
  gradientAccumulationSteps: 4,
  optimizer: OptimizerType.ADAMW,
  learningRate: 2e-4,
  weightDecay: 0.01,
  dataParallel: 1,
  tensorParallel: 1,
  pipelineParallel: 1,
  gradientCheckpointing: true,
  accelerationMethod: AccelerationMethod.NONE,
  isLoading: false,
}

export const useTrainingStore = create<TrainingState>()(
  persist(
    (set, get) => ({
      ...defaultState,

      setModel: (model) => set({ selectedModel: model, customModel: undefined }),
      setCustomModel: (model) => set({ customModel: model, selectedModel: undefined }),
      setTrainingMethod: (method) => set({ trainingMethod: method }),
      setPrecision: (precision) => set({ precision }),
      setBatchSize: (size) => set({ batchSize: size }),
      setSequenceLength: (length) => set({ sequenceLength: length }),
      setGradientAccumulationSteps: (steps) => set({ gradientAccumulationSteps: steps }),
      setOptimizer: (optimizer) => set({ optimizer }),
      setLearningRate: (rate) => set({ learningRate: rate }),
      setWeightDecay: (decay) => set({ weightDecay: decay }),
      setDataParallel: (dp) => set({ dataParallel: dp }),
      setTensorParallel: (tp) => set({ tensorParallel: tp }),
      setPipelineParallel: (pp) => set({ pipelineParallel: pp }),
      setDeepSpeedStage: (stage) => set({ deepspeedStage: stage }),
      setLoRAConfig: (config) => set({ loraConfig: config }),
      setGradientCheckpointing: (enabled) => set({ gradientCheckpointing: enabled }),
      setAccelerationMethod: (method) => set({ accelerationMethod: method }),
      setResult: (result) => set({ result, error: undefined }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error, isLoading: false }),
      clearError: () => set({ error: undefined }),
      
      resetConfig: () => set({
        ...defaultState,
        selectedModel: undefined,
        customModel: undefined,
        result: undefined,
        error: undefined,
      }),

      getTrainingRequest: (): TrainingRequest => {
        const state = get()
        return {
          model_id: state.selectedModel?.id,
          custom_model: state.customModel ? state.customModel as ModelInfo : undefined,
          training_method: state.trainingMethod,
          precision: state.precision,
          batch_size: state.batchSize,
          sequence_length: state.sequenceLength,
          gradient_accumulation_steps: state.gradientAccumulationSteps,
          optimizer: state.optimizer,
          learning_rate: state.learningRate,
          weight_decay: state.weightDecay,
          data_parallel: state.dataParallel,
          tensor_parallel: state.tensorParallel,
          pipeline_parallel: state.pipelineParallel,
          deepspeed_stage: state.deepspeedStage,
          lora_config: state.loraConfig,
          gradient_checkpointing: state.gradientCheckpointing,
          acceleration_method: state.accelerationMethod,
        }
      },
    }),
    {
      name: 'training-store',
      // 只持久化配置，不持久化结果
      partialize: (state) => ({
        selectedModel: state.selectedModel,
        customModel: state.customModel,
        trainingMethod: state.trainingMethod,
        precision: state.precision,
        batchSize: state.batchSize,
        sequenceLength: state.sequenceLength,
        gradientAccumulationSteps: state.gradientAccumulationSteps,
        optimizer: state.optimizer,
        learningRate: state.learningRate,
        weightDecay: state.weightDecay,
        dataParallel: state.dataParallel,
        tensorParallel: state.tensorParallel,
        pipelineParallel: state.pipelineParallel,
        deepspeedStage: state.deepspeedStage,
        loraConfig: state.loraConfig,
        gradientCheckpointing: state.gradientCheckpointing,
        accelerationMethod: state.accelerationMethod,
      }),
    }
  )
) 