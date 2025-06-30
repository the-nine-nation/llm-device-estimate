"""
数据验证工具
"""

from typing import Any, Dict, List, Optional
from ..models.common import ModelInfo, PrecisionType
from ..models.training import TrainingMethod, OptimizerType
from ..models.inference import InferenceBackend, QuantizationMethod


def validate_model_parameters(parameters: int) -> bool:
    """
    验证模型参数数量是否合理
    
    Args:
        parameters: 参数数量
        
    Returns:
        是否有效
    """
    # 参数量应该在100M到1000B之间
    return 100_000_000 <= parameters <= 1_000_000_000_000


def validate_sequence_length(seq_len: int) -> bool:
    """
    验证序列长度是否合理
    
    Args:
        seq_len: 序列长度
        
    Returns:
        是否有效
    """
    # 序列长度应该在128到131072之间，且是2的幂次
    if not (128 <= seq_len <= 131072):
        return False
    
    # 检查是否是2的幂次（对于大多数模型架构更高效）
    return (seq_len & (seq_len - 1)) == 0


def validate_batch_size(batch_size: int, max_size: int = 1024) -> bool:
    """
    验证批次大小是否合理
    
    Args:
        batch_size: 批次大小
        max_size: 最大批次大小
        
    Returns:
        是否有效
    """
    return 1 <= batch_size <= max_size


def validate_gpu_count(gpu_count: int) -> bool:
    """
    验证GPU数量是否合理
    
    Args:
        gpu_count: GPU数量
        
    Returns:
        是否有效
    """
    return 1 <= gpu_count <= 512  # 最大支持512个GPU


def validate_training_config(config: Dict[str, Any]) -> List[str]:
    """
    验证训练配置的合理性
    
    Args:
        config: 训练配置字典
        
    Returns:
        错误信息列表，空列表表示验证通过
    """
    errors = []
    
    # 验证训练方法和LoRA配置的匹配性
    training_method = config.get("training_method")
    lora_config = config.get("lora_config")
    
    if training_method in [TrainingMethod.LORA, TrainingMethod.QLORA, 
                          TrainingMethod.ADALORA, TrainingMethod.DORA]:
        if not lora_config:
            errors.append("LoRA训练方法需要提供lora_config")
        else:
            # 验证LoRA参数
            rank = lora_config.get("rank", 8)
            if not (1 <= rank <= 512):
                errors.append("LoRA rank应该在1-512之间")
            
            alpha = lora_config.get("alpha", 16)
            if not (1 <= alpha <= 1024):
                errors.append("LoRA alpha应该在1-1024之间")
    
    # 验证批次大小和梯度累积的合理性
    batch_size = config.get("batch_size", 1)
    gradient_accumulation_steps = config.get("gradient_accumulation_steps", 1)
    data_parallel = config.get("data_parallel", 1)
    
    effective_batch_size = batch_size * gradient_accumulation_steps * data_parallel
    if effective_batch_size > 2048:
        errors.append("有效批次大小过大，可能导致训练不稳定")
    
    # 验证并行策略
    tensor_parallel = config.get("tensor_parallel", 1)
    pipeline_parallel = config.get("pipeline_parallel", 1)
    
    if tensor_parallel * pipeline_parallel > data_parallel:
        errors.append("张量并行*流水线并行不能超过数据并行度")
    
    return errors


def validate_inference_config(config: Dict[str, Any]) -> List[str]:
    """
    验证推理配置的合理性
    
    Args:
        config: 推理配置字典
        
    Returns:
        错误信息列表，空列表表示验证通过
    """
    errors = []
    
    # 验证后端和量化方法的兼容性
    backend = config.get("backend")
    quantization = config.get("quantization")
    
    if backend == InferenceBackend.TENSORRT_LLM:
        if quantization == QuantizationMethod.NONE:
            errors.append("TensorRT-LLM建议使用量化以获得最佳性能")
    
    # 验证批次大小限制
    max_batch_size = config.get("max_batch_size", 1)
    if backend == InferenceBackend.TRANSFORMERS and max_batch_size > 32:
        errors.append("Transformers后端不建议使用超过32的批次大小")
    
    # 验证序列长度和显存的合理性
    max_sequence_length = config.get("max_sequence_length")
    if max_sequence_length and max_batch_size:
        estimated_kv_cache_gb = (max_batch_size * max_sequence_length * 4096 * 32 * 2 * 2) / (1024**3)
        if estimated_kv_cache_gb > 40:  # 粗略估算
            errors.append("当前配置的KV Cache可能超过单GPU显存限制")
    
    return errors


def validate_hardware_constraints(memory_gb: float, gpu_memory_limit: Optional[float] = None) -> List[str]:
    """
    验证硬件约束
    
    Args:
        memory_gb: 所需显存（GB）
        gpu_memory_limit: GPU显存限制（GB）
        
    Returns:
        警告信息列表
    """
    warnings = []
    
    if memory_gb > 80:
        warnings.append("显存需求超过单张A100显存，需要使用模型并行或更大显存的GPU")
    
    if gpu_memory_limit and memory_gb > gpu_memory_limit:
        warnings.append(f"显存需求.*超过指定的GPU显存限制({gpu_memory_limit}GB)")
    
    if memory_gb < 1:
        warnings.append("显存需求过小，可能存在计算错误")
    
    return warnings 