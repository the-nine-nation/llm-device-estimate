#!/bin/bash

# 大语言模型训练与推理资源预估系统 - 开发模式启动脚本
# LLM Resource Estimation System - Development Mode Script

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}  LLM 资源预估系统开发模式${NC}"
    echo -e "${PURPLE}================================${NC}"
    echo ""
}

# 检查依赖
check_dependencies() {
    print_status "检查系统依赖..."
    
    if ! command -v uv &> /dev/null; then
        print_error "uv 未安装，请先安装 uv"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js 未安装，请先安装 Node.js"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm 未安装，请先安装 npm"
        exit 1
    fi
    
    print_success "系统依赖检查完成"
}

# 清理端口
cleanup_ports() {
    print_status "清理端口占用..."
    
    # 清理8787端口
    if lsof -i :8787 >/dev/null 2>&1; then
        print_warning "清理端口 8787..."
        lsof -ti :8787 | xargs kill -9 2>/dev/null || true
    fi
    
    # 清理8786端口
    if lsof -i :8786 >/dev/null 2>&1; then
        print_warning "清理端口 8786..."
        lsof -ti :8786 | xargs kill -9 2>/dev/null || true
    fi
    
    sleep 2
    print_success "端口清理完成"
}

# 启动后端（前台）
start_backend() {
    print_status "启动后端服务（开发模式）..."
    cd core/backend
    
    # 检查虚拟环境
    if [ ! -f ".venv/pyvenv.cfg" ]; then
        print_status "初始化 Python 虚拟环境..."
        uv sync
    fi
    
    print_success "后端将在前台运行，日志直接显示"
    print_success "后端地址: http://localhost:8787"
    print_success "API文档: http://localhost:8787/docs"
    echo ""
    
    # 前台运行后端
    exec uv run python run_server.py
}

# 启动前端（前台）
start_frontend() {
    print_status "启动前端服务（开发模式）..."
    cd core/front
    
    # 检查依赖
    if [ ! -d "node_modules" ]; then
        print_status "安装前端依赖..."
        npm install
    fi
    
    print_success "前端将在前台运行，支持热重载"
    print_success "前端地址: http://localhost:8786"
    echo ""
    
    # 前台运行前端
    exec npm run dev
}

# 并行启动模式
start_parallel() {
    print_status "并行启动前后端服务..."
    
    # 创建日志目录
    mkdir -p logs
    
    # 启动后端
    print_status "启动后端服务..."
    cd core/backend
    if [ ! -f ".venv/pyvenv.cfg" ]; then
        uv sync
    fi
    uv run python run_server.py > ../logs/backend-dev.log 2>&1 &
    BACKEND_PID=$!
    cd ../../
    
    # 启动前端
    print_status "启动前端服务..."
    cd core/front
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    npm run dev > ../logs/frontend-dev.log 2>&1 &
    FRONTEND_PID=$!
    cd ../../
    
    # 等待服务启动
    print_status "等待服务启动..."
    sleep 5
    
    # 显示状态
    echo ""
    print_success "🎉 开发环境启动完成！"
    echo ""
    echo -e "${CYAN}📱 前端界面:${NC} http://localhost:8786"
    echo -e "${CYAN}🚀 后端API:${NC}  http://localhost:8787"
    echo -e "${CYAN}📚 API文档:${NC}  http://localhost:8787/docs"
    echo ""
    echo -e "${YELLOW}📋 实时日志:${NC}"
    echo -e "   npm run logs:backend  # 后端日志"
    echo -e "   npm run logs:frontend # 前端日志"
    echo -e "   npm run logs          # 所有日志"
    echo ""
    echo -e "${RED}🛑 停止服务:${NC} Ctrl+C 或 npm run stop"
    echo ""
    
    # 捕获退出信号
    trap 'print_warning "正在停止服务..." && kill $BACKEND_PID $FRONTEND_PID 2>/dev/null && exit 0' INT TERM
    
    # 等待进程
    wait
}

# 主函数
main() {
    print_header
    
    # 检查参数
    case "${1:-parallel}" in
        "backend"|"b")
            print_status "启动模式: 仅后端"
            check_dependencies
            cleanup_ports
            start_backend
            ;;
        "frontend"|"f")
            print_status "启动模式: 仅前端"
            check_dependencies
            cleanup_ports
            start_frontend
            ;;
        "parallel"|"p"|"")
            print_status "启动模式: 并行启动"
            check_dependencies
            cleanup_ports
            start_parallel
            ;;
        *)
            echo "用法: $0 [backend|frontend|parallel]"
            echo ""
            echo "选项:"
            echo "  backend   - 仅启动后端 (前台)"
            echo "  frontend  - 仅启动前端 (前台)"  
            echo "  parallel  - 并行启动 (后台)"
            echo "  (默认)    - 并行启动"
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@" 