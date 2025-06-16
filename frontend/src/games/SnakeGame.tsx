import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Button, message } from 'antd'
import styled from 'styled-components'

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`

const Canvas = styled.canvas`
  border: 2px solid #333;
  background: #000;
`

const GameInfo = styled.div`
  display: flex;
  gap: 20px;
  margin: 20px 0;
  font-size: 18px;
  font-weight: bold;
`

const Controls = styled.div`
  display: flex;
  gap: 10px;
  margin: 10px 0;
`

interface Position {
  x: number
  y: number
}

const GRID_SIZE = 20
const CANVAS_WIDTH = 400
const CANVAS_HEIGHT = 400

const SnakeGame: React.FC<{ onGameEnd: (score: number, playTime: number) => void }> = ({ onGameEnd }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [snake, setSnake] = useState<Position[]>([{ x: 200, y: 200 }])
  const [food, setFood] = useState<Position>({ x: 100, y: 100 })
  const [direction, setDirection] = useState<Position>({ x: GRID_SIZE, y: 0 })
  const [score, setScore] = useState(0)
  const [gameRunning, setGameRunning] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [startTime, setStartTime] = useState<number>(0)

  const generateFood = useCallback(() => {
    const x = Math.floor(Math.random() * (CANVAS_WIDTH / GRID_SIZE)) * GRID_SIZE
    const y = Math.floor(Math.random() * (CANVAS_HEIGHT / GRID_SIZE)) * GRID_SIZE
    return { x, y }
  }, [])

  const checkCollision = useCallback((head: Position, snakeBody: Position[]) => {
    // 检查墙壁碰撞
    if (head.x < 0 || head.x >= CANVAS_WIDTH || head.y < 0 || head.y >= CANVAS_HEIGHT) {
      return true
    }
    // 检查自身碰撞
    return snakeBody.some(segment => segment.x === head.x && segment.y === head.y)
  }, [])

  const gameLoop = useCallback(() => {
    setSnake(prevSnake => {
      const newSnake = [...prevSnake]
      const head = { x: newSnake[0].x + direction.x, y: newSnake[0].y + direction.y }

      if (checkCollision(head, newSnake)) {
        setGameRunning(false)
        setGameOver(true)
        const playTime = Math.floor((Date.now() - startTime) / 1000)
        onGameEnd(score, playTime)
        message.info(`游戏结束！得分: ${score}`)
        return prevSnake
      }

      newSnake.unshift(head)

      // 检查是否吃到食物
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 10)
        setFood(generateFood())
      } else {
        newSnake.pop()
      }

      return newSnake
    })
  }, [direction, food, score, startTime, checkCollision, generateFood, onGameEnd])

  // 绘制游戏
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 清空画布
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // 绘制蛇
    ctx.fillStyle = '#0f0'
    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#0f0' : '#090'
      ctx.fillRect(segment.x, segment.y, GRID_SIZE - 2, GRID_SIZE - 2)
    })

    // 绘制食物
    ctx.fillStyle = '#f00'
    ctx.fillRect(food.x, food.y, GRID_SIZE - 2, GRID_SIZE - 2)
  }, [snake, food])

  // 游戏循环
  useEffect(() => {
    if (!gameRunning) return

    const interval = setInterval(gameLoop, 150)
    return () => clearInterval(interval)
  }, [gameRunning, gameLoop])

  // 键盘控制
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameRunning) return

      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) setDirection({ x: 0, y: -GRID_SIZE })
          break
        case 'ArrowDown':
          if (direction.y === 0) setDirection({ x: 0, y: GRID_SIZE })
          break
        case 'ArrowLeft':
          if (direction.x === 0) setDirection({ x: -GRID_SIZE, y: 0 })
          break
        case 'ArrowRight':
          if (direction.x === 0) setDirection({ x: GRID_SIZE, y: 0 })
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [direction, gameRunning])

  const startGame = () => {
    setSnake([{ x: 200, y: 200 }])
    setFood(generateFood())
    setDirection({ x: GRID_SIZE, y: 0 })
    setScore(0)
    setGameRunning(true)
    setGameOver(false)
    setStartTime(Date.now())
  }

  const pauseGame = () => {
    setGameRunning(!gameRunning)
  }

  return (
    <GameContainer>
      <Canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
      />
      <GameInfo>
        <div>得分: {score}</div>
        <div>状态: {gameOver ? '游戏结束' : gameRunning ? '进行中' : '暂停'}</div>
      </GameInfo>
      <Controls>
        <Button type="primary" onClick={startGame}>
          {gameOver ? '重新开始' : '开始游戏'}
        </Button>
        {!gameOver && (
          <Button onClick={pauseGame}>
            {gameRunning ? '暂停' : '继续'}
          </Button>
        )}
      </Controls>
      <div style={{ marginTop: '10px', textAlign: 'center' }}>
        <p>使用方向键控制蛇的移动</p>
        <p>吃到红色食物得分，避免撞墙和撞到自己</p>
      </div>
    </GameContainer>
  )
}

export default SnakeGame 