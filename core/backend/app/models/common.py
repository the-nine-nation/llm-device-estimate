"""
通用数据模型
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from enum import Enum


class PrecisionType(str, Enum):
    """精度类型枚举"""
    FP32 = "fp32"
    FP16 = "fp16"
    BF16 = "bf16"


class ModelSize(str, Enum):
    """模型规模枚举"""
    SMALL = "small"      # < 1B
    MEDIUM = "medium"    # 1B - 10B
    LARGE = "large"      # 10B - 100B
    XLARGE = "xlarge"    # > 100B


class GPUInfo(BaseModel):
    """GPU信息模型"""
    name: str = Field(..., description="GPU名称")
    memory_gb: float = Field(..., description="显存大小(GB)")
    memory_bandwidth_gb_s: float = Field(..., description="显存带宽(GB/s)")
    compute_capability: str = Field(..., description="计算能力")
    fp16_tflops: Optional[float] = Field(None, description="FP16半精度算力(TFLOPS)")
    
    @property
    def has_tensor_cores(self) -> bool:
        """
        判断GPU是否支持Tensor Cores
        
        Tensor Cores从Volta架构开始支持（compute capability >= 7.0）
        """
        try:
            major, minor = map(int, self.compute_capability.split('.'))
            return major >= 7
        except (ValueError, AttributeError):
            return False


class ResourceEstimate(BaseModel):
    """资源预估结果基类"""
    total_memory_gb: float = Field(..., description="总显存需求(GB)")
    model_memory_gb: float = Field(..., description="模型权重显存(GB)")
    activation_memory_gb: float = Field(..., description="激活值显存(GB)")
    optimizer_memory_gb: Optional[float] = Field(None, description="优化器状态显存(GB)")
    gradient_memory_gb: Optional[float] = Field(None, description="梯度显存(GB)")
    framework_overhead_gb: float = Field(default=1.0, description="框架开销(GB)")
    recommended_gpus: List[GPUInfo] = Field(default_factory=list, description="推荐GPU")
    min_gpu_count: int = Field(..., description="最少GPU数量")
    optimal_gpu_count: int = Field(..., description="最优GPU数量")


class ModelInfo(BaseModel):
    """模型信息"""
    id: str = Field(..., description="模型ID")
    name: str = Field(..., description="模型名称")
    family: str = Field(..., description="模型系列")
    parameters: int = Field(..., description="参数量")
    hidden_size: int = Field(..., description="隐藏层大小")
    num_layers: int = Field(..., description="层数")
    num_heads: int = Field(..., description="注意力头数")
    vocab_size: int = Field(..., description="词汇表大小")
    context_length: int = Field(..., description="上下文长度")
    architecture: str = Field(..., description="架构类型")
    precision: PrecisionType = Field(default=PrecisionType.FP16, description="默认精度")
    size_category: ModelSize = Field(..., description="模型规模类别") 