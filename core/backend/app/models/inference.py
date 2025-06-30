"""
推理相关数据模型
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any
from enum import Enum

from .common import ResourceEstimate, PrecisionType, ModelInfo


class InferenceBackend(str, Enum):
    """推理后端枚举"""
    VLLM = "vllm"
    TRANSFORMERS = "transformers"


class QuantizationMethod(str, Enum):
    """量化方法枚举"""
    NONE = "none"
    INT8 = "int8"
    INT4 = "int4"
    GPTQ = "gptq"
    AWQ = "awq"


class InferenceRequest(BaseModel):
    """推理预估请求"""
    # 模型配置
    model_id: Optional[str] = Field(None, description="预定义模型ID")
    custom_model: Optional[ModelInfo] = Field(None, description="自定义模型信息")
    
    # 推理配置
    backend: InferenceBackend = Field(..., description="推理后端")
    precision: PrecisionType = Field(default=PrecisionType.FP16, description="推理精度")
    quantization: QuantizationMethod = Field(default=QuantizationMethod.NONE, description="量化方法")
    
    # 批处理配置
    max_batch_size: int = Field(default=1, ge=1, le=512, description="最大批次大小")
    max_sequence_length: int = Field(..., ge=128, le=32768, description="最大序列长度")
    max_new_tokens: int = Field(default=512, ge=1, le=4096, description="最大新生成tokens")
    
    # 并行配置
    tensor_parallel: int = Field(default=1, ge=1, description="张量并行度")
    pipeline_parallel: int = Field(default=1, ge=1, description="流水线并行度")
    
    # KV Cache配置
    kv_cache_dtype: Optional[str] = Field(None, description="KV Cache数据类型")
    kv_cache_quantization: Optional[str] = Field(None, description="KV Cache量化")
    
    # 性能要求
    target_throughput: Optional[float] = Field(None, gt=0, description="目标吞吐量(tokens/s)")
    target_latency_ms: Optional[float] = Field(None, gt=0, description="目标延迟(ms)")
    
    # 硬件约束
    max_gpu_count: Optional[int] = Field(None, ge=1, description="最大GPU数量限制")
    gpu_memory_limit_gb: Optional[float] = Field(None, gt=0, description="单GPU显存限制(GB)")

    @validator('custom_model')
    def validate_model_info(cls, v, values):
        """验证模型信息"""
        model_id = values.get('model_id')
        if not model_id and not v:
            raise ValueError("必须提供model_id或custom_model之一")
        if model_id and v:
            raise ValueError("不能同时提供model_id和custom_model")
        return v


class InferenceResponse(ResourceEstimate):
    """推理预估响应"""
    # 继承ResourceEstimate的所有字段
    
    # 推理特定字段
    backend: InferenceBackend = Field(..., description="推理后端")
    quantization: QuantizationMethod = Field(..., description="量化方法")
    
    # KV Cache信息
    kv_cache_memory_gb: float = Field(..., description="KV Cache显存需求(GB)")
    max_concurrent_requests: int = Field(..., description="最大并发请求数")
    
    # 性能预估
    estimated_throughput: float = Field(..., description="预估吞吐量(tokens/s)")
    estimated_latency_p50_ms: float = Field(..., description="预估P50延迟(ms)")
    estimated_latency_p99_ms: float = Field(..., description="预估P99延迟(ms)")
    
    # 详细的显存分解
    memory_breakdown: Dict[str, float] = Field(..., description="显存使用详细分解")
    
    # 配置建议
    recommendations: Dict[str, Any] = Field(default_factory=dict, description="优化建议")
    
    # 扩展性分析
    scalability_analysis: Dict[str, Any] = Field(default_factory=dict, description="扩展性分析") 