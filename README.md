# 大语言模型训练与推理资源预估系统

> 🚀 专业的大语言模型资源预估工具，精准计算训练与推理所需的硬件资源

## 📋 项目概述

该系统是一个专门用于预估大语言模型（LLM）训练和推理阶段资源消耗的Web应用程序。通过精确的算法计算，帮助用户在部署模型前准确评估所需的硬件资源，特别是GPU显存需求，避免资源配置不当导致的部署失败或资源浪费。

**⚠️ 重要说明：本系统仅提供资源预估功能，不涉及实际的模型训练或推理过程。**

## ✨ 核心功能

### 🎯 训练资源预估
- **模型参数配置**
  - 支持主流模型参数规模（1B - 1000B+）
  - 自定义模型架构参数（层数、隐藏层维度、注意力头数等）
  - 词汇表大小配置

- **训练方式选择**
  - 全参数微调（Full Fine-tuning）
  - LoRA（Low-Rank Adaptation）
  - QLoRA（Quantized LoRA）
  - AdaLoRA（Adaptive LoRA）
  - DoRA（Weight-Decomposed LoRA）

- **训练阶段配置**
  - 预训练（Pre-training）
  - 监督微调（SFT - Supervised Fine-tuning）
  - 人类反馈强化学习（RLHF）
  - 直接偏好优化（DPO及其变体：ORPO、CPO、KTO等）

- **训练参数设置**
  - Batch Size（单卡及全局）
  - 序列长度（Max Tokens）
  - 梯度累积步数
  - 混合精度训练配置（fp16/bf16/fp32）
  - DeepSpeed ZeRO阶段选择

### 🔍 推理资源预估
- **推理后端支持**
  - vLLM（高性能推理引擎）
  - PyTorch原生推理
  - Transformers库推理
  - TensorRT-LLM
  - FastChat
  - Text Generation Inference (TGI)

- **推理配置选项**
  - 批处理大小（Batch Size）
  - 最大序列长度
  - KV Cache配置
  - 量化方案（INT8/INT4/GPTQ/AWQ等）
  - 多GPU并行策略

### 📊 详细资源分析
- **显存消耗细分**
  - 模型权重占用
  - 激活值内存
  - 优化器状态（仅训练）
  - 梯度缓存（仅训练）
  - KV Cache（仅推理）
  - 框架开销

- **性能预估**
  - 理论计算量（FLOPs）
  - 内存带宽需求
  - 推荐的GPU型号和数量
  - 预估的训练时间/推理吞吐量

## 🏗️ 技术架构

### 后端技术栈
- **框架**: FastAPI
- **语言**: Python 3.8+
- **核心库**: 
  - NumPy（数值计算）
  - Pandas（数据处理）
  - Pydantic（数据验证）
  - Uvicorn（ASGI服务器）

### 前端技术栈
- **框架**: Next.js 14+
- **语言**: TypeScript
- **UI组件**: 
  - React
  - Tailwind CSS
  - shadcn/ui
- **状态管理**: Zustand
- **图表可视化**: Chart.js / ECharts

### 项目结构
```
大模型训练推理估算小程序/
├── core/
│   ├── backend/           # FastAPI后端服务
│   │   ├── app/
│   │   │   ├── api/       # API路由
│   │   │   │   ├── models/    # 数据模型
│   │   │   │   ├── services/  # 业务逻辑
│   │   │   │   └── utils/     # 工具函数
│   │   │   └── requirements.txt
│   │   └── main.py
│   └── front/             # Next.js前端应用
│       ├── src/
│       │   ├── components/ # React组件
│       │   │   ├── pages/     # 页面文件
│       │   │   ├── hooks/     # 自定义Hook
│       │   │   └── utils/     # 工具函数
│       │   ├── package.json
│       │   └── next.config.js
│   ├── docs/                  # 文档目录
│   ├── tests/                 # 测试文件
│   └── README.md
└── developer.md
```

## 🎯 使用场景

- **AI研究团队**: 在开始训练前评估硬件需求，合理分配资源
- **企业AI部门**: 为模型部署制定硬件采购计划
- **云服务提供商**: 为客户提供准确的资源配置建议
- **个人开发者**: 在有限的硬件条件下选择合适的模型规模和配置

## 🔧 支持的模型类型

- **Transformer架构**: GPT系列、LLaMA、Qwen、ChatGLM、Baichuan等
- **参数规模**: 0.1B - 1000B+
- **精度支持**: FP32、FP16、BF16、INT8、INT4
- **并行策略**: 数据并行、模型并行、流水线并行

## 📈 输出结果示例

### 训练资源预估结果
```
模型: LLaMA-7B (全参数微调)
序列长度: 2048
批处理大小: 4 (per device)

显存消耗详情:
├── 模型权重: 13.5 GB
├── 优化器状态: 27.0 GB (AdamW)
├── 梯度缓存: 13.5 GB
├── 激活值: 8.2 GB
└── 框架开销: 2.8 GB
────────────────────
总计: 65.0 GB

推荐配置: 4 × A100 (80GB) 或 8 × RTX 4090 (24GB)
```

### 推理资源预估结果
```
模型: LLaMA-13B (vLLM后端)
最大序列长度: 4096
批处理大小: 32

显存消耗详情:
├── 模型权重: 24.6 GB (FP16)
├── KV Cache: 16.8 GB
└── 框架开销: 3.6 GB
────────────────────
总计: 45.0 GB

推荐配置: 1 × A100 (80GB) 或 2 × RTX 4090 (24GB)
预估吞吐量: ~35 tokens/sec
```

## 🚀 快速启动

### 一键启动（推荐）
```bash
# 克隆项目
git clone <repository-url>
cd LLM-device

# 一键启动所有服务
./start.sh

# 停止所有服务
./stop.sh
```

### 内网访问配置

系统默认支持内网访问，启动后会自动显示内网IP地址。

#### 自动配置（推荐）
使用 `./start.sh` 启动后，系统会自动检测并显示内网访问地址：
- 本机访问: http://localhost:3000
- 内网访问: http://YOUR_IP:3000

#### 手动配置
如需手动指定后端地址，可以：

1. **复制环境变量文件**：
```bash
cd core/front
cp env.example .env.local
```

2. **编辑配置文件**：
```bash
# .env.local
BACKEND_HOST=192.168.1.100  # 替换为实际的内网IP
BACKEND_PORT=8787
```

3. **重启前端服务**：
```bash
cd core/front
npm run dev
```

#### 防火墙配置
确保防火墙允许以下端口：
- **3000**: 前端服务
- **8787**: 后端API服务

**macOS**:
```bash
# 允许端口访问（如果需要）
sudo pfctl -f /etc/pf.conf
```

**Linux (Ubuntu)**:
```bash
sudo ufw allow 3000
sudo ufw allow 8787
```

**Windows**:
在Windows防火墙中添加入站规则，允许端口3000和8787。

### 开发模式启动

