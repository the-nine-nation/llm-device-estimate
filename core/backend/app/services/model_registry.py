"""
模型注册服务
"""

from typing import Dict, Any, List, Optional
from ..models.common import ModelInfo, PrecisionType, ModelSize


class ModelRegistry:
    """模型注册表"""
    
    def __init__(self):
        """初始化模型注册表"""
        self._models = self._initialize_models()
    
    def _initialize_models(self) -> Dict[str, ModelInfo]:
        """初始化预定义模型"""
        models = {}
        
        # LLaMA系列
        models["llama-7b"] = ModelInfo(
            id="llama-7b",
            name="LLaMA 7B",
            family="llama",
            parameters=7000000000,
            hidden_size=4096,
            num_layers=32,
            num_heads=32,
            vocab_size=32000,
            context_length=2048,
            architecture="llama",
            precision=PrecisionType.FP16,
            size_category=ModelSize.MEDIUM
        )
        
        models["llama-13b"] = ModelInfo(
            id="llama-13b",
            name="LLaMA 13B",
            family="llama",
            parameters=13000000000,
            hidden_size=5120,
            num_layers=40,
            num_heads=40,
            vocab_size=32000,
            context_length=2048,
            architecture="llama",
            precision=PrecisionType.FP16,
            size_category=ModelSize.LARGE
        )
        
        models["llama-70b"] = ModelInfo(
            id="llama-70b",
            name="LLaMA 70B",
            family="llama",
            parameters=70000000000,
            hidden_size=8192,
            num_layers=80,
            num_heads=64,
            vocab_size=32000,
            context_length=2048,
            architecture="llama",
            precision=PrecisionType.FP16,
            size_category=ModelSize.XLARGE
        )
        
        # LLaMA 2系列
        models["llama2-7b"] = ModelInfo(
            id="llama2-7b",
            name="LLaMA 2 7B",
            family="llama",
            parameters=7000000000,
            hidden_size=4096,
            num_layers=32,
            num_heads=32,
            vocab_size=32000,
            context_length=4096,
            architecture="llama",
            precision=PrecisionType.FP16,
            size_category=ModelSize.MEDIUM
        )
        
        models["llama2-13b"] = ModelInfo(
            id="llama2-13b",
            name="LLaMA 2 13B",
            family="llama",
            parameters=13000000000,
            hidden_size=5120,
            num_layers=40,
            num_heads=40,
            vocab_size=32000,
            context_length=4096,
            architecture="llama",
            precision=PrecisionType.FP16,
            size_category=ModelSize.LARGE
        )
        
        models["llama2-70b"] = ModelInfo(
            id="llama2-70b",
            name="LLaMA 2 70B",
            family="llama",
            parameters=70000000000,
            hidden_size=8192,
            num_layers=80,
            num_heads=64,
            vocab_size=32000,
            context_length=4096,
            architecture="llama",
            precision=PrecisionType.FP16,
            size_category=ModelSize.XLARGE
        )
        
        # 通义千问系列
        models["qwen-7b"] = ModelInfo(
            id="qwen-7b",
            name="Qwen 7B",
            family="qwen",
            parameters=7720000000,
            hidden_size=4096,
            num_layers=32,
            num_heads=32,
            vocab_size=151936,
            context_length=8192,
            architecture="qwen",
            precision=PrecisionType.FP16,
            size_category=ModelSize.MEDIUM
        )
        
        models["qwen-14b"] = ModelInfo(
            id="qwen-14b",
            name="Qwen 14B",
            family="qwen",
            parameters=14700000000,
            hidden_size=5120,
            num_layers=40,
            num_heads=40,
            vocab_size=151936,
            context_length=8192,
            architecture="qwen",
            precision=PrecisionType.FP16,
            size_category=ModelSize.LARGE
        )
        
        models["qwen-72b"] = ModelInfo(
            id="qwen-72b",
            name="Qwen 72B",
            family="qwen",
            parameters=72700000000,
            hidden_size=8192,
            num_layers=80,
            num_heads=64,
            vocab_size=151936,
            context_length=32768,
            architecture="qwen",
            precision=PrecisionType.FP16,
            size_category=ModelSize.XLARGE
        )
        
        # Qwen2系列
        models["qwen2-7b"] = ModelInfo(
            id="qwen2-7b",
            name="Qwen2 7B",
            family="qwen",
            parameters=7720000000,
            hidden_size=4096,
            num_layers=28,
            num_heads=32,
            vocab_size=151936,
            context_length=131072,
            architecture="qwen",
            precision=PrecisionType.FP16,
            size_category=ModelSize.MEDIUM
        )
        
        models["qwen2-72b"] = ModelInfo(
            id="qwen2-72b",
            name="Qwen2 72B",
            family="qwen",
            parameters=72700000000,
            hidden_size=8192,
            num_layers=80,
            num_heads=64,
            vocab_size=151936,
            context_length=131072,
            architecture="qwen",
            precision=PrecisionType.FP16,
            size_category=ModelSize.XLARGE
        )
        
        # Mistral系列
        models["mistral-7b"] = ModelInfo(
            id="mistral-7b",
            name="Mistral 7B",
            family="mistral",
            parameters=7200000000,
            hidden_size=4096,
            num_layers=32,
            num_heads=32,
            vocab_size=32000,
            context_length=32768,
            architecture="mistral",
            precision=PrecisionType.FP16,
            size_category=ModelSize.MEDIUM
        )
        
        models["mixtral-8x7b"] = ModelInfo(
            id="mixtral-8x7b",
            name="Mixtral 8x7B",
            family="mistral",
            parameters=46700000000,  # 8个专家，每个7B参数
            hidden_size=4096,
            num_layers=32,
            num_heads=32,
            vocab_size=32000,
            context_length=32768,
            architecture="mixtral",
            precision=PrecisionType.FP16,
            size_category=ModelSize.XLARGE
        )
        
        # ChatGLM系列
        models["chatglm-6b"] = ModelInfo(
            id="chatglm-6b",
            name="ChatGLM 6B",
            family="chatglm",
            parameters=6200000000,
            hidden_size=4096,
            num_layers=28,
            num_heads=32,
            vocab_size=130528,
            context_length=2048,
            architecture="chatglm",
            precision=PrecisionType.FP16,
            size_category=ModelSize.MEDIUM
        )
        
        # Baichuan系列
        models["baichuan-7b"] = ModelInfo(
            id="baichuan-7b",
            name="Baichuan 7B",
            family="baichuan",
            parameters=7000000000,
            hidden_size=4096,
            num_layers=32,
            num_heads=32,
            vocab_size=64000,
            context_length=4096,
            architecture="baichuan",
            precision=PrecisionType.FP16,
            size_category=ModelSize.MEDIUM
        )
        
        return models
    
    def get_all_models(self) -> List[Dict[str, Any]]:
        """
        获取所有模型列表
        
        Returns:
            模型列表
        """
        return [
            {
                "id": model.id,
                "name": model.name,
                "family": model.family,
                "parameters": model.parameters,
                "size_category": model.size_category.value,
                "context_length": model.context_length,
                "architecture": model.architecture
            }
            for model in self._models.values()
        ]
    
    def get_model_info(self, model_id: str) -> ModelInfo:
        """
        获取指定模型的详细信息
        
        Args:
            model_id: 模型ID
            
        Returns:
            模型详细信息
            
        Raises:
            ValueError: 模型不存在时抛出
        """
        if model_id not in self._models:
            raise ValueError(f"模型 {model_id} 不存在")
        
        return self._models[model_id]
    
    def get_models_by_family(self, family: str) -> List[ModelInfo]:
        """
        根据模型系列获取模型列表
        
        Args:
            family: 模型系列名称
            
        Returns:
            该系列的模型列表
        """
        return [model for model in self._models.values() if model.family == family]
    
    def get_models_by_size(self, size_category: ModelSize) -> List[ModelInfo]:
        """
        根据模型规模获取模型列表
        
        Args:
            size_category: 模型规模类别
            
        Returns:
            该规模的模型列表
        """
        return [model for model in self._models.values() if model.size_category == size_category]
    
    def register_custom_model(self, model: ModelInfo) -> None:
        """
        注册自定义模型
        
        Args:
            model: 自定义模型信息
        """
        if model.id in self._models:
            raise ValueError(f"模型ID {model.id} 已存在")
        
        self._models[model.id] = model
    
    def update_model(self, model_id: str, model: ModelInfo) -> None:
        """
        更新模型信息
        
        Args:
            model_id: 模型ID
            model: 新的模型信息
        """
        if model_id not in self._models:
            raise ValueError(f"模型 {model_id} 不存在")
        
        self._models[model_id] = model
    
    def remove_model(self, model_id: str) -> None:
        """
        移除模型
        
        Args:
            model_id: 模型ID
        """
        if model_id not in self._models:
            raise ValueError(f"模型 {model_id} 不存在")
        
        del self._models[model_id] 