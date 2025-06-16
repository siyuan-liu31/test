"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("../config/database");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// 获取游戏列表
router.get('/', async (req, res) => {
    try {
        // 简化查询，先测试基本功能
        const games = await (0, database_1.query)('SELECT * FROM games ORDER BY rating DESC, play_count DESC LIMIT 20');
        const countResult = await (0, database_1.query)('SELECT COUNT(*) as total FROM games');
        const total = countResult[0].total;
        res.json({
            games,
            total,
            page: 1,
            limit: 20
        });
    }
    catch (error) {
        console.error('Get games error:', error);
        res.status(500).json({ message: '获取游戏列表失败' });
    }
});
// 获取单个游戏信息
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const games = await (0, database_1.query)('SELECT * FROM games WHERE id = ?', [id]);
        if (games.length === 0) {
            return res.status(404).json({ message: '游戏不存在' });
        }
        // 增加游戏播放次数
        await (0, database_1.query)('UPDATE games SET play_count = play_count + 1 WHERE id = ?', [id]);
        res.json(games[0]);
    }
    catch (error) {
        console.error('Get game error:', error);
        res.status(500).json({ message: '获取游戏信息失败' });
    }
});
// 提交游戏分数
router.post('/:id/scores', auth_1.auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { score, play_time } = req.body;
        const userId = req.user.userId;
        // 验证游戏是否存在
        const games = await (0, database_1.query)('SELECT id FROM games WHERE id = ?', [id]);
        if (games.length === 0) {
            return res.status(404).json({ message: '游戏不存在' });
        }
        // 插入分数记录
        await (0, database_1.query)('INSERT INTO game_scores (user_id, game_id, score, play_time) VALUES (?, ?, ?, ?)', [userId, id, score, play_time]);
        res.status(201).json({ message: '分数提交成功' });
    }
    catch (error) {
        console.error('Submit score error:', error);
        res.status(500).json({ message: '分数提交失败' });
    }
});
// 获取游戏排行榜
router.get('/:id/leaderboard', async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 10 } = req.query;
        const leaderboard = await (0, database_1.query)(`
      SELECT 
        gs.score,
        gs.play_time,
        gs.created_at,
        u.username,
        u.avatar_url
      FROM game_scores gs
      LEFT JOIN users u ON gs.user_id = u.id
      WHERE gs.game_id = ?
      ORDER BY gs.score DESC, gs.created_at ASC
      LIMIT ?
    `, [id, typeof limit === 'string' ? parseInt(limit) : limit || 10]);
        res.json(leaderboard);
    }
    catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({ message: '获取排行榜失败' });
    }
});
// 获取游戏评论
router.get('/:id/comments', async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 10, offset = 0 } = req.query;
        const comments = await (0, database_1.query)(`
      SELECT 
        gc.id,
        gc.content,
        gc.rating,
        gc.created_at,
        u.username,
        u.avatar_url
      FROM game_comments gc
      JOIN users u ON gc.user_id = u.id
      WHERE gc.game_id = ?
      ORDER BY gc.created_at DESC
      LIMIT ? OFFSET ?
    `, [id, typeof limit === 'string' ? parseInt(limit) : limit || 10, typeof offset === 'string' ? parseInt(offset) : offset || 0]);
        res.json(comments);
    }
    catch (error) {
        console.error('Get comments error:', error);
        res.status(500).json({ message: '获取评论失败' });
    }
});
// 添加游戏评论
router.post('/:id/comments', auth_1.auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { content, rating } = req.body;
        const userId = req.user.userId;
        // 验证游戏是否存在
        const games = await (0, database_1.query)('SELECT id FROM games WHERE id = ?', [id]);
        if (games.length === 0) {
            return res.status(404).json({ message: '游戏不存在' });
        }
        // 插入评论
        await (0, database_1.query)('INSERT INTO game_comments (game_id, user_id, content, rating) VALUES (?, ?, ?, ?)', [id, userId, content, rating]);
        res.status(201).json({ message: '评论添加成功' });
    }
    catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({ message: '添加评论失败' });
    }
});
exports.default = router;
//# sourceMappingURL=gameRoutes.js.map