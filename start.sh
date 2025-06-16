#!/bin/bash

# 游戏平台启动脚本
echo "🎮 启动小游戏平台..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

# 检查端口是否被占用
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  端口 $1 已被占用"
        return 1
    fi
    return 0
}

echo "🔍 检查端口占用..."
if ! check_port 3000; then
    echo "❌ 前端端口 3000 被占用，请释放后再试"
    exit 1
fi

if ! check_port 3001; then
    echo "❌ 后端端口 3001 被占用，请释放后再试"
    exit 1
fi

if ! check_port 3306; then
    echo "⚠️  MySQL端口 3306 被占用，将使用容器内部网络"
fi

# 创建必要的目录
echo "📁 创建必要的目录..."
mkdir -p backend/uploads
mkdir -p database/logs

# 启动开发环境
if [ "$1" = "dev" ]; then
    echo "🚀 启动开发环境..."
    
    # 启动数据库
    docker-compose up -d mysql redis
    
    echo "⏳ 等待数据库启动..."
    sleep 10
    
    echo "📋 请按以下步骤启动开发环境："
    echo "1. 后端: cd backend && npm install && npm run dev"
    echo "2. 前端: cd frontend && npm install && npm run dev"
    echo "3. 访问: http://localhost:3000"
    
elif [ "$1" = "prod" ]; then
    echo "🚀 启动生产环境..."
    docker-compose up -d
    
    echo "⏳ 等待服务启动..."
    sleep 30
    
    echo "✅ 生产环境启动完成!"
    echo "📱 访问地址: http://localhost"
    echo "🔗 API地址: http://localhost/api"
    echo "💾 管理数据库: mysql -h localhost -u gameuser -p"
    
else
    echo "📖 使用方法:"
    echo "  ./start.sh dev   - 启动开发环境"
    echo "  ./start.sh prod  - 启动生产环境"
    echo ""
    echo "🛠️  开发环境说明:"
    echo "  - 数据库和Redis将在Docker中运行"
    echo "  - 前端和后端需要手动启动（支持热重载）"
    echo ""
    echo "🚀 生产环境说明:"
    echo "  - 所有服务都在Docker容器中运行"
    echo "  - 自动构建和部署"
    echo ""
    echo "📚 更多信息请查看 README.md"
fi 