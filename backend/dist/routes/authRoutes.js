"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// 注册
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        // 检查用户是否已存在
        const existingUser = await (0, database_1.query)('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: '用户名或邮箱已存在' });
        }
        // 加密密码
        const saltRounds = 10;
        const passwordHash = await bcryptjs_1.default.hash(password, saltRounds);
        // 创建用户
        await (0, database_1.query)('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)', [username, email, passwordHash]);
        res.status(201).json({ message: '注册成功' });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: '注册失败' });
    }
});
// 登录
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // 查找用户
        const users = await (0, database_1.query)('SELECT id, username, email, password_hash FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ message: '邮箱或密码错误' });
        }
        const user = users[0];
        // 验证密码
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(400).json({ message: '邮箱或密码错误' });
        }
        // 生成JWT令牌
        const token = jsonwebtoken_1.default.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: '登录失败' });
    }
});
// 获取当前用户信息
router.get('/me', auth_1.auth, async (req, res) => {
    try {
        const users = await (0, database_1.query)('SELECT id, username, email, avatar_url, created_at FROM users WHERE id = ?', [req.user.userId]);
        if (users.length === 0) {
            return res.status(404).json({ message: '用户不存在' });
        }
        res.json(users[0]);
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: '获取用户信息失败' });
    }
});
exports.default = router;
//# sourceMappingURL=authRoutes.js.map