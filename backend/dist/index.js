"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const database_1 = require("./config/database");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const gameRoutes_1 = __importDefault(require("./routes/gameRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const errorHandler_1 = require("./middleware/errorHandler");
// 加载环境变量
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// 安全中间件
app.use((0, helmet_1.default)());
// CORS配置
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
}));
// 请求日志
app.use((0, morgan_1.default)(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
// 请求体解析
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// 速率限制
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15分钟
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 限制每个IP 100个请求
    message: {
        error: '请求过于频繁，请稍后再试',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);
// 健康检查
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
    });
});
// API路由
app.use('/api/auth', authRoutes_1.default);
app.use('/api/games', gameRoutes_1.default);
app.use('/api/user', userRoutes_1.default);
// 404处理
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API路由不存在',
        path: req.originalUrl,
    });
});
// 错误处理中间件
app.use(errorHandler_1.errorHandler);
// 启动服务器
const startServer = async () => {
    try {
        // 测试数据库连接
        await (0, database_1.testConnection)();
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🌐 CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
            if (process.env.NODE_ENV === 'development') {
                console.log(`🔗 Health check: http://localhost:${PORT}/health`);
                console.log(`📋 API base URL: http://localhost:${PORT}/api`);
            }
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
// 处理未捕获的异常
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
// 优雅关闭
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});
startServer();
//# sourceMappingURL=index.js.map