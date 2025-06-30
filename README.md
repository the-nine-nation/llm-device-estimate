# 🚀 大语言模型训练与推理资源预估系统

> 专业的LLM资源预估工具，精准计算训练与推理硬件需求，助力AI项目高效部署

## 📋 项目概述

这是一个专门用于预估大语言模型（LLM）训练和推理阶段资源消耗的Web应用。通过精确的数学模型和算法，帮助用户在模型部署前准确评估GPU显存、内存等硬件资源需求，避免配置不当导致的部署失败或资源浪费。

**💡 核心价值：让AI资源配置有据可依，降低试错成本**

## ✨ 核心功能

### 🎯 训练资源预估
- **训练方法支持**
  - 全参数微调（Full Fine-tuning）
  - LoRA微调（Low-Rank Adaptation）
  - 动态LoRA参数配置（rank: 8-128, alpha: 16-128）

- **精确显存计算**
  - 模型权重：支持不同精度（FP32/FP16/BF16）
  - 激活值：考虑梯度检查点、Flash Attention 2、Unsloth等优化
  - 优化器状态：AdamW、Adam、SGD的内存倍数
  - 梯度缓存：全参数 vs LoRA的区别
  - 框架开销：PyTorch、DeepSpeed等固定开销

- **高级配置**
  - DeepSpeed ZeRO Stage 0-3 分片策略
  - 多种加速方法（Flash Attention 2、Unsloth）
  - 灵活的并行策略配置

### 🔍 推理资源预估
- **推理后端支持**
  - vLLM（高性能推理引擎）
  - PyTorch原生推理
  - Transformers库
  - TensorRT-LLM
  - FastChat
  - Text Generation Inference (TGI)

- **精准性能预估**
  - KV Cache动态计算（基于序列长度）
  - 量化方案支持（INT8/INT4/GPTQ/AWQ）
  - 吞吐量和延迟预估
  - 最大并发请求数分析

### 🎓 显存分解详解 **(新功能)**
每个显存组件都提供详细的计算公式帮助说明：
- **模型权重**：LoRA参数计算公式、不同精度的内存占用
- **激活值**：基础激活值和注意力激活值的计算方法
- **优化器状态**：不同优化器的内存倍数和DeepSpeed分片影响
- **梯度**：全参数 vs LoRA的梯度内存差异
- **框架开销**：各种深度学习框架的固定开销

## 🏗️ 技术架构

### 后端技术栈
- **框架**: FastAPI + Uvicorn
- **语言**: Python 3.8+
- **核心库**: NumPy, Pydantic
- **特色**: 基于GPU硬件数据库的智能推荐算法

### 前端技术栈
- **框架**: Next.js 14 + TypeScript
- **UI库**: Tailwind CSS + shadcn/ui
- **状态管理**: Zustand
- **特色**: 交互式帮助系统，1秒延迟显示专业解释

### 项目结构
```
LLM-device/
├── core/
│   ├── backend/                    # FastAPI后端服务
│   │   ├── app/
│   │   │   ├── api/v1/endpoints/  # API端点
│   │   │   ├── models/            # 数据模型
│   │   │   ├── services/calculator/ # 核心计算引擎
│   │   │   └── utils/             # 工具函数
│   │   └── requirements.txt
│   ├── front/                     # Next.js前端应用
│   │   ├── src/
│   │   │   ├── app/              # App Router页面
│   │   │   ├── components/       # React组件
│   │   │   ├── store/            # Zustand状态管理
│   │   │   └── types/            # TypeScript类型
│   │   └── package.json
│   └── gpu-data/                  # GPU硬件数据库
├── developer.md                   # 开发文档
├── start.sh                      # 一键启动脚本
└── stop.sh                       # 一键停止脚本
```

## 🎯 使用场景

- **AI研究团队**: 训练前评估硬件需求，优化资源配置
- **企业AI部门**: 制定模型部署的硬件采购计划
- **云服务商**: 为客户提供精准的资源配置建议
- **个人开发者**: 在有限硬件下选择最适合的训练配置

## 📊 GPU硬件支持

**支持的GPU型号**:
- **NVIDIA H系列**: H100-80GB, H800等
- **NVIDIA A系列**: A100-40GB/80GB, A6000等  
- **NVIDIA RTX系列**: RTX4090, RTX3090, RTX4080等
- **NVIDIA V系列**: V100-16GB/32GB
- **其他**: L20, L40S等

**智能推荐算法**: 基于算力效率和性价比的GPU配置优化建议

## 📈 实际使用示例

### 训练资源预估
```
模型: 7B参数 (LoRA rank=16)
配置: batch_size=4, seq_len=2048, fp16
优化: 梯度检查点 + Flash Attention 2

显存分解:
├── 模型权重: 13.09 GB (包含LoRA参数)
├── 激活值: 10.20 GB (已优化)
├── 优化器状态: 0.11 GB (仅LoRA参数)
├── 梯度: 0.05 GB (仅LoRA参数)  
└── 框架开销: 1.50 GB
────────────────────────────────
总计: 24.96 GB

推荐: 1 × RTX4090 (24GB) 或 H100-80GB
```

### 推理资源预估  
```
模型: 13B参数 (vLLM, FP16)
配置: max_seq_len=4096, batch_size=8

显存分解:
├── 模型权重: 24.6 GB
├── KV Cache: 16.8 GB
└── 后端开销: 3.6 GB
────────────────────
总计: 45.0 GB

推荐: 1 × A100-80GB
预估吞吐量: ~1,200 tokens/sec
```

## 🚀 快速启动

### 一键启动（推荐）
```bash
# 克隆项目
git clone <repository-url>
cd LLM-device

# 一键启动前后端服务
./start.sh

# 停止所有服务  
./stop.sh

# 开发模式（前台运行，实时日志）
./dev.sh
```

### 访问地址
启动后可通过以下地址访问：
- **前端应用**: http://localhost:3000
- **后端API**: http://localhost:8787  
- **API文档**: http://localhost:8787/docs

### 内网访问
系统自动支持内网访问，启动时会显示内网IP。如需自定义配置：

```bash
cd core/front
cp env.example .env.local
# 编辑 .env.local 设置 BACKEND_HOST
```

## 🔧 开发环境

### 环境要求
- **Python**: 3.8+ (推荐使用uv管理依赖)
- **Node.js**: 18+
- **操作系统**: macOS/Linux/Windows

### 分别启动服务
```bash
# 后端开发
cd core/backend  
python run_server.py

# 前端开发
cd core/front
npm run dev
```

## 🌟 最新更新 (v2.3)

- ✅ **显存分解帮助系统**: 悬停查看每个组件的详细计算公式
- ✅ **LoRA参数配置**: 动态rank和alpha选择，精确计算LoRA参数量
- ✅ **用户体验优化**: 智能提示、参数验证、错误处理
- ✅ **GPU数据库**: 基于JSON的硬件数据，支持最新GPU型号
- ✅ **计算精度提升**: 基于实际参数量的精确显存计算
- ✅ **赞赏功能优化**: 仅在预估完成后显示，避免干扰正常使用

## 📚 相关文档

- **开发文档**: `developer.md` - 详细的开发指南和API文档
- **启动指南**: `STARTUP.md` - 详细的启动和配置说明
- **更新日志**: 查看`developer.md`中的更新记录

## ⚠️ 重要说明

本系统仅提供**资源预估功能**，不涉及实际的模型训练或推理。预估结果基于理论计算和经验公式，实际使用中可能因环境差异存在5-15%的误差，建议预留10-20%的资源余量。

## ☕ 赞赏支持

如果这个工具对您的工作有所帮助，欢迎通过赞赏支持开发者继续维护和改进项目！

### 💝 赞赏设计理念
- **用户友好**: 赞赏码仅在用户**获得预估结果后**显示，不干扰正常使用
- **价值导向**: 当用户真正体验到工具价值时才展示赞赏机会
- **界面简洁**: 主页和导航保持简洁，专注核心功能

### 🎯 赞赏展示时机
- ✅ **训练预估完成**: 获得训练资源配置建议后
- ✅ **推理预估完成**: 获得推理性能分析后
- ❌ 主页、导航栏等位置（已优化移除）

### 💖 支持方式
预估完成后，页面底部会显示赞赏码，支持：
- **微信支付**: 扫码赞赏
- **支付宝**: 扫码赞赏
- **金额自选**: 随心赞赏，感谢支持

<div align="center">
  <img src="core/front/public/donate.png" alt="赞赏码" width="300" style="border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
  <p><em>扫描二维码，随心赞赏支持开发者 ☕</em></p>
</div>

感谢每一位用户的支持，您的鼓励是项目持续改进的动力！

---

**项目状态**: 🟢 生产就绪 | **最后更新**: 2024-12-19 | **版本**: v2.3

