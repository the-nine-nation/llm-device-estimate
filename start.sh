#!/bin/bash

# 大语言模型训练与推理资源预估系统 - 启动脚本
# LLM Resource Estimation System - Startup Script

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 打印带颜色的消息
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
    echo -e "${PURPLE}  LLM 资源预估系统启动脚本${NC}"
    echo -e "${PURPLE}================================${NC}"
    echo ""
}

# 检查依赖
check_dependencies() {
    print_status "检查系统依赖..."
    
    # 检查 uv
    if ! command -v uv &> /dev/null; then
        print_error "uv 未安装，请先安装 uv"
        print_status "安装命令: curl -LsSf https://astral.sh/uv/install.sh | sh"
        exit 1
    fi
    
    # 检查 node
    if ! command -v node &> /dev/null; then
        print_error "Node.js 未安装，请先安装 Node.js"
        exit 1
    fi
    
    # 检查 npm
    if ! command -v npm &> /dev/null; then
        print_error "npm 未安装，请先安装 npm"
        exit 1
    fi
    
    print_success "系统依赖检查完成"
}

# 检查端口占用
check_ports() {
    print_status "检查端口占用情况..."
    
    # 检查后端端口 8787
    if lsof -i :8787 >/dev/null 2>&1; then
        print_warning "端口 8787 已被占用，将尝试终止占用进程"
        lsof -ti :8787 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
    
    # 检查前端端口 3000
    if lsof -i :3000 >/dev/null 2>&1; then
        print_warning "端口 3000 已被占用，将尝试终止占用进程"
        lsof -ti :3000 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
    
    print_success "端口检查完成"
}

# 安装依赖
install_dependencies() {
    print_status "检查并安装项目依赖..."
    
    # 后端依赖
    print_status "检查后端依赖 (uv)..."
    cd core/backend
    if [ ! -f ".venv/pyvenv.cfg" ]; then
        print_status "初始化 Python 虚拟环境..."
        uv sync
    fi
    cd ../../
    
    # 前端依赖
    print_status "检查前端依赖 (npm)..."
    cd core/front
    if [ ! -d "node_modules" ]; then
        print_status "安装前端依赖..."
        npm install
    fi
    cd ../../
    
    print_success "依赖检查完成"
}

# 启动后端服务
start_backend() {
    print_status "启动后端服务..."
    cd core/backend
    
    # 后台启动后端
    nohup uv run python run_server.py > ../../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../../logs/backend.pid
    
    cd ../../
    
    # 等待后端启动
    print_status "等待后端服务启动..."
    for i in {1..30}; do
        if curl -s http://localhost:8787/health >/dev/null 2>&1; then
            print_success "后端服务启动成功 (PID: $BACKEND_PID)"
            print_success "后端地址: http://localhost:8787"
            print_success "API文档: http://localhost:8787/docs"
            return 0
        fi
        sleep 2
        echo -n "."
    done
    
    print_error "后端服务启动失败，请检查日志: logs/backend.log"
    exit 1
}

# 启动前端服务
start_frontend() {
    print_status "启动前端服务..."
    cd core/front
    
    # 后台启动前端
    nohup npm run dev > ../../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../../logs/frontend.pid
    
    cd ../../
    
    # 等待前端启动
    print_status "等待前端服务启动..."
    for i in {1..30}; do
        if curl -s http://localhost:3000 >/dev/null 2>&1; then
            print_success "前端服务启动成功 (PID: $FRONTEND_PID)"
            print_success "前端地址: http://localhost:3000"
            return 0
        fi
        sleep 2
        echo -n "."
    done
    
    print_error "前端服务启动失败，请检查日志: logs/frontend.log"
    exit 1
}

# 创建日志目录
create_log_dir() {
    if [ ! -d "logs" ]; then
        mkdir -p logs
        print_status "创建日志目录: logs/"
    fi
}

# 获取内网IP地址
get_local_ip() {
    # 尝试多种方法获取内网IP
    local ip=""
    
    # 方法1: 使用 ifconfig (macOS/Linux)
    if command -v ifconfig &> /dev/null; then
        ip=$(ifconfig | grep -E "inet.*broadcast" | grep -v "127.0.0.1" | awk '{print $2}' | head -1)
    fi
    
    # 方法2: 使用 ip 命令 (Linux)
    if [ -z "$ip" ] && command -v ip &> /dev/null; then
        ip=$(ip route get 1.1.1.1 | grep -oP 'src \K\S+' 2>/dev/null)
    fi
    
    # 方法3: 使用 hostname (macOS)
    if [ -z "$ip" ] && command -v hostname &> /dev/null; then
        ip=$(hostname -I 2>/dev/null | awk '{print $1}')
    fi
    
    # 方法4: 备用方法
    if [ -z "$ip" ]; then
        ip=$(python3 -c "import socket; s=socket.socket(socket.AF_INET, socket.SOCK_DGRAM); s.connect(('8.8.8.8', 80)); print(s.getsockname()[0]); s.close()" 2>/dev/null)
    fi
    
    echo "$ip"
}

# 显示启动信息
show_startup_info() {
    local_ip=$(get_local_ip)
    
    echo ""
    print_success "🎉 系统启动完成！"
    echo ""
    echo -e "${CYAN}📱 本机访问:${NC}"
    echo -e "   前端界面: http://localhost:3000"
    echo -e "   后端API:  http://localhost:8787"
    echo ""
    if [ -n "$local_ip" ]; then
        echo -e "${GREEN}🌐 内网访问:${NC}"
        echo -e "   前端界面: http://${local_ip}:3000"
        echo -e "   后端API:  http://${local_ip}:8787"
        echo ""
    fi
    echo -e "${CYAN}📚 API文档:${NC}  http://localhost:8787/docs"
    echo -e "${CYAN}💚 健康检查:${NC} http://localhost:8787/health"
    echo ""
    echo -e "${YELLOW}📋 日志文件:${NC}"
    echo -e "   后端日志: logs/backend.log"
    echo -e "   前端日志: logs/frontend.log"
    echo ""
    echo -e "${YELLOW}🛑 停止服务:${NC}"
    echo -e "   运行: ./stop.sh 或 npm run stop"
    echo ""
    echo -e "${PURPLE}🎯 开始使用:${NC}"
    echo -e "   1. 打开浏览器访问 http://localhost:3000"
    if [ -n "$local_ip" ]; then
        echo -e "   2. 内网用户访问 http://${local_ip}:3000"
        echo -e "   3. 进入训练预估页面"
        echo -e "   4. 选择模型和配置参数"
        echo -e "   5. 点击开始预估查看结果"
    else
        echo -e "   2. 进入训练预估页面"
        echo -e "   3. 选择模型和配置参数"
        echo -e "   4. 点击开始预估查看结果"
    fi
    echo ""
}

# 主函数
main() {
    print_header
    
    # 创建日志目录
    create_log_dir
    
    # 检查依赖
    check_dependencies
    
    # 检查端口
    check_ports
    
    # 安装依赖
    install_dependencies
    
    # 启动服务
    start_backend
    start_frontend
    
    # 显示启动信息
    show_startup_info
    
    # 保持脚本运行
    print_status "服务已启动，按 Ctrl+C 停止所有服务"
    
    # 捕获退出信号
    trap 'print_warning "正在停止服务..." && ./stop.sh && exit 0' INT TERM
    
    # 保持运行
    while true; do
        sleep 1
    done
}

# 运行主函数
main "$@" 