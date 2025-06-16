import express from 'express';
import { query } from '../config/database';
import { AuthenticatedRequest } from '../types';
import { auth } from '../middleware/auth';

const router = express.Router();

// 获取用户游戏历史
router.get('/history', auth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { limit = 10, offset = 0 } = req.query;

    const history = await query(`
      SELECT 
        gs.score,
        gs.play_time,
        gs.created_at,
        g.name as game_name,
        g.image_url as game_image
      FROM game_scores gs
      JOIN games g ON gs.game_id = g.id
      WHERE gs.user_id = ?
      ORDER BY gs.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, parseInt(limit as string), parseInt(offset as string)]);

    res.json(history);
  } catch (error) {
    console.error('Get user history error:', error);
    res.status(500).json({ message: '获取游戏历史失败' });
  }
});

// 获取用户收藏的游戏
router.get('/favorites', auth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { limit = 10, offset = 0 } = req.query;

    const favorites = await query(`
      SELECT 
        g.*,
        gf.created_at as favorited_at
      FROM game_favorites gf
      JOIN games g ON gf.game_id = g.id
      WHERE gf.user_id = ?
      ORDER BY gf.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, parseInt(limit as string), parseInt(offset as string)]);

    res.json(favorites);
  } catch (error) {
    console.error('Get user favorites error:', error);
    res.status(500).json({ message: '获取收藏游戏失败' });
  }
});

// 添加游戏到收藏
router.post('/favorites/:gameId', auth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { gameId } = req.params;

    // 检查游戏是否存在
    const games = await query('SELECT id FROM games WHERE id = ?', [gameId]);
    if (games.length === 0) {
      return res.status(404).json({ message: '游戏不存在' });
    }

    // 检查是否已经收藏
    const existing = await query(
      'SELECT id FROM game_favorites WHERE user_id = ? AND game_id = ?',
      [userId, gameId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: '游戏已在收藏列表中' });
    }

    // 添加收藏
    await query(
      'INSERT INTO game_favorites (user_id, game_id) VALUES (?, ?)',
      [userId, gameId]
    );

    res.status(201).json({ message: '收藏成功' });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ message: '添加收藏失败' });
  }
});

// 取消收藏游戏
router.delete('/favorites/:gameId', auth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { gameId } = req.params;

    await query(
      'DELETE FROM game_favorites WHERE user_id = ? AND game_id = ?',
      [userId, gameId]
    );

    res.json({ message: '取消收藏成功' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ message: '取消收藏失败' });
  }
});

// 获取用户统计信息
router.get('/stats', auth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.userId;

    // 获取总游戏次数
    const totalGames = await query(
      'SELECT COUNT(*) as count FROM game_scores WHERE user_id = ?',
      [userId]
    );

    // 获取最高分
    const highestScore = await query(
      'SELECT MAX(score) as max_score FROM game_scores WHERE user_id = ?',
      [userId]
    );

    // 获取总游戏时间
    const totalPlayTime = await query(
      'SELECT SUM(play_time) as total_time FROM game_scores WHERE user_id = ?',
      [userId]
    );

    // 获取收藏数量
    const favoriteCount = await query(
      'SELECT COUNT(*) as count FROM game_favorites WHERE user_id = ?',
      [userId]
    );

    res.json({
      totalGames: totalGames[0].count,
      highestScore: highestScore[0].max_score || 0,
      totalPlayTime: totalPlayTime[0].total_time || 0,
      favoriteCount: favoriteCount[0].count
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: '获取用户统计失败' });
  }
});

export default router; 