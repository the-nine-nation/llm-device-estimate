#!/usr/bin/env python3
"""
基础功能测试
运行此脚本验证后端核心功能是否正常工作
"""

import sys
import os

# 添加项目路径到Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

def test_imports():
    """测试导入是否正常"""
    print("🔍 测试模块导入...")
    
    try:
        from app.models.common import ModelInfo, PrecisionType, ModelSize
        from app.models.training import TrainingRequest, TrainingMethod
        from app.models.inference import InferenceRequest, InferenceBackend
        from app.services.model_registry import ModelRegistry
        from app.services.calculator.training_calc import TrainingCalculator
        from app.services.calculator.inference_calc import InferenceCalculator
        print("✅ 所有模块导入成功")
        return True
    except Exception as e:
        print(f"❌ 模块导入失败: {e}")
        return False


def test_model_registry():
    """测试模型注册表"""
    print("\n🔍 测试模型注册表...")
    
    try:
        registry = ModelRegistry()
        
        # 测试获取所有模型
        models = registry.get_all_models()
        print(f"✅ 模型注册表包含 {len(models)} 个预定义模型")
        
        # 测试获取特定模型
        llama_7b = registry.get_model_info("llama-7b")
        print(f"✅ 成功获取LLaMA 7B模型信息: {llama_7b.name}")
        
        # 测试按系列获取模型
        llama_models = registry.get_models_by_family("llama")
        print(f"✅ LLaMA系列包含 {len(llama_models)} 个模型")
        
        return True
    except Exception as e:
        print(f"❌ 模型注册表测试失败: {e}")
        return False


def test_training_calculator():
    """测试训练计算器"""
    print("\n🔍 测试训练计算器...")
    
    try:
        from app.models.training import TrainingRequest, TrainingMethod, OptimizerType
        from app.models.common import PrecisionType
        
        # 创建测试请求
        request = TrainingRequest(
            model_id="llama-7b",
            training_method=TrainingMethod.LORA,
            precision=PrecisionType.FP16,
            batch_size=4,
            sequence_length=2048,
            optimizer=OptimizerType.ADAMW
        )
        
        calculator = TrainingCalculator()
        result = calculator.calculate(request)
        
        print(f"✅ 训练计算成功:")
        print(f"   - 总显存需求: {result.total_memory_gb:.2f} GB")
        print(f"   - 模型权重: {result.model_memory_gb:.2f} GB")
        print(f"   - 激活值: {result.activation_memory_gb:.2f} GB")
        print(f"   - 最少GPU数量: {result.min_gpu_count}")
        
        return True
    except Exception as e:
        print(f"❌ 训练计算器测试失败: {e}")
        return False


def test_inference_calculator():
    """测试推理计算器"""
    print("\n🔍 测试推理计算器...")
    
    try:
        from app.models.inference import InferenceRequest, InferenceBackend, QuantizationMethod
        from app.models.common import PrecisionType
        
        # 创建测试请求
        request = InferenceRequest(
            model_id="llama-7b",
            backend=InferenceBackend.VLLM,
            precision=PrecisionType.FP16,
            quantization=QuantizationMethod.NONE,
            max_batch_size=8,
            max_sequence_length=2048
        )
        
        calculator = InferenceCalculator()
        result = calculator.calculate(request)
        
        print(f"✅ 推理计算成功:")
        print(f"   - 总显存需求: {result.total_memory_gb:.2f} GB")
        print(f"   - KV Cache: {result.kv_cache_memory_gb:.2f} GB")
        print(f"   - 预估吞吐量: {result.estimated_throughput:.0f} tokens/s")
        print(f"   - 最大并发请求: {result.max_concurrent_requests}")
        
        return True
    except Exception as e:
        print(f"❌ 推理计算器测试失败: {e}")
        return False


def main():
    """主测试函数"""
    print("🚀 开始后端基础功能测试\n")
    
    tests = [
        test_imports,
        test_model_registry,
        test_training_calculator,
        test_inference_calculator
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        if test():
            passed += 1
        else:
            failed += 1
    
    print(f"\n📊 测试结果:")
    print(f"✅ 通过: {passed}")
    print(f"❌ 失败: {failed}")
    
    if failed == 0:
        print(f"\n🎉 所有测试通过！后端基础功能正常工作。")
    else:
        print(f"\n⚠️  有 {failed} 个测试失败，请检查相关模块。")
    
    return failed == 0


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 