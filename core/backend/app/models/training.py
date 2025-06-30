"""
训练相关数据模型
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any
from enum import Enum

from .common import ResourceEstimate, PrecisionType, ModelInfo


class TrainingMethod(str, Enum):
    """训练方法枚举"""
    FULL_FINETUNING = "full_finetuning"
    LORA = "lora"


class OptimizerType(str, Enum):
    """优化器类型枚举"""
    ADAMW = "adamw"
    ADAM = "adam"
    SGD = "sgd"


class DeepSpeedStage(str, Enum):
    """DeepSpeed ZeRO阶段枚举"""
    STAGE0 = "stage0"
    STAGE1 = "stage1"
    STAGE2 = "stage2"
    STAGE3 = "stage3"


class AccelerationMethod(str, Enum):
    """加速方法枚举"""
    NONE = "none"
    FLASH_ATTENTION_2 = "flash_attention_2"
    UNSLOTH = "unsloth"


class LoRAConfig(BaseModel):
    """LoRA配置"""
    rank: int = Field(default=8, ge=1, le=512, description="LoRA秩")
    alpha: int = Field(default=16, ge=1, description="LoRA alpha参数")
    dropout: float = Field(default=0.1, ge=0.0, le=1.0, description="LoRA dropout")
    target_modules: Optional[str] = Field(default="all-linear", description="目标模块")


class TrainingRequest(BaseModel):
    """训练预估请求"""
    # 模型配置
    model_id: Optional[str] = Field(None, description="预定义模型ID")
    parameters_billion: Optional[float] = Field(None, ge=0.1, le=1000, description="模型参数数量(十亿)")
    custom_model: Optional[ModelInfo] = Field(None, description="自定义模型信息")
    
    # 训练配置
    training_method: TrainingMethod = Field(..., description="训练方法")
    precision: PrecisionType = Field(default=PrecisionType.FP16, description="训练精度")
    batch_size: int = Field(..., ge=1, le=1024, description="批次大小")
    sequence_length: int = Field(..., ge=128, le=32768, description="序列长度")
    gradient_accumulation_steps: int = Field(default=1, ge=1, description="梯度累积步数")
    
    # 优化器配置
    optimizer: OptimizerType = Field(default=OptimizerType.ADAMW, description="优化器类型")
    learning_rate: float = Field(default=1e-4, gt=0, description="学习率")
    weight_decay: float = Field(default=0.01, ge=0, description="权重衰减")
    
    # 并行策略
    data_parallel: int = Field(default=1, ge=1, description="数据并行度")
    tensor_parallel: int = Field(default=1, ge=1, description="张量并行度")
    pipeline_parallel: int = Field(default=1, ge=1, description="流水线并行度")
    deepspeed_stage: Optional[DeepSpeedStage] = Field(None, description="DeepSpeed ZeRO阶段")
    
    # LoRA特定配置
    lora_config: Optional[LoRAConfig] = Field(None, description="LoRA配置")
    
    # 其他配置
    gradient_checkpointing: bool = Field(default=False, description="是否启用梯度检查点")
    acceleration_method: AccelerationMethod = Field(default=AccelerationMethod.NONE, description="加速方法")

    @validator('custom_model')
    def validate_model_info(cls, v, values):
        """验证模型信息"""
        model_id = values.get('model_id')
        parameters_billion = values.get('parameters_billion')
        
        # 至少需要提供一种模型信息
        if not model_id and not parameters_billion and not v:
            raise ValueError("必须提供model_id、parameters_billion或custom_model之一")
        
        # 不能同时提供多种模型信息
        provided_count = sum([bool(model_id), bool(parameters_billion), bool(v)])
        if provided_count > 1:
            raise ValueError("只能提供model_id、parameters_billion或custom_model中的一个")
        
        return v

    @validator('lora_config')
    def validate_lora_config(cls, v, values):
        """验证LoRA配置"""
        training_method = values.get('training_method')
        if training_method == TrainingMethod.LORA:
            if not v:
                return LoRAConfig()  # 使用默认配置
        return v

    @validator('acceleration_method')
    def validate_acceleration_method(cls, v, values):
        """验证加速方法"""
        data_parallel = values.get('data_parallel', 1)
        if v == AccelerationMethod.UNSLOTH and data_parallel > 1:
            raise ValueError("Unsloth免费版仅支持单卡训练，多卡请选择Flash Attention 2")
        return v


class TrainingResponse(ResourceEstimate):
    """训练预估响应"""
    # 继承ResourceEstimate的所有字段
    
    # 训练特定字段
    training_method: TrainingMethod = Field(..., description="训练方法")
    effective_batch_size: int = Field(..., description="有效批次大小")
    memory_per_gpu: float = Field(..., description="单GPU显存需求(GB)")
    
    # 详细的显存分解
    memory_breakdown: Dict[str, float] = Field(..., description="显存使用详细分解")
    
    # 性能预估
    estimated_tokens_per_second: Optional[float] = Field(None, description="预估处理速度(tokens/s)")
    estimated_time_per_epoch: Optional[str] = Field(None, description="预估每轮训练时间")
    
    # 配置建议
    recommendations: Dict[str, Any] = Field(default_factory=dict, description="优化建议") 