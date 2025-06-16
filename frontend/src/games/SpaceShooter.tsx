import React, { useEffect, useRef, useState } from 'react';
import { Button, message } from 'antd';
import { SpaceShooterGame } from './SpaceShooterGame';
import styled from 'styled-components';

const GameWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: #000011;
  border-radius: 12px;
`;

const GameCanvas = styled.canvas`
  border: 2px solid #444;
  border-radius: 8px;
  background: #000011;
`;

const ControlsInfo = styled.div`
  color: white;
  text-align: center;
  font-size: 14px;
  line-height: 1.6;
  background: rgba(255, 255, 255, 0.1);
  padding: 12px;
  border-radius: 8px;
  margin-top: 10px;
`;

const ScoreDisplay = styled.div`
  color: white;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
`;

interface SpaceShooterProps {
  onGameEnd?: (score: number, playTime: number) => void;
}

const SpaceShooter: React.FC<SpaceShooterProps> = ({ onGameEnd }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<SpaceShooterGame | null>(null);
  const startTimeRef = useRef<number>(0);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'paused' | 'gameOver'>('ready');
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (canvasRef.current && !gameRef.current) {
      gameRef.current = new SpaceShooterGame(canvasRef.current);
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (gameRef.current) {
      const checkGameState = () => {
        const currentScore = gameRef.current!.getScore();
        setScore(currentScore);

        if (gameRef.current!.isGameOver() && gameState !== 'gameOver') {
          setGameState('gameOver');
          const playTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
          
          message.info(`游戏结束！最终得分：${currentScore}`);
          
          if (onGameEnd) {
            onGameEnd(currentScore, playTime);
          }
        }
      };

      const gameInterval = setInterval(checkGameState, 100);
      return () => clearInterval(gameInterval);
    }
  }, [gameState, onGameEnd]);

  const startGame = () => {
    if (gameRef.current) {
      startTimeRef.current = Date.now();
      gameRef.current.start();
      setGameState('playing');
      message.success('游戏开始！使用 WASD 或方向键移动，空格或点击射击');
    }
  };

  const pauseGame = () => {
    if (gameRef.current && gameState === 'playing') {
      gameRef.current.togglePause();
      setGameState('paused');
    }
  };

  const resumeGame = () => {
    if (gameRef.current && gameState === 'paused') {
      gameRef.current.togglePause();
      setGameState('playing');
    }
  };

  const restartGame = () => {
    if (gameRef.current) {
      gameRef.current.restart();
      startTimeRef.current = Date.now();
      setGameState('playing');
      setScore(0);
    }
  };

  const stopGame = () => {
    if (gameRef.current) {
      gameRef.current.stop();
      setGameState('ready');
      setScore(0);
    }
  };

  return (
    <GameWrapper>
      <GameCanvas
        ref={canvasRef}
        width={800}
        height={600}
        tabIndex={0}
      />
      
      <ScoreDisplay>
        当前得分: {score}
      </ScoreDisplay>

      <ButtonGroup>
        {gameState === 'ready' && (
          <Button type="primary" size="large" onClick={startGame}>
            开始游戏
          </Button>
        )}
        
        {gameState === 'playing' && (
          <>
            <Button onClick={pauseGame}>暂停</Button>
            <Button onClick={stopGame}>结束游戏</Button>
          </>
        )}
        
        {gameState === 'paused' && (
          <>
            <Button type="primary" onClick={resumeGame}>继续</Button>
            <Button onClick={stopGame}>结束游戏</Button>
          </>
        )}
        
        {gameState === 'gameOver' && (
          <>
            <Button type="primary" onClick={restartGame}>重新开始</Button>
            <Button onClick={stopGame}>返回菜单</Button>
          </>
        )}
      </ButtonGroup>

      <ControlsInfo>
        <div><strong>游戏操作:</strong></div>
        <div>• 移动: WASD 键或方向键</div>
        <div>• 射击: 空格键或鼠标点击</div>
        <div>• 暂停: P 键或 ESC 键</div>
        <div>• 鼠标移动: 控制飞船位置</div>
        <div><strong>游戏目标:</strong></div>
        <div>• 击败敌人获得分数</div>
        <div>• 收集道具恢复生命值</div>
        <div>• 避免敌人的攻击</div>
        <div>• 随着等级提升，敌人会更强！</div>
      </ControlsInfo>
    </GameWrapper>
  );
};

export default SpaceShooter; 