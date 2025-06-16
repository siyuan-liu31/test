# 🎮 小游戏平台网站

一个现代化的小游戏平台，支持用户注册登录、游戏体验和社交功能。基于React + Node.js + MySQL构建，提供完整的游戏生态系统。

## ✨ 特性

- 🎯 **丰富的游戏体验**: 包含贪吃蛇等经典小游戏
- 👥 **完整用户系统**: 注册、登录、游客模式
- 📱 **响应式设计**: 完美支持桌面和移动设备
- 🏆 **排行榜系统**: 记录和展示游戏成绩
- 🎨 **现代化UI**: 基于Ant Design的美观界面
- 🔒 **安全可靠**: JWT认证 + 数据加密
- 🚀 **高性能**: Redis缓存 + 数据库优化
- 🐳 **容器化部署**: 支持Docker一键部署

## 🏗️ 项目结构

```
game-platform/
├── 📂 frontend/              # 前端应用 (React + TypeScript)
│   ├── 📂 src/
│   │   ├── 📂 components/    # 通用组件
│   │   ├── 📂 pages/         # 页面组件
│   │   ├── 📂 games/         # 游戏相关
│   │   ├── 📂 hooks/         # 自定义Hooks
│   │   ├── 📂 services/      # API服务
│   │   ├── 📂 store/         # 状态管理
│   │   ├── 📂 types/         # TypeScript类型
│   │   └── 📂 utils/         # 工具函数
│   ├── 📂 public/            # 静态资源
│   ├── 📄 Dockerfile         # 前端容器配置
│   └── 📄 package.json
├── 📂 backend/               # 后端API (Node.js + Express)
│   ├── 📂 src/
│   │   ├── 📂 controllers/   # 控制器
│   │   ├── 📂 middleware/    # 中间件
│   │   ├── 📂 models/        # 数据模型
│   │   ├── 📂 routes/        # 路由
│   │   ├── 📂 services/      # 业务逻辑
│   │   ├── 📂 config/        # 配置文件
│   │   └── 📂 utils/         # 工具函数
│   ├── 📄 Dockerfile         # 后端容器配置
│   └── 📄 package.json
├── 📂 database/              # 数据库相关
│   ├── 📂 migrations/        # 数据库迁移
│   └── 📂 seeds/             # 初始数据
├── 📄 docker-compose.yml     # Docker编排配置
├── 📄 start.sh               # 一键启动脚本
└── 📄 项目规划.md             # 详细项目规划
```

## 🛠️ 技术栈

### 前端技术
- **React 18** - 现代化前端框架
- **TypeScript** - 类型安全的JavaScript
- **Vite** - 快速构建工具
- **Ant Design** - 企业级UI组件库
- **Redux Toolkit** - 状态管理
- **Styled Components** - CSS-in-JS样式方案
- **Canvas游戏引擎** - 自定义游戏渲染

### 后端技术
- **Node.js 18** - JavaScript运行时
- **Express.js** - Web应用框架
- **TypeScript** - 类型安全开发
- **MySQL 8.0** - 关系型数据库
- **Redis** - 内存缓存数据库
- **JWT** - 无状态身份认证
- **bcrypt** - 密码加密
- **Joi** - 数据验证

### 运维技术
- **Docker** - 应用容器化
- **Docker Compose** - 多容器编排
- **Nginx** - 反向代理和静态文件服务
- **PM2** - 进程管理

## 🚀 快速开始

### 方式一：一键启动（推荐）

```bash
# 克隆项目
git clone <repository-url>
cd game-platform

# 开发环境启动
./start.sh dev

# 或生产环境启动
./start.sh prod
```

### 方式二：手动启动

#### 前置要求
- Node.js 18+
- MySQL 8.0+
- Redis（可选）

#### 1. 数据库配置
```bash
# 启动MySQL服务
mysql -u root -p

# 创建数据库
CREATE DATABASE game_platform;

# 导入数据表
mysql -u root -p game_platform < database/migrations/001_create_tables.sql

# 导入初始数据
mysql -u root -p game_platform < database/seeds/001_initial_data.sql
```

#### 2. 后端启动
```bash
cd backend

# 安装依赖
npm install

# 复制环境变量文件
cp config/.env.example .env

# 编辑配置文件
nano .env

# 启动开发服务器
npm run dev
```

#### 3. 前端启动
```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

#### 4. 访问应用
- 前端地址: http://localhost:3000
- 后端API: http://localhost:3001
- 健康检查: http://localhost:3001/health

## 🎯 版本 1.0 功能

### ✅ 已完成功能
- **用户系统**
  - 用户注册（邮箱验证）
  - 用户登录（JWT认证）
  - 游客模式体验
  - 个人资料管理

- **游戏功能**
  - 贪吃蛇游戏（Canvas实现）
  - 游戏分数记录
  - 实时排行榜
  - 游戏历史统计

- **界面设计**
  - 响应式网页设计
  - 现代化UI/UX
  - 移动端适配
  - 暗黑/明亮主题

### 🎮 游戏特性
- **贪吃蛇游戏**
  - 平滑的游戏体验
  - 键盘和触屏控制
  - 动态难度调整
  - 游戏暂停/继续
  - 分数统计和排名

## 📋 API文档

### 认证接口
```bash
# 用户注册
POST /api/auth/register
Content-Type: application/json
{
  "username": "用户名",
  "email": "邮箱",
  "password": "密码"
}

# 用户登录
POST /api/auth/login
Content-Type: application/json
{
  "email": "邮箱",
  "password": "密码"
}

# 获取用户信息
GET /api/auth/me
Authorization: Bearer <token>
```

### 游戏接口
```bash
# 获取游戏列表
GET /api/games?page=1&limit=10&category=经典游戏

# 获取游戏详情
GET /api/games/:id

# 提交游戏分数
POST /api/games/:id/scores
Authorization: Bearer <token>
Content-Type: application/json
{
  "score": 1000,
  "playTime": 120
}

# 获取排行榜
GET /api/games/:id/leaderboard?limit=10&timeRange=weekly
```

## 🔧 开发指南

### 环境变量配置
```bash
# 后端环境变量 (.env)
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=game_platform
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:3000
```

### 代码规范
- 使用TypeScript进行类型检查
- 遵循ESLint规则
- 使用Prettier格式化代码
- 编写单元测试

### 数据库设计
项目使用MySQL数据库，主要包含以下表：
- `users` - 用户信息
- `games` - 游戏信息
- `game_scores` - 游戏分数记录
- `game_comments` - 游戏评论
- `game_favorites` - 游戏收藏

## 🚢 部署指南

### Docker部署（推荐）
```bash
# 生产环境部署
./start.sh prod

# 或手动使用docker-compose
docker-compose up -d
```

### 传统部署
```bash
# 构建前端
cd frontend
npm run build

# 构建后端
cd backend
npm run build

# 启动服务
npm start
```

## 🔍 测试

### 单元测试
```bash
# 后端测试
cd backend
npm test

# 前端测试
cd frontend
npm test
```

### 集成测试
```bash
# API测试
npm run test:api

# E2E测试
npm run test:e2e
```

## 📈 性能优化

- **前端优化**
  - 代码分割和懒加载
  - 图片压缩和CDN
  - 静态资源缓存
  - Gzip压缩

- **后端优化**
  - 数据库连接池
  - Redis缓存
  - API响应压缩
  - 请求速率限制

## 🛡️ 安全措施

- JWT令牌认证
- 密码bcrypt加密
- SQL注入防护
- XSS攻击防护
- CORS跨域配置
- 请求频率限制

## 🔮 后续开发计划

### 短期计划 (v1.1)
- [ ] 更多游戏类型（俄罗斯方块、消消乐）
- [ ] 游戏音效和背景音乐
- [ ] 用户头像上传
- [ ] 游戏评论和评分系统

### 中期计划 (v1.2)
- [ ] 好友系统和社交功能
- [ ] 游戏成就系统
- [ ] 实时对战功能
- [ ] 移动端APP

### 长期计划 (v2.0)
- [ ] 游戏开发者平台
- [ ] 游戏内购买系统
- [ ] AI推荐算法
- [ ] 多语言支持

## 🤝 贡献指南

1. Fork本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 👨‍💻 作者

- **CTO** - *项目架构和开发* - [GitHub](https://github.com)

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和用户！

---

**⭐ 如果这个项目对你有帮助，请给它一个星星！**
