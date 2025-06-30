"""
常量定义
"""

import json
import os
from pathlib import Path

def load_gpu_specs():
    """
    从JSON文件加载GPU硬件信息
    
    Returns:
        GPU硬件信息字典
    """
    # 获取项目根目录
    current_dir = Path(__file__).parent.parent.parent.parent.parent  # 从backend/app/utils向上到项目根目录
    gpu_data_file = current_dir / "core" / "gpu-data" / "gpu.json"
    
    try:
        with open(gpu_data_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Warning: GPU data file not found at {gpu_data_file}")
        return {}
    except json.JSONDecodeError:
        print(f"Warning: Invalid JSON in GPU data file {gpu_data_file}")
        return {}

# GPU硬件信息 - 从JSON文件动态加载
GPU_SPECS = load_gpu_specs()

# 模型架构配置
MODEL_ARCHITECTURES = {
    "llama": {
        "ffn_multiplier": 4,
        "attention_type": "multi_head",
        "activation": "silu",
        "normalization": "rms_norm"
    },
    "qwen": {
        "ffn_multiplier": 4,
        "attention_type": "multi_head",
        "activation": "silu",
        "normalization": "rms_norm"
    },
    "mistral": {
        "ffn_multiplier": 4,
        "attention_type": "group_query",
        "activation": "silu",
        "normalization": "rms_norm"
    },
    "chatglm": {
        "ffn_multiplier": 4,
        "attention_type": "multi_query",
        "activation": "gelu",
        "normalization": "layer_norm"
    },
    "baichuan": {
        "ffn_multiplier": 4,
        "attention_type": "multi_head",
        "activation": "silu",
        "normalization": "rms_norm"
    }
}

# 训练框架默认配置
TRAINING_FRAMEWORKS = {
    "transformers": {
        "memory_overhead_gb": 1.2,
        "supported_precisions": ["fp32", "fp16", "bf16"],
        "supported_optimizers": ["adamw", "adam", "sgd"]
    },
    "deepspeed": {
        "memory_overhead_gb": 2.0,
        "supported_precisions": ["fp32", "fp16", "bf16"],
        "supported_optimizers": ["adamw", "adam"],
        "zero_stages": ["stage0", "stage1", "stage2", "stage3"]
    },
    "fsdp": {
        "memory_overhead_gb": 1.8,
        "supported_precisions": ["fp32", "fp16", "bf16"],
        "supported_optimizers": ["adamw", "adam"]
    }
}

# 推理框架默认配置
INFERENCE_FRAMEWORKS = {
    "vllm": {
        "memory_overhead_multiplier": 1.2,
        "supported_quantization": ["none", "int8", "int4", "gptq", "awq"],
        "max_batch_size": 256,
        "features": ["paged_attention", "continuous_batching"]
    },
    "tensorrt_llm": {
        "memory_overhead_multiplier": 1.3,
        "supported_quantization": ["none", "int8", "int4", "gptq", "awq"],
        "max_batch_size": 128,
        "features": ["kv_cache_optimization", "custom_kernels"]
    },
    "transformers": {
        "memory_overhead_multiplier": 1.1,
        "supported_quantization": ["none", "int8"],
        "max_batch_size": 32,
        "features": ["hf_integration", "easy_deployment"]
    }
}

# 常用序列长度
COMMON_SEQUENCE_LENGTHS = [512, 1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072]

# 常用批次大小
COMMON_BATCH_SIZES = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512] 