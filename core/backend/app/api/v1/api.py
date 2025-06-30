"""
API v1 路由汇总
"""

from fastapi import APIRouter

from .endpoints import training, inference

# 创建API路由器
api_router = APIRouter()

# 注册各个端点路由
api_router.include_router(training.router, prefix="/training", tags=["Training"])
api_router.include_router(inference.router, prefix="/inference", tags=["Inference"]) 