# LLM资源预估系统 - 前端

## 项目概述

这是大语言模型训练与推理资源预估系统的前端部分，基于 Next.js 14 + TypeScript + Tailwind CSS 开发。

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS + CSS Variables
- **UI组件**: Radix UI + shadcn/ui
- **状态管理**: Zustand
- **图标**: Lucide React
- **HTTP客户端**: Axios
- **表单处理**: React Hook Form + Zod
- **图表**: Chart.js + React Chart.js 2

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首页
│   ├── providers.tsx      # 状态提供者
│   ├── globals.css        # 全局样式
│   ├── training/          # 训练预估页面
│   │   └── page.tsx
│   └── inference/         # 推理预估页面
│       └── page.tsx
├── components/            # 组件目录
│   ├── ui/               # 基础UI组件
│   │   ├── button.tsx
│   │   └── card.tsx
│   ├── layout/           # 布局组件
│   │   └── navigation.tsx
│   ├── theme-provider.tsx
│   └── ...
├── lib/                  # 工具库
│   ├── utils.ts          # 通用工具函数
│   └── api.ts            # API客户端
├── store/                # 状态管理
│   └── training.ts       # 训练状态管理
├── types/                # TypeScript类型
│   └── api.ts            # API类型定义
└── hooks/                # 自定义Hooks
```

## 主要功能

### 已实现功能

1. **项目架构搭建**
   - ✅ Next.js 14 项目配置
   - ✅ TypeScript 严格模式配置
   - ✅ Tailwind CSS 配置与主题系统
   - ✅ 路径别名配置 (@/*)

2. **基础组件系统**
   - ✅ 按钮组件 (Button)
   - ✅ 卡片组件 (Card)
   - ✅ 主题提供者 (ThemeProvider)
   - ✅ 导航组件 (Navigation)

3. **页面结构**
   - ✅ 首页 - 功能介绍和快速入口
   - ✅ 训练预估页面 - 训练资源计算界面
   - ✅ 推理预估页面 - 推理性能预估界面
   - ✅ 响应式布局设计

4. **状态管理**
   - ✅ Zustand 状态管理配置
   - ✅ 训练配置状态管理
   - ✅ 状态持久化配置

5. **API集成**
   - ✅ Axios HTTP客户端配置
   - ✅ 统一的API错误处理
   - ✅ 类型安全的API接口定义
   - ✅ 训练/推理/模型管理API封装

6. **类型系统**
   - ✅ 完整的API类型定义
   - ✅ 与后端模型完全对应的TypeScript接口
   - ✅ 枚举类型定义

7. **工具函数**
   - ✅ 样式合并工具 (cn)
   - ✅ 格式化工具 (内存大小、参数数量)
   - ✅ 防抖函数

### 设计特色

1. **现代化UI设计**
   - 使用 CSS Variables 实现深色/浅色主题
   - 基于 Radix UI 的无障碍组件
   - 响应式设计，适配移动端

2. **类型安全**
   - 严格的 TypeScript 配置
   - 与后端API完全对应的类型定义
   - 编译时类型检查

3. **开发体验**
   - 路径别名支持
   - ESLint 规则配置
   - 自动格式化配置

## 安装和运行

### 前提条件

- Node.js 18+
- npm/yarn/pnpm

### 安装依赖

```bash
cd core/front
npm install
```

### 开发模式

```bash
npm run dev
```

应用将在 http://localhost:3000 启动

### 构建生产版本

```bash
npm run build
npm start
```

## API集成

前端通过以下API与后端通信：

- `/api/v1/training/estimate` - 训练资源预估
- `/api/v1/inference/estimate` - 推理资源预估
- `/api/v1/models` - 模型管理
- `/api/v1/hardware/gpus` - GPU信息

所有API调用都有完整的TypeScript类型支持和错误处理。

## 主要页面

### 首页 (/)
- 功能介绍和亮点展示
- 支持的模型列表
- 快速入口链接

### 训练预估 (/training)
- 模型选择和自定义配置
- 训练方法配置 (全参数微调/LoRA/QLoRA等)
- 并行策略设置
- 实时资源计算结果

### 推理预估 (/inference)
- 推理后端选择 (vLLM/TensorRT-LLM等)
- 量化方法配置
- 性能参数设置
- 扩展性分析结果

## 下一步开发计划

1. **交互功能**
   - 表单验证和实时反馈
   - API调用和错误处理
   - 加载状态和进度显示

2. **结果展示**
   - 资源占用图表
   - GPU推荐列表
   - 配置导出功能

3. **用户体验优化**
   - 表单自动保存
   - 历史记录管理
   - 一键配置模板

4. **测试覆盖**
   - 组件单元测试
   - 端到端测试
   - API集成测试

## 开发规范

- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 组件采用函数式风格
- 使用 CSS-in-JS 的 Tailwind 方案
- API调用统一错误处理

## 贡献指南

1. 创建功能分支
2. 遵循代码规范
3. 添加必要的类型定义
4. 测试功能完整性
5. 提交 Pull Request

---

当前版本: v0.1.0 (开发中)
最后更新: 2024-12-19 