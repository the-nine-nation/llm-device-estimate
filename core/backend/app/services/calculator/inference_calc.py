"""
推理资源计算服务
"""

from typing import Dict, Any, Optional
import math

from ...models.inference import InferenceRequest, InferenceResponse, InferenceBackend, QuantizationMethod
from ...models.common import PrecisionType, ModelInfo
from ...services.model_registry import ModelRegistry
from .base_calc import BaseCalculator


class InferenceCalculator(BaseCalculator):
    """推理资源计算器"""
    
    # 量化方法的显存压缩比
    QUANTIZATION_COMPRESSION_RATIO = {
        QuantizationMethod.NONE: 1.0,
        QuantizationMethod.INT8: 0.5,     # FP16 -> INT8
        QuantizationMethod.INT4: 0.25,    # FP16 -> INT4
        QuantizationMethod.GPTQ: 0.25,    # 4-bit量化
        QuantizationMethod.AWQ: 0.25      # 4-bit量化
    }
    
    # 推理后端的显存开销系数
    BACKEND_OVERHEAD_MULTIPLIER = {
        InferenceBackend.VLLM: 1.2,
        InferenceBackend.TRANSFORMERS: 1.1,
    }
    
    def __init__(self):
        """初始化推理计算器"""
        super().__init__()
        self.model_registry = ModelRegistry()
    
    def calculate(self, request: InferenceRequest) -> InferenceResponse:
        """
        计算推理资源需求
        
        Args:
            request: 推理预估请求
            
        Returns:
            推理资源预估结果
        """
        # 获取模型信息
        model = self._get_model_info(request)
        
        # 计算各种显存需求
        model_memory = self._calculate_model_memory(model, request)
        kv_cache_memory = self._calculate_kv_cache_memory(model, request)
        activation_memory = self._calculate_activation_memory(model, request)
        
        # 计算总显存
        backend_multiplier = self.BACKEND_OVERHEAD_MULTIPLIER.get(request.backend, 1.0)
        total_memory = (model_memory + kv_cache_memory + activation_memory) * backend_multiplier
        
        # 计算GPU需求
        min_gpu_count = max(1, math.ceil(total_memory / 80))  # 假设80GB显存
        optimal_gpu_count = request.tensor_parallel * request.pipeline_parallel
        
        # 计算最大并发请求数
        max_concurrent_requests = self._calculate_max_concurrent_requests(
            model, request, kv_cache_memory
        )
        
        # 性能预估
        estimated_throughput = self._estimate_throughput(model, request)
        estimated_latency_p50 = self._estimate_latency(model, request, percentile=50)
        estimated_latency_p99 = self._estimate_latency(model, request, percentile=99)
        
        # 显存分解
        memory_breakdown = {
            "model_weights": model_memory,
            "kv_cache": kv_cache_memory,
            "activations": activation_memory,
            "backend_overhead": total_memory * (backend_multiplier - 1)
        }
        
        # 生成推荐GPU列表
        from ...utils.helpers import recommend_gpus
        memory_per_gpu = total_memory / max(1, request.tensor_parallel)
        recommended_gpus = recommend_gpus(memory_per_gpu, max_count=5, use_case="inference")
        
        # 生成优化建议
        recommendations = self._generate_recommendations(model, request, total_memory)
        
        # 扩展性分析
        scalability_analysis = self._analyze_scalability(model, request)
        
        return InferenceResponse(
            # 基础显存信息
            total_memory_gb=total_memory,
            model_memory_gb=model_memory,
            activation_memory_gb=activation_memory,
            optimizer_memory_gb=None,
            gradient_memory_gb=None,
            framework_overhead_gb=total_memory * (backend_multiplier - 1),
            recommended_gpus=recommended_gpus,
            min_gpu_count=min_gpu_count,
            optimal_gpu_count=optimal_gpu_count,
            
            # 推理特定信息
            backend=request.backend,
            quantization=request.quantization,
            kv_cache_memory_gb=kv_cache_memory,
            max_concurrent_requests=max_concurrent_requests,
            estimated_throughput=estimated_throughput,
            estimated_latency_p50_ms=estimated_latency_p50,
            estimated_latency_p99_ms=estimated_latency_p99,
            memory_breakdown=memory_breakdown,
            recommendations=recommendations,
            scalability_analysis=scalability_analysis
        )
    
    def _get_model_info(self, request: InferenceRequest) -> ModelInfo:
        """获取模型信息"""
        if request.model_id:
            return self.model_registry.get_model_info(request.model_id)
        elif request.custom_model:
            return request.custom_model
        else:
            raise ValueError("必须提供模型信息")
    
    def _calculate_model_memory(self, model: ModelInfo, request: InferenceRequest) -> float:
        """计算模型权重显存"""
        base_memory = self.calculate_model_memory(model, request.precision)
        
        # 应用量化压缩
        compression_ratio = self.QUANTIZATION_COMPRESSION_RATIO.get(request.quantization, 1.0)
        return base_memory * compression_ratio
    
    def _calculate_kv_cache_memory(self, model: ModelInfo, request: InferenceRequest) -> float:
        """计算KV Cache显存"""
        # KV Cache大小 = 2 * batch_size * total_sequence_length * num_layers * num_heads * head_dim * bytes_per_element
        # 总序列长度 = 输入序列长度 + 最大新生成token长度
        bytes_per_element = self.PRECISION_BYTES[request.precision]
        head_dim = model.hidden_size // model.num_heads
        
        # 计算总序列长度（输入 + 输出）
        total_sequence_length = request.max_sequence_length + request.max_new_tokens
        
        kv_cache_size = (2 * request.max_batch_size * total_sequence_length * 
                        model.num_layers * model.num_heads * head_dim * bytes_per_element)
        
        return self.convert_bytes(kv_cache_size)
    
    def _calculate_activation_memory(self, model: ModelInfo, request: InferenceRequest) -> float:
        """计算激活值显存"""
        bytes_per_element = self.PRECISION_BYTES[request.precision]
        
        # 计算总序列长度（输入 + 输出）
        total_sequence_length = request.max_sequence_length + request.max_new_tokens
        
        # 基础激活值：包含所有Transformer层的激活值
        # 推理时虽然是单向计算，但仍需要存储每层的激活值用于后续计算
        activation_size = (request.max_batch_size * total_sequence_length * 
                         model.hidden_size * model.num_layers * bytes_per_element)
        
        # 注意力机制的激活值（Q, K, V矩阵）
        # 推理时注意力计算同样产生O(n²)的中间结果
        attention_size = (request.max_batch_size * model.num_heads * 
                        total_sequence_length * total_sequence_length * 
                        bytes_per_element * model.num_layers)
        
        total_bytes = activation_size + attention_size
        
        # 推理时通常不使用梯度检查点，但可能有其他优化
        # 注意：推理的激活值通常比训练小，因为不需要保存用于反向传播的中间结果
        # 这里我们使用一个保守的折扣因子
        total_bytes *= 0.6  # 推理时激活值约为训练时的60%
        
        return self.convert_bytes(total_bytes)
    
    def _calculate_max_concurrent_requests(self, model: ModelInfo, request: InferenceRequest, 
                                         kv_cache_memory: float) -> int:
        """计算最大并发请求数"""
        # 基于KV Cache显存限制计算
        if kv_cache_memory > 0:
            # 假设80GB显存，留出模型权重和其他开销后的可用显存
            available_memory = 80 - self.calculate_model_memory(model, request.precision) - 10
            max_requests = max(1, int(available_memory / (kv_cache_memory / request.max_batch_size)))
        else:
            max_requests = request.max_batch_size
        
        return min(max_requests, 100)  # 限制最大值
    
    def _estimate_throughput(self, model: ModelInfo, request: InferenceRequest) -> float:
        """预估吞吐量（tokens/s）"""
        # 基础吞吐量估算
        base_throughput = 10000  # 基础tokens/s
        
        # 根据模型大小调整
        if model.parameters > 70e9:  # > 70B
            base_throughput *= 0.1
        elif model.parameters > 13e9:  # > 13B
            base_throughput *= 0.4
        elif model.parameters > 7e9:   # > 7B
            base_throughput *= 0.7
        
        # 根据量化方法调整
        if request.quantization in [QuantizationMethod.INT4, QuantizationMethod.GPTQ, QuantizationMethod.AWQ]:
            base_throughput *= 1.5  # 量化可以提升速度
        elif request.quantization == QuantizationMethod.INT8:
            base_throughput *= 1.2
        
        # 根据批次大小调整
        throughput = base_throughput * request.max_batch_size * 0.8  # 批处理效率约80%
        
        return throughput
    
    def _estimate_latency(self, model: ModelInfo, request: InferenceRequest, percentile: int = 50) -> float:
        """预估延迟（ms）"""
        # 基础延迟估算
        base_latency = 50  # 基础延迟ms
        
        # 根据模型大小调整
        if model.parameters > 70e9:  # > 70B
            base_latency *= 10
        elif model.parameters > 30e9:  # > 30B
            base_latency *= 5
        elif model.parameters > 13e9:  # > 13B
            base_latency *= 2.5
        elif model.parameters > 7e9:   # > 7B
            base_latency *= 1.5
        
        # 根据序列长度调整
        seq_factor = request.max_sequence_length / 2048
        base_latency *= seq_factor
        
        # 根据批次大小调整（批处理会增加延迟）
        batch_factor = 1 + (request.max_batch_size - 1) * 0.1
        base_latency *= batch_factor
        
        # 根据量化方法调整
        if request.quantization in [QuantizationMethod.INT4, QuantizationMethod.GPTQ, QuantizationMethod.AWQ]:
            base_latency *= 0.7  # 量化可以减少延迟
        elif request.quantization == QuantizationMethod.INT8:
            base_latency *= 0.85
        
        # 根据后端调整
        if request.backend == InferenceBackend.VLLM:
            base_latency *= 0.8  # vLLM优化较好
        
        # P99延迟通常是P50的2-3倍
        if percentile == 99:
            base_latency *= 2.5
        
        return max(10, base_latency)  # 最小10ms
    
    def _generate_recommendations(self, model: ModelInfo, request: InferenceRequest, 
                                total_memory: float) -> Dict[str, Any]:
        """生成优化建议"""
        recommendations = {}
        
        # 量化建议
        if request.quantization == QuantizationMethod.NONE and model.parameters > 10e9:
            recommendations["quantization"] = [
                "考虑使用INT4或GPTQ量化以减少显存占用",
                "量化可以显著提升推理速度和并发能力"
            ]
        
        # 后端选择建议（仅保留通用建议）
        if request.backend == InferenceBackend.TRANSFORMERS and model.parameters > 7e9:
            recommendations["backend"] = [
                "对于大模型，建议使用vLLM以获得更好性能",
                "vLLM在大模型推理上有更好的显存和计算优化"
            ]
        
        # 并行策略建议
        if total_memory > 80 and request.tensor_parallel == 1:
            recommendations["parallelization"] = [
                "考虑使用张量并行以分布模型权重",
                "多GPU部署可以提升吞吐量和减少延迟"
            ]
        
        return recommendations
    
    def _analyze_scalability(self, model: ModelInfo, request: InferenceRequest) -> Dict[str, Any]:
        """扩展性分析"""
        analysis = {}
        
        # 吞吐量扩展性
        single_gpu_throughput = self._estimate_throughput(model, request)
        analysis["throughput_scaling"] = {
            "single_gpu": single_gpu_throughput,
            "estimated_2_gpu": single_gpu_throughput * 1.8,
            "estimated_4_gpu": single_gpu_throughput * 3.2,
            "estimated_8_gpu": single_gpu_throughput * 5.6
        }
        
        # 显存扩展性
        analysis["memory_scaling"] = {
            "model_memory_per_gpu": self.calculate_model_memory(model, request.precision) / request.tensor_parallel,
            "kv_cache_scaling": "线性增长",
            "recommended_max_concurrent_users": self._calculate_max_concurrent_requests(model, request, 0) * 10
        }
        
        return analysis 