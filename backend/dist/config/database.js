"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = exports.testConnection = exports.pool = exports.dbConfig = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gaming_platform',
    connectionLimit: 10,
};
// 创建连接池
exports.pool = promise_1.default.createPool({
    ...exports.dbConfig,
    waitForConnections: true,
    queueLimit: 0,
});
// 测试数据库连接
const testConnection = async () => {
    try {
        const connection = await exports.pool.getConnection();
        console.log('✅ Database connected successfully');
        connection.release();
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
    }
};
exports.testConnection = testConnection;
// 执行查询的工具函数
const query = async (sql, params) => {
    try {
        const [results] = await exports.pool.execute(sql, params);
        return results;
    }
    catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};
exports.query = query;
exports.default = exports.pool;
//# sourceMappingURL=database.js.map