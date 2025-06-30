"""
推理预估API端点
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any

from ....models.inference import InferenceRequest, InferenceResponse
from ....services.calculator.inference_calc import InferenceCalculator

router = APIRouter()

@router.post("/estimate", response_model=InferenceResponse)
async def estimate_inference_resources(request: InferenceRequest) -> InferenceResponse:
    """
    预估推理资源需求
    
    Args:
        request: 推理预估请求参数
        
    Returns:
        推理资源预估结果
    """
    try:
        calculator = InferenceCalculator()
        result = calculator.calculate(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/backends")
async def get_inference_backends() -> Dict[str, Any]:
    """
    获取推理后端列表
    
    Returns:
        推理后端配置选项
    """
    return {
        "backends": [
            {
                "id": "vllm",
                "name": "vLLM",
                "description": "高性能大模型推理服务",
                "features": ["高吞吐量", "PagedAttention", "连续批处理"]
            },
            {
                "id": "transformers",
                "name": "Transformers",
                "description": "HuggingFace Transformers",
                "features": ["模型支持广泛", "社区活跃", "易于集成"]
            }
        ],
        "quantization_methods": [
            {"id": "none", "name": "无量化", "description": "使用原始精度"},
            {"id": "int8", "name": "INT8", "description": "8位整数量化"},
            {"id": "int4", "name": "INT4", "description": "4位整数量化"},
            {"id": "gptq", "name": "GPTQ", "description": "生成式预训练Transformer量化"},
            {"id": "awq", "name": "AWQ", "description": "激活感知权重量化"}
        ]
    } 