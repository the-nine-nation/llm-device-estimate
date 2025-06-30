"""
FastAPI应用主入口
大语言模型训练与推理资源预估系统
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .api.v1.api import api_router
from .config import settings

# 创建FastAPI应用实例  
app = FastAPI(
    title="LLM Resource Estimation API",
    description="大语言模型训练与推理资源预估系统API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册API路由
app.include_router(api_router, prefix="/api/v1")

# 健康检查端点
@app.get("/health")
async def health_check():
    """健康检查端点"""
    return JSONResponse({
        "status": "healthy",
        "service": "LLM Resource Estimation API",
        "version": "0.1.0"
    })

# 根路径
@app.get("/")
async def root():
    """根路径欢迎信息"""
    return JSONResponse({
        "message": "Welcome to LLM Resource Estimation API",
        "docs": "/docs",
        "health": "/health"
    }) 