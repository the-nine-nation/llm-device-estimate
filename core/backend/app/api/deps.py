"""
依赖注入
"""

from typing import Generator
from fastapi import Depends, HTTPException, status
from ..services.model_registry import ModelRegistry
from ..services.calculator.training_calc import TrainingCalculator
from ..services.calculator.inference_calc import InferenceCalculator


def get_model_registry() -> ModelRegistry:
    """获取模型注册表实例"""
    return ModelRegistry()


def get_training_calculator() -> TrainingCalculator:
    """获取训练计算器实例"""
    return TrainingCalculator()


def get_inference_calculator() -> InferenceCalculator:
    """获取推理计算器实例"""
    return InferenceCalculator()


# 未来可以添加数据库连接、缓存等依赖
# def get_db() -> Generator:
#     """获取数据库连接"""
#     pass

# def get_cache() -> Generator:
#     """获取缓存连接"""
#     pass 