"""
训练预估API端点
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any

from ....models.training import TrainingRequest, TrainingResponse
from ....services.calculator.training_calc import TrainingCalculator

router = APIRouter()

@router.post("/estimate", response_model=TrainingResponse)
async def estimate_training_resources(request: TrainingRequest) -> TrainingResponse:
    """
    预估训练资源需求
    
    Args:
        request: 训练预估请求参数
        
    Returns:
        训练资源预估结果
    """
    try:
        calculator = TrainingCalculator()
        result = calculator.calculate(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/configs")
async def get_training_configs() -> Dict[str, Any]:
    """
    获取训练配置选项
    
    Returns:
        训练配置选项字典
    """
    return {
        "training_methods": [
            {"id": "full_finetuning", "name": "全参数微调", "description": "训练所有参数，效果最好但资源需求高"},
            {"id": "lora", "name": "LoRA微调", "description": "只训练少量参数，资源需求低，效果接近全参数微调"}
        ],
        "precision_types": [
            {"id": "fp32", "name": "FP32", "description": "32位浮点精度"},
            {"id": "fp16", "name": "FP16", "description": "16位浮点精度"},
            {"id": "bf16", "name": "BF16", "description": "Brain Float 16精度"}
        ],
        "optimizers": [
            {"id": "adamw", "name": "AdamW", "description": "Adam with weight decay"},
            {"id": "sgd", "name": "SGD", "description": "随机梯度下降"},
            {"id": "adam", "name": "Adam", "description": "自适应矩估计"}
        ],
        "deepspeed_stages": [
            {"id": "stage0", "name": "Stage 0", "description": "无显存优化"},
            {"id": "stage1", "name": "Stage 1", "description": "优化器状态分片"},
            {"id": "stage2", "name": "Stage 2", "description": "梯度+优化器状态分片"},
            {"id": "stage3", "name": "Stage 3", "description": "模型参数+梯度+优化器状态分片"}
        ]
    } 