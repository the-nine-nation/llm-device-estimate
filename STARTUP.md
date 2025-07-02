# 🚀 启动脚本使用指南

本项目提供了多种启动方式，方便开发和部署使用。

## 📋 快速启动

### 方式1: 使用启动脚本（推荐）

```bash
# 一键启动所有服务（后台运行）
./start.sh

# 停止所有服务
./stop.sh

# 重启所有服务
./stop.sh && ./start.sh
```

### 方式2: 使用npm脚本

```bash
# 一键启动所有服务
npm start

# 停止所有服务
npm run stop

# 重启所有服务
npm run restart

# 清理日志并停止
npm run clean
```

### 方式3: 开发模式

```bash
# 开发模式（支持热重载，并行启动）
./dev.sh

# 仅启动后端（前台运行，查看实时日志）
./dev.sh backend

# 仅启动前端（前台运行，支持热重载）
./dev.sh frontend
```

## 🛠️ 手动启动

如果需要手动控制，可以分别启动：

```bash
# 后端服务
npm run backend
# 或
cd core/backend && uv run python run_server.py

# 前端服务（新终端窗口）
npm run frontend
# 或
cd core/front && npm run dev
```

## 📊 服务状态

### 检查服务状态
```bash
npm run status
```

### 查看实时日志
```bash
# 查看所有日志
npm run logs

# 查看后端日志
npm run logs:backend

# 查看前端日志
npm run logs:frontend
```

## 🔧 初始化设置

第一次使用时，运行初始化脚本：

```bash
# 设置权限并安装所有依赖
npm run setup
```

## 📱 访问地址

启动成功后，可以通过以下地址访问：

- **前端界面**: http://localhost:8786
- **后端API**: http://localhost:8787
- **API文档**: http://localhost:8787/docs
- **健康检查**: http://localhost:8787/health

## 🚀 启动流程说明

### 启动脚本功能
1. **依赖检查**: 检查uv、Node.js、npm是否安装
2. **端口清理**: 自动清理被占用的端口
3. **依赖安装**: 自动检查并安装缺失的依赖
4. **服务启动**: 按顺序启动后端和前端服务
5. **健康检查**: 验证服务是否正常启动
6. **状态显示**: 显示服务地址和操作提示

### 日志管理
- 后端日志: `logs/backend.log`
- 前端日志: `logs/frontend.log`
- 进程ID: `logs/backend.pid`, `logs/frontend.pid`

## 🔍 故障排除

### 端口被占用
```bash
# 手动清理端口
lsof -ti :8787 | xargs kill -9  # 后端端口
lsof -ti :8786 | xargs kill -9  # 前端端口
```

### 依赖问题
```bash
# 重新安装所有依赖
npm run install:all

# 或分别安装
npm run backend:install
npm run frontend:install
```

### 权限问题
```bash
# 重新设置脚本权限
chmod +x start.sh stop.sh dev.sh
```

### 查看详细错误
```bash
# 查看后端错误日志
tail -f logs/backend.log

# 查看前端错误日志  
tail -f logs/frontend.log
```

## 🎯 使用建议

### 开发环境
- 使用 `./dev.sh` 进行开发，支持热重载
- 使用 `./dev.sh backend` 或 `./dev.sh frontend` 单独调试

### 生产环境
- 使用 `./start.sh` 后台启动服务
- 定期检查 `npm run status` 服务状态
- 使用 `npm run logs` 监控服务日志

### 快速重启
```bash
npm run restart
```

### 完全清理
```bash
# 停止服务并清理日志
./stop.sh --clean
```

## 📚 更多脚本命令

```bash
npm run test          # 运行测试
npm run lint          # 代码检查
npm run build         # 构建前端
npm run setup         # 初始化设置
```

---

💡 **提示**: 首次使用建议先运行 `npm run setup` 进行初始化设置！ 