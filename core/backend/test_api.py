#!/usr/bin/env python3
"""
API测试脚本 - 测试训练和推理资源预估API
"""

import asyncio
import json
from typing import Dict, Any

import httpx

API_BASE_URL = "http://localhost:8787/api/v1"


async def test_health_check():
    """测试健康检查端点"""
    print("🔍 测试健康检查...")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{API_BASE_URL.replace('/api/v1', '')}/health")
            if response.status_code == 200:
                print("✅ 健康检查通过")
                return True
            else:
                print(f"❌ 健康检查失败: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ 健康检查连接失败: {e}")
            return False





async def test_training_estimate():
    """测试训练资源预估API"""
    print("\n🔍 测试训练资源预估API...")
    
    # 测试请求数据
    training_request = {
        "model_id": "llama-7b",
        "training_method": "lora",
        "precision": "fp16",
        "batch_size": 8,
        "sequence_length": 2048,
        "gradient_accumulation_steps": 4,
        "optimizer": "adamw",
        "learning_rate": 2e-4,
        "weight_decay": 0.01,
        "data_parallel": 1,
        "tensor_parallel": 1,
        "pipeline_parallel": 1,
        "gradient_checkpointing": True
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{API_BASE_URL}/training/estimate",
                json=training_request,
                timeout=30.0
            )
            
            if response.status_code == 200:
                result = response.json()
                print("✅ 训练资源预估成功")
                print(f"  总显存需求: {result['total_memory_gb']:.2f} GB")
                print(f"  模型权重: {result['model_memory_gb']:.2f} GB")
                print(f"  激活值: {result['activation_memory_gb']:.2f} GB")
                print(f"  优化器状态: {result.get('optimizer_memory_gb', 0):.2f} GB")
                print(f"  推荐GPU数量: {result['min_gpu_count']}-{result['optimal_gpu_count']}")
                print(f"  预估速度: {result.get('estimated_tokens_per_second', 0):.0f} tokens/s")
                
                if result.get('recommended_gpus'):
                    print("  推荐GPU配置:")
                    for i, gpu in enumerate(result['recommended_gpus'][:3]):
                        print(f"    {i+1}. {gpu['name']} ({gpu['memory_gb']}GB)")
                
                return result
            else:
                print(f"❌ 训练资源预估失败: {response.status_code}")
                print(f"   响应: {response.text}")
                return None
        except Exception as e:
            print(f"❌ 训练API测试失败: {e}")
            return None


async def test_inference_estimate():
    """测试推理资源预估API"""
    print("\n🔍 测试推理资源预估API...")
    
    # 测试请求数据
    inference_request = {
        "model_id": "llama-7b",
        "backend": "vllm",
        "precision": "fp16",
        "quantization": "none",
        "max_batch_size": 32,
        "max_sequence_length": 2048,
        "max_new_tokens": 1024,
        "tensor_parallel": 1,
        "pipeline_parallel": 1
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{API_BASE_URL}/inference/estimate",
                json=inference_request,
                timeout=30.0
            )
            
            if response.status_code == 200:
                result = response.json()
                print("✅ 推理资源预估成功")
                print(f"  总显存需求: {result['total_memory_gb']:.2f} GB")
                print(f"  模型权重: {result['model_memory_gb']:.2f} GB")
                print(f"  KV Cache: {result['kv_cache_memory_gb']:.2f} GB")
                print(f"  最大并发请求: {result['max_concurrent_requests']}")
                print(f"  预估吞吐量: {result['estimated_throughput']:.0f} tokens/s")
                print(f"  预估延迟 P50: {result['estimated_latency_p50_ms']:.1f} ms")
                print(f"  预估延迟 P99: {result['estimated_latency_p99_ms']:.1f} ms")
                
                if result.get('recommended_gpus'):
                    print("  推荐GPU配置:")
                    for i, gpu in enumerate(result['recommended_gpus'][:3]):
                        print(f"    {i+1}. {gpu['name']} ({gpu['memory_gb']}GB)")
                
                return result
            else:
                print(f"❌ 推理资源预估失败: {response.status_code}")
                print(f"   响应: {response.text}")
                return None
        except Exception as e:
            print(f"❌ 推理API测试失败: {e}")
            return None


async def test_training_configs():
    """测试训练配置API"""
    print("\n🔍 测试训练配置API...")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{API_BASE_URL}/training/configs")
            if response.status_code == 200:
                configs = response.json()
                print("✅ 获取训练配置成功")
                print(f"  训练方法: {len(configs.get('training_methods', []))} 种")
                print(f"  精度类型: {len(configs.get('precision_types', []))} 种")
                print(f"  优化器: {len(configs.get('optimizers', []))} 种")
                return configs
            else:
                print(f"❌ 获取训练配置失败: {response.status_code}")
                return None
        except Exception as e:
            print(f"❌ 训练配置API测试失败: {e}")
            return None


async def test_inference_backends():
    """测试推理后端API"""
    print("\n🔍 测试推理后端API...")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{API_BASE_URL}/inference/backends")
            if response.status_code == 200:
                backends = response.json()
                print("✅ 获取推理后端成功")
                print(f"  推理后端: {len(backends.get('backends', []))} 种")
                print(f"  量化方法: {len(backends.get('quantization_methods', []))} 种")
                return backends
            else:
                print(f"❌ 获取推理后端失败: {response.status_code}")
                return None
        except Exception as e:
            print(f"❌ 推理后端API测试失败: {e}")
            return None


async def run_comprehensive_test():
    """运行综合测试"""
    print("🚀 开始API综合测试...\n")
    
    # 测试健康检查
    health_ok = await test_health_check()
    if not health_ok:
        print("\n❌ 服务器未启动或无法连接，请先启动后端服务器")
        print("   运行命令: cd core/backend && python run_server.py")
        return
    
    # 测试各个API端点
    training_configs = await test_training_configs()
    inference_backends = await test_inference_backends()
    training_result = await test_training_estimate()
    inference_result = await test_inference_estimate()
    
    # 测试结果统计
    print("\n📊 测试结果统计:")
    tests = [
        ("健康检查", health_ok),
        ("训练配置API", training_configs is not None),
        ("推理后端API", inference_backends is not None),
        ("训练预估API", training_result is not None),
        ("推理预估API", inference_result is not None)
    ]
    
    passed = sum(1 for _, result in tests if result)
    total = len(tests)
    
    for test_name, result in tests:
        status = "✅ 通过" if result else "❌ 失败"
        print(f"  {test_name}: {status}")
    
    print(f"\n总体结果: {passed}/{total} 测试通过")
    
    if passed == total:
        print("🎉 所有API测试通过！后端服务运行正常。")
    else:
        print("⚠️  部分测试失败，请检查后端服务和API实现。")


if __name__ == "__main__":
    # 运行测试
    asyncio.run(run_comprehensive_test()) 