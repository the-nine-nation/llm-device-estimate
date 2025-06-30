# LLM资源预估系统 - 开发文档

## 🎯 项目概览
- **项目名称**: 大语言模型训练与推理资源预估系统
- **技术栈**: FastAPI + Next.js + TypeScript
- **状态**: 核心功能完成，生产就绪

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
│   │   ├── common.py             # 通用模型
│   │   ├── training.py           # 训练模型
│   │   └── inference.py          # 推理模型
│   ├── services/calculator/      # 核心计算模块
│   │   ├── base_calc.py          # 基础计算器
│   │   ├── training_calc.py      # 训练计算器
│   │   └── inference_calc.py     # 推理计算器
│   └── utils/                    # 工具函数
│       ├── constants.py          # 常量定义
│       └── helpers.py            # 辅助函数
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
│   │   ├── ui/                   # 基础UI组件
│   │   ├── forms/                # 表单组件
│   │   └── features/             # 功能组件
│   ├── lib/                      # 工具库
│   ├── types/                    # TypeScript类型
│   └── utils/                    # 工具函数
└── package.json
```

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

## ⚡ 快速开始

### 启动服务
```bash
# 一键启动前后端服务
./start.sh

# 停止所有服务
./stop.sh

# 开发模式（前台运行）
./dev.sh
```

### 访问地址
- **前端**: http://localhost:3000
- **后端API**: http://localhost:8787
- **API文档**: http://localhost:8787/docs

## 🚀 核心功能

### ✅ 训练资源预估
- **支持方法**: 全参数微调、LoRA
- **精度类型**: FP32、FP16、BF16  
- **并行策略**: 多卡配置、DeepSpeed ZeRO
- **加速方法**: Flash Attention 2、Unsloth
- **显存计算**: 模型权重、激活值、优化器状态、梯度
- **GPU推荐**: 智能推荐最适合的GPU配置

### ✅ 推理资源预估  
- **推理后端**: vLLM、PyTorch、Transformers、TensorRT-LLM、FastChat、TGI
- **量化方法**: INT8、INT4、GPTQ、AWQ
- **性能预估**: 吞吐量、延迟（P50/P99）
- **KV Cache计算**: 动态序列长度支持
- **并发分析**: 最大并发请求数预估

### ✅ GPU硬件数据库
- **数据源**: `core/gpu-data/gpu.json` 统一配置
- **支持GPU**: H100、A100、RTX4090、RTX3090、V100、L20等
- **规格信息**: 显存容量、内存带宽、FP16算力
- **推荐算法**: 算力效率导向的智能排序

## 📊 API接口

### 训练预估
```http
POST /api/v1/training/estimate
GET /api/v1/training/configs
```

### 推理预估  
```http
POST /api/v1/inference/estimate
GET /api/v1/inference/backends
```

### 系统状态
```http
GET /health
```

## 🛠️ 开发环境

### 环境要求
- **Python**: 3.8+ (推荐使用uv管理)
- **Node.js**: 18+ 
- **操作系统**: macOS/Linux

### 本地开发
```bash
# 后端开发
cd core/backend
python run_server.py

# 前端开发  
cd core/front
npm run dev
```

## 🐛 重要修复记录

### GPU数据源重构 (2024-12-19)
- **改进**: 从硬编码改为JSON文件动态加载
- **优势**: 便于维护和扩展新GPU型号
- **删除**: tensor_cores字段（改为动态判断）

### 推理内存计算修复 (2024-12-19)
- **问题**: max_new_tokens参数不影响显存计算
- **修复**: 正确计算总序列长度 = 输入长度 + 输出长度
- **验证**: KV Cache随输出长度线性增长

### 加速方法支持 (2024-12-19)
- **Flash Attention 2**: 减少30%-60%激活值显存
- **Unsloth**: 减少75%激活值显存（仅支持单卡）
- **智能验证**: 多卡时自动禁用Unsloth

### 参数帮助系统 (2024-12-19)
- **交互式帮助**: 所有参数添加"?"帮助图标
- **悬停提示**: 1秒延迟显示详细说明
- **专业解释**: 通俗易懂的参数说明

## 📝 更新日志

### 2024-12-19 更新
- ✅ GPU数据源从硬编码改为JSON文件动态加载
- ✅ 移除价格信息，添加FP16半精度算力显示
- ✅ 推理内存计算Bug修复（正确处理max_new_tokens）
- ✅ 加速方法支持（Flash Attention 2、Unsloth）
- ✅ 参数帮助提示系统（交互式帮助图标）
- ✅ 用户体验优化（简化配置、智能提示）
- ✅ 移除混合精度选项（实测无明显作用，简化用户配置）
- ✅ 添加LoRA rank选择功能（影响训练显存需求）

### 2024-12-19 (第二次更新)
- ✅ 新增LoRA参数配置界面（rank、alpha可选）
- ✅ 优化LoRA显存计算（基于实际rank值精确计算）
- ✅ 动态显示LoRA配置（仅在选择LoRA时显示）
- ✅ 完善参数帮助说明（rank和alpha的详细说明）

### 2024-12-19 (第三次更新)
- ✅ 添加显存分解计算公式帮助说明
- ✅ 为每个显存组件添加详细的计算公式和说明
- ✅ 优化tooltip显示效果（支持多行格式化文本）
- ✅ 增强用户体验（悬停1秒显示详细计算逻辑）

### 2024-12-19 (第四次更新)
- ✅ 添加赞赏码功能，支持用户赞赏开发者
- ✅ 创建美观的赞赏码组件（支持完整和紧凑两种模式）
- ✅ 在结果展示页面添加赞赏码（用户获得价值后更容易赞赏）
- ✅ 在主页底部添加紧凑赞赏按钮
- ✅ 在导航栏添加赞赏按钮（大屏幕显示）

## 🎓 显存分解详细说明

新增的显存分解帮助功能包含以下组件的详细计算公式：

### 模型权重 (Model Weights)
- **全参数微调**: 参数量 × 精度字节数
- **LoRA微调**: (原模型参数 + LoRA参数) × 精度字节数
- **LoRA参数计算**: rank × (input_dim + output_dim) × 适配层数

### 激活值 (Activations)
- **基础激活值**: batch_size × seq_len × hidden_size × num_layers × bytes_per_element
- **注意力激活值**: batch_size × num_heads × seq_len² × num_layers × bytes_per_element
- **优化技术影响**: 梯度检查点(-70%)、Flash Attention 2(-30~60%)、Unsloth(-75%)

### 优化器状态 (Optimizer States)
- **计算公式**: 可训练参数量 × 精度字节数 × 优化器倍数
- **优化器倍数**: AdamW/Adam(2倍)、SGD(1倍)
- **DeepSpeed ZeRO**: 支持多GPU分片减少单卡占用

### 梯度 (Gradients)
- **计算公式**: 可训练参数量 × 精度字节数
- **训练方法影响**: 全参数(所有参数)、LoRA(仅LoRA参数)
- **分片支持**: DeepSpeed ZeRO Stage 2/3

### 框架开销 (Framework Overhead)
- **固定开销**: PyTorch(1.5GB)、DeepSpeed(2.0GB)、Transformers(1.2GB)
- **包含内容**: 运行时内存、临时缓冲区、通信库内存

## 💝 赞赏支持功能

### 功能描述
- **赞赏码组件**: 支持微信和支付宝扫码赞赏
- **多种展示模式**: 完整模式（结果页面）和紧凑模式（主页、导航栏）
- **用户友好**: 弹窗展示，不干扰正常使用
- **合适位置**: 用户获得价值后展示，提高转化率

### 技术实现
- **组件位置**: `core/front/src/components/ui/donate.tsx`
- **静态资源**: `core/front/public/donate.png`（赞赏码图片）
- **展示位置**: 训练/推理结果页面、主页底部、导航栏
- **响应式设计**: 大屏显示导航栏按钮，小屏隐藏避免拥挤

**项目状态**: 生产就绪  
**最后更新**: 2024-12-19  
**文档版本**: v2.3
