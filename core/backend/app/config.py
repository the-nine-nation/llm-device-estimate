"""
应用配置管理
"""

from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """应用配置类"""
    
    # 应用基本配置
    PROJECT_NAME: str = "LLM Resource Estimation API"
    VERSION: str = "0.1.0"
    DEBUG: bool = True
    
    # CORS配置
    ALLOWED_HOSTS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # API配置
    API_V1_STR: str = "/api/v1"
    
    # 服务器配置
    HOST: str = "0.0.0.0"
    PORT: int = 8787
    
    class Config:
        env_file = ".env"


# 全局配置实例
settings = Settings() 