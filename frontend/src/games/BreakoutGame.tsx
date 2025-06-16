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

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600
const PADDLE_WIDTH = 100
const PADDLE_HEIGHT = 10
const BALL_RADIUS = 8
const BRICK_ROWS = 8
const BRICK_COLS = 10
const BRICK_WIDTH = CANVAS_WIDTH / BRICK_COLS
const BRICK_HEIGHT = 20

interface Ball {
  x: number
  y: number
  dx: number
  dy: number
}

interface Paddle {
  x: number
  y: number
}

interface Brick {
  x: number
  y: number
  visible: boolean
  color: string
}

const BreakoutGame: React.FC<{ onGameEnd: (score: number, playTime: number) => void }> = ({ onGameEnd }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ball, setBall] = useState<Ball>({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 50, dx: 4, dy: -4 })
  const [paddle, setPaddle] = useState<Paddle>({ x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2, y: CANVAS_HEIGHT - 30 })
  const [bricks, setBricks] = useState<Brick[]>([])
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [gameRunning, setGameRunning] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [startTime, setStartTime] = useState<number>(0)

  const initBricks = useCallback(() => {
    const newBricks: Brick[] = []
    const colors = ['#ff0000', '#ff8800', '#ffff00', '#88ff00', '#00ff00', '#00ff88', '#0088ff', '#0000ff']
    
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        newBricks.push({
          x: col * BRICK_WIDTH,
          y: row * BRICK_HEIGHT + 50,
          visible: true,
          color: colors[row % colors.length]
        })
      }
    }
    return newBricks
  }, [])

  const checkCollision = useCallback((ball: Ball, paddle: Paddle, bricks: Brick[]) => {
    let newBall = { ...ball }
    let newBricks = [...bricks]
    let scoreIncrease = 0

    // 墙壁碰撞
    if (newBall.x + BALL_RADIUS > CANVAS_WIDTH || newBall.x - BALL_RADIUS < 0) {
      newBall.dx = -newBall.dx
    }
    if (newBall.y - BALL_RADIUS < 0) {
      newBall.dy = -newBall.dy
    }

    // 球拍碰撞
    if (
      newBall.y + BALL_RADIUS > paddle.y &&
      newBall.y - BALL_RADIUS < paddle.y + PADDLE_HEIGHT &&
      newBall.x > paddle.x &&
      newBall.x < paddle.x + PADDLE_WIDTH
    ) {
      newBall.dy = -Math.abs(newBall.dy) // 确保球向上弹
      // 根据击中球拍的位置调整角度
      const hitPos = (newBall.x - paddle.x) / PADDLE_WIDTH
      newBall.dx = (hitPos - 0.5) * 8
    }

    // 砖块碰撞
    for (let i = 0; i < newBricks.length; i++) {
      const brick = newBricks[i]
      if (
        brick.visible &&
        newBall.x > brick.x &&
        newBall.x < brick.x + BRICK_WIDTH &&
        newBall.y > brick.y &&
        newBall.y < brick.y + BRICK_HEIGHT
      ) {
        newBricks[i] = { ...brick, visible: false }
        newBall.dy = -newBall.dy
        scoreIncrease += 10
        break
      }
    }

    return { ball: newBall, bricks: newBricks, scoreIncrease }
  }, [])

  const gameLoop = useCallback(() => {
    setBall(prevBall => {
      const newBall = {
        x: prevBall.x + prevBall.dx,
        y: prevBall.y + prevBall.dy,
        dx: prevBall.dx,
        dy: prevBall.dy
      }

      const collision = checkCollision(newBall, paddle, bricks)
      
      setBricks(collision.bricks)
      setScore(prev => prev + collision.scoreIncrease)

      // 检查球是否掉落
      if (collision.ball.y + BALL_RADIUS > CANVAS_HEIGHT) {
        setLives(prev => {
          const newLives = prev - 1
          if (newLives <= 0) {
            setGameRunning(false)
            setGameOver(true)
            const playTime = Math.floor((Date.now() - startTime) / 1000)
            onGameEnd(score, playTime)
            message.info(`游戏结束！得分: ${score}`)
          } else {
            // 重置球的位置
            collision.ball = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 50, dx: 4, dy: -4 }
          }
          return newLives
        })
      }

      // 检查是否获胜
      if (collision.bricks.every(brick => !brick.visible)) {
        setGameRunning(false)
        setGameWon(true)
        const playTime = Math.floor((Date.now() - startTime) / 1000)
        onGameEnd(score + 100, playTime) // 获胜奖励
        message.success(`恭喜获胜！得分: ${score + 100}`)
      }

      return collision.ball
    })
  }, [paddle, bricks, score, startTime, checkCollision, onGameEnd])

  // 绘制游戏
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 清空画布
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // 绘制砖块
    bricks.forEach(brick => {
      if (brick.visible) {
        ctx.fillStyle = brick.color
        ctx.fillRect(brick.x, brick.y, BRICK_WIDTH - 2, BRICK_HEIGHT - 2)
      }
    })

    // 绘制球拍
    ctx.fillStyle = '#fff'
    ctx.fillRect(paddle.x, paddle.y, PADDLE_WIDTH, PADDLE_HEIGHT)

    // 绘制球
    ctx.beginPath()
    ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2)
    ctx.fillStyle = '#fff'
    ctx.fill()
    ctx.closePath()
  }, [ball, paddle, bricks])

  // 游戏循环
  useEffect(() => {
    if (!gameRunning) return

    const interval = setInterval(gameLoop, 16) // 约60FPS
    return () => clearInterval(interval)
  }, [gameRunning, gameLoop])

  // 鼠标控制
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!gameRunning) return

      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      
      setPaddle(prev => ({
        ...prev,
        x: Math.max(0, Math.min(CANVAS_WIDTH - PADDLE_WIDTH, mouseX - PADDLE_WIDTH / 2))
      }))
    }

    const canvas = canvasRef.current
    if (canvas) {
      canvas.addEventListener('mousemove', handleMouseMove)
      return () => canvas.removeEventListener('mousemove', handleMouseMove)
    }
  }, [gameRunning])

  // 键盘控制
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameRunning) return

      switch (e.key) {
        case 'ArrowLeft':
          setPaddle(prev => ({
            ...prev,
            x: Math.max(0, prev.x - 20)
          }))
          break
        case 'ArrowRight':
          setPaddle(prev => ({
            ...prev,
            x: Math.min(CANVAS_WIDTH - PADDLE_WIDTH, prev.x + 20)
          }))
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameRunning])

  const startGame = () => {
    setBall({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 50, dx: 4, dy: -4 })
    setPaddle({ x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2, y: CANVAS_HEIGHT - 30 })
    setBricks(initBricks())
    setScore(0)
    setLives(3)
    setGameRunning(true)
    setGameOver(false)
    setGameWon(false)
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
        <div>生命: {lives}</div>
        <div>状态: {gameWon ? '获胜！' : gameOver ? '游戏结束' : gameRunning ? '进行中' : '暂停'}</div>
      </GameInfo>
      <Controls>
        <Button type="primary" onClick={startGame}>
          {gameOver || gameWon ? '重新开始' : '开始游戏'}
        </Button>
        {!gameOver && !gameWon && (
          <Button onClick={pauseGame}>
            {gameRunning ? '暂停' : '继续'}
          </Button>
        )}
      </Controls>
      <div style={{ marginTop: '10px', textAlign: 'center' }}>
        <p>移动鼠标或使用左右方向键控制球拍</p>
        <p>打破所有砖块获胜，小心不要让球掉落</p>
      </div>
    </GameContainer>
  )
}

export default BreakoutGame 