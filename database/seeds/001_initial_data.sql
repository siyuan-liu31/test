-- 插入初始游戏数据
INSERT INTO games (name, description, image_url, category, is_premium, play_count, rating) VALUES
('贪吃蛇', '经典的贪吃蛇游戏，控制蛇吃食物，避免撞到墙壁和自己的身体。随着得分增加，游戏速度会越来越快！', '/images/snake-game.jpg', '经典游戏', FALSE, 1250, 4.5),
('俄罗斯方块', '经典的俄罗斯方块游戏，旋转和移动下落的方块，消除完整的行来得分。', '/images/tetris-game.jpg', '经典游戏', FALSE, 890, 4.3),
('消消乐', '点击相同颜色的方块来消除它们，制造连击来获得更高的分数！', '/images/match-game.jpg', '休闲游戏', FALSE, 2100, 4.1),
('跳跃忍者', '控制忍者在平台间跳跃，收集金币，避开障碍物。这是一个会员专享游戏！', '/images/ninja-game.jpg', '动作游戏', TRUE, 450, 4.7),
('太空射击', '驾驶宇宙飞船在太空中战斗，击败敌人，收集能量。需要登录才能游玩。', '/images/space-game.jpg', '射击游戏', TRUE, 670, 4.4),
('数字华容道', '移动数字方块，将它们按顺序排列。考验你的逻辑思维能力！', '/images/puzzle-game.jpg', '益智游戏', FALSE, 320, 4.0);

-- 插入一些示例用户（密码都是 "123456" 的bcrypt哈希值）
INSERT INTO users (username, email, password_hash, is_verified) VALUES
('admin', 'admin@gameplatform.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE),
('testuser', 'test@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE),
('gamer01', 'gamer01@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', FALSE);

-- 插入一些示例游戏分数
INSERT INTO game_scores (user_id, game_id, score, play_time) VALUES
(2, 1, 1250, 225), -- testuser在贪吃蛇中的分数
(2, 1, 980, 180),
(2, 1, 750, 140),
(2, 3, 2100, 320), -- testuser在消消乐中的分数
(3, 1, 890, 160),  -- gamer01在贪吃蛇中的分数
(3, 2, 1500, 280); -- gamer01在俄罗斯方块中的分数

-- 插入一些示例评论
INSERT INTO game_comments (game_id, user_id, content, rating) VALUES
(1, 2, '经典的贪吃蛇游戏，操作简单，很有趣！', 5),
(1, 3, '画面简洁，游戏流畅，值得一玩。', 4),
(3, 2, '消消乐很有意思，但是难度有点高。', 4),
(2, 3, '俄罗斯方块做得不错，让我想起了小时候。', 5);

-- 插入一些收藏记录
INSERT INTO game_favorites (user_id, game_id) VALUES
(2, 1), -- testuser收藏了贪吃蛇
(2, 3), -- testuser收藏了消消乐
(3, 1), -- gamer01收藏了贪吃蛇
(3, 2); -- gamer01收藏了俄罗斯方块 