#!/usr/bin/env python3
"""
FastAPI服务器启动脚本
"""

import uvicorn
from app.main import app

if __name__ == "__main__":
    print("🚀 启动大语言模型资源预估API服务器...")
    print("📝 API文档地址: http://localhost:8000/docs")
    print("🔍 健康检查: http://localhost:8000/health")
    print("⚡ 停止服务器: Ctrl+C")
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8787,
        reload=True,
        log_level="info"
    ) 