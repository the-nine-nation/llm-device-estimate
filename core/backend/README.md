# LLM Resource Estimation API - 后端

大语言模型训练与推理资源预估系统的后端API服务。

## 🚀 快速开始

### 环境要求

- Python 3.12+
- uv (Python包管理器)

### 安装依赖

```bash
# 使用uv安装依赖（推荐）
uv sync

# 或者使用pip安装
pip install -r requirements.txt
```

### 运行测试

```bash
# 运行基础功能测试
python test_basic.py
```

### 启动服务器

```bash
# 启动开发服务器
python run_server.py

# 或者直接使用uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 访问API文档

启动服务器后，访问以下地址：

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc  
- **健康检查**: http://localhost:8000/health

## 📡 API端点

### 训练预估

- `POST /api/v1/training/estimate` - 预估训练资源需求
- `GET /api/v1/training/configs` - 获取训练配置选项

### 推理预估

- `POST /api/v1/inference/estimate` - 预估推理资源需求
- `GET /api/v1/inference/backends` - 获取推理后端列表

### 模型管理

- `GET /api/v1/models/` - 获取支持的模型列表
- `GET /api/v1/models/{model_id}` - 获取特定模型信息
- `GET /api/v1/models/categories/` - 获取模型分类信息

## 🏗️ 项目结构

```
core/backend/
├── app/
│   ├── main.py              # FastAPI应用入口
│   ├── config.py           # 配置管理
│   ├── api/                # API路由层
│   │   ├── v1/
│   │   │   ├── api.py      # API路由汇总
│   │   │   └── endpoints/  # 具体端点实现
│   │   └── deps.py         # 依赖注入
│   ├── models/             # 数据模型层
│   │   ├── common.py       # 通用模型
│   │   ├── training.py     # 训练相关模型
│   │   └── inference.py    # 推理相关模型
│   ├── services/           # 业务逻辑层
│   │   ├── calculator/     # 核心计算模块
│   │   └── model_registry.py # 模型注册服务
│   └── utils/              # 工具函数
├── test_basic.py           # 基础功能测试
├── run_server.py           # 服务器启动脚本
├── requirements.txt        # 依赖列表
└── README.md
```

## 🧮 核心功能

### 支持的模型

- **LLaMA系列**: LLaMA 7B/13B/70B, LLaMA 2 7B/13B/70B
- **Qwen系列**: Qwen 7B/14B/72B, Qwen2 7B/72B
- **Mistral系列**: Mistral 7B, Mixtral 8x7B
- **其他**: ChatGLM 6B, Baichuan 7B
- **自定义模型**: 支持用户自定义模型参数

### 训练方法

- 全参数微调 (Full Fine-tuning)
- LoRA (Low-Rank Adaptation)
- QLoRA (Quantized LoRA)
- AdaLoRA (Adaptive LoRA)
- DoRA (Weight-Decomposed Low-Rank Adaptation)

### 推理后端

- vLLM
- PyTorch
- Transformers
- TensorRT-LLM
- FastChat  
- Text Generation Inference (TGI)

### 量化方法

- 无量化 (FP32/FP16/BF16)
- INT8量化
- INT4量化
- GPTQ
- AWQ

## 🔧 开发

### 代码格式化

```bash
# 格式化代码
black app/
isort app/

# 类型检查
mypy app/
```

### 运行测试

```bash
# 运行所有测试
pytest

# 运行特定测试
pytest tests/test_calculator.py
```

## 📈 特性

- ✅ 精确的显存占用计算
- ✅ 多种训练方法支持
- ✅ 推理性能预估
- ✅ GPU推荐算法
- ✅ 并行策略优化建议
- ✅ 实时配置验证
- ✅ 详细的错误信息
- ✅ 完整的API文档

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！ 