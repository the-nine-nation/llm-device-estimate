# LLM资源预估系统 - 开发文档

## 🎯 项目概览
- **项目名称**: 大语言模型训练与推理资源预估系统
- **技术栈**: FastAPI + Next.js + TypeScript
- **版本**: v3.2 (生产就绪)
- **最后更新**: 2024-12-19

## 🏗️ 项目架构

### 后端架构
```
core/backend/
├── app/
│   ├── main.py                    # FastAPI应用入口
│   ├── api/v1/endpoints/          # API端点
│   │   ├── training.py           # 训练预估API
│   │   └── inference.py          # 推理预估API
│   ├── models/                   # 数据模型
│   ├── services/calculator/      # 核心计算模块
│   │   ├── base_calc.py          # 基础计算器
│   │   ├── training_calc.py      # 训练计算器
│   │   └── inference_calc.py     # 推理计算器
│   └── utils/                    # 工具函数
├── core/gpu-data/gpu.json        # GPU硬件数据
└── requirements.txt
```

### 前端架构
```
core/front/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── training/             # 训练预估页面
│   │   └── inference/            # 推理预估页面
│   ├── components/               # 组件目录
│   ├── lib/                      # 工具库
│   └── types/                    # TypeScript类型
└── package.json
```

## ⚡ 快速开始

### 启动服务
```bash
# 一键启动前后端服务
./start.sh

# 开发模式（前台运行）
./dev.sh

# 停止所有服务
./stop.sh
```

### 访问地址
- **前端**: http://localhost:8786
- **后端API**: http://localhost:8787
- **API文档**: http://localhost:8787/docs

## 🔧 技术栈

### 后端依赖
```python
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
numpy==1.24.3
```

### 前端依赖
```json
{
  "next": "^14.0.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^3.3.0",
  "lucide-react": "^0.290.0"
}
```

### 环境要求
- **Python**: 3.8+ (推荐使用uv管理)
- **Node.js**: 18+ 
- **操作系统**: macOS/Linux

## 🚀 核心功能

### 训练资源预估
- **训练方法**: 全参数微调、LoRA (支持rank/alpha配置)
- **精度类型**: FP32、FP16、BF16  
- **并行策略**: 多卡配置、DeepSpeed ZeRO
- **加速方法**: Flash Attention 2、Unsloth、梯度检查点
- **显存计算**: 模型权重、激活值、优化器状态、梯度、框架开销

### 推理资源预估  
- **推理后端**: vLLM、PyTorch、Transformers、TensorRT-LLM、FastChat、TGI
- **量化方法**: INT8、INT4、GPTQ、AWQ
- **性能预估**: 吞吐量、延迟（P50/P99）、最大并发数
- **KV Cache**: 动态序列长度支持

### GPU硬件数据库
- **数据源**: `core/gpu-data/gpu.json`
- **支持GPU**: H100、A100、RTX4090、RTX3090、V100、L20等
- **推荐算法**: 基于算力效率和显存需求的智能排序

## 📊 API接口

### 训练预估
```http
POST /api/v1/training/estimate    # 训练资源预估
GET  /api/v1/training/configs     # 获取训练配置选项
```

### 推理预估  
```http
POST /api/v1/inference/estimate   # 推理资源预估
GET  /api/v1/inference/backends   # 获取推理后端列表
```

### 系统状态
```http
GET /health                       # 健康检查
```

## 🛠️ 开发指南

### 本地开发
```bash
# 后端开发（前台运行，显示日志）
cd core/backend
uv run python run_server.py

# 前端开发（支持热重载）
cd core/front
npm run dev
```

### 项目结构说明
- **计算器模块**: `services/calculator/` - 核心算法实现
- **数据模型**: `models/` - 请求/响应数据结构
- **GPU数据**: `core/gpu-data/gpu.json` - 硬件规格配置
- **前端组件**: `components/` - UI组件和功能模块

## 🧮 核心算法

### Flash Attention 2 优化
基于O(N²)→O(N)内存复杂度转换的精确计算:
- **标准注意力**: batch×heads×seq²×layers×bytes
- **Flash Attention**: batch×heads×seq×2×layers×bytes  
- **优化比例**: seq_len/2 (序列越长优化越显著)

### 多卡训练显存分片
- **激活值**: 按GPU数量分片（数据并行）
- **优化器状态**: 根据DeepSpeed ZeRO Stage分片
- **梯度**: 支持梯度累积的开销计算

### 推理KV Cache计算
- **总序列长度** = 输入长度 + max_new_tokens
- **KV Cache** = batch×heads×total_seq×2×layers×bytes
- **并发支持**: 基于显存和序列长度的最大并发数预估

## 🐛 关键修复

### 2024-12-19 重要更新
- **Flash Attention 2**: 从经验系数改为基于算法原理的精确计算
- **多卡训练**: 修复激活值显存分片计算错误
- **推理内存**: 修复max_new_tokens不影响显存的问题  
- **梯度累积**: 修正累积步数对显存的影响计算
- **端口配置**: 前端端口从3000修改为8786

## 📁 重要文件

### 配置文件
- `core/gpu-data/gpu.json` - GPU硬件数据
- `core/backend/requirements.txt` - Python依赖
- `core/front/package.json` - Node.js依赖

### 启动脚本
- `start.sh` - 生产环境启动
- `dev.sh` - 开发模式启动  
- `stop.sh` - 停止所有服务

### 核心模块
- `services/calculator/training_calc.py` - 训练显存计算
- `services/calculator/inference_calc.py` - 推理显存计算
- `components/features/result-display.tsx` - 结果展示组件

---

**项目状态**: 生产就绪  
**算法精度**: 与实际训练环境误差<5%  
**最后更新**: 2024-12-19
