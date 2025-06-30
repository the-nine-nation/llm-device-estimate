#!/bin/bash

# 大语言模型训练与推理资源预估系统 - 停止脚本
# LLM Resource Estimation System - Stop Script

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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
    echo -e "${PURPLE}  LLM 资源预估系统停止脚本${NC}"
    echo -e "${PURPLE}================================${NC}"
    echo ""
}

# 停止服务通过PID文件
stop_service_by_pid() {
    local service_name=$1
    local pid_file=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            print_status "停止${service_name}服务 (PID: $pid)..."
            kill "$pid"
            
            # 等待进程结束
            for i in {1..10}; do
                if ! kill -0 "$pid" 2>/dev/null; then
                    print_success "${service_name}服务已停止"
                    rm -f "$pid_file"
                    return 0
                fi
                sleep 1
            done
            
            # 强制终止
            print_warning "强制终止${service_name}服务..."
            kill -9 "$pid" 2>/dev/null || true
            rm -f "$pid_file"
            print_success "${service_name}服务已强制停止"
        else
            print_warning "${service_name}服务进程不存在，清理PID文件"
            rm -f "$pid_file"
        fi
    else
        print_warning "${service_name}的PID文件不存在"
    fi
}

# 停止服务通过端口
stop_service_by_port() {
    local service_name=$1
    local port=$2
    
    local pids=$(lsof -ti :$port 2>/dev/null || true)
    if [ -n "$pids" ]; then
        print_status "发现占用端口 $port 的${service_name}进程，正在停止..."
        echo "$pids" | xargs kill 2>/dev/null || true
        sleep 2
        
        # 检查是否还有进程
        local remaining_pids=$(lsof -ti :$port 2>/dev/null || true)
        if [ -n "$remaining_pids" ]; then
            print_warning "强制终止占用端口 $port 的进程..."
            echo "$remaining_pids" | xargs kill -9 2>/dev/null || true
        fi
        print_success "${service_name}服务已停止"
    else
        print_status "端口 $port 没有${service_name}进程运行"
    fi
}

# 主函数
main() {
    print_header
    
    # 停止后端服务
    print_status "停止后端服务..."
    stop_service_by_pid "后端" "logs/backend.pid"
    stop_service_by_port "后端" "8787"
    
    # 停止前端服务
    print_status "停止前端服务..."
    stop_service_by_pid "前端" "logs/frontend.pid"
    stop_service_by_port "前端" "3000"
    
    # 清理日志文件（可选）
    if [ "$1" = "--clean" ] || [ "$1" = "-c" ]; then
        print_status "清理日志文件..."
        rm -f logs/backend.log logs/frontend.log
        print_success "日志文件已清理"
    fi
    
    echo ""
    print_success "🛑 所有服务已停止"
    echo ""
    echo -e "${YELLOW}💡 提示:${NC}"
    echo -e "   - 重新启动: ./start.sh 或 npm start"
    echo -e "   - 清理日志: ./stop.sh --clean"
    echo ""
}

# 运行主函数
main "$@" 