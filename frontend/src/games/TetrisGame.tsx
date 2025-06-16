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

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20
const BLOCK_SIZE = 30
const CANVAS_WIDTH = BOARD_WIDTH * BLOCK_SIZE
const CANVAS_HEIGHT = BOARD_HEIGHT * BLOCK_SIZE

// 俄罗斯方块形状
const TETROMINOES = {
  I: [
    [1, 1, 1, 1]
  ],
  O: [
    [1, 1],
    [1, 1]
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1]
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0]
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1]
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1]
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1]
  ]
}

const COLORS = {
  I: '#00f0f0',
  O: '#f0f000',
  T: '#a000f0',
  S: '#00f000',
  Z: '#f00000',
  J: '#0000f0',
  L: '#f0a000'
}

interface Piece {
  shape: number[][]
  x: number
  y: number
  type: keyof typeof TETROMINOES
}

const TetrisGame: React.FC<{ onGameEnd: (score: number, playTime: number) => void }> = ({ onGameEnd }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [board, setBoard] = useState<(keyof typeof TETROMINOES | 0)[][]>(() => 
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0))
  )
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null)
  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [level, setLevel] = useState(1)
  const [gameRunning, setGameRunning] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [startTime, setStartTime] = useState<number>(0)

  const createPiece = useCallback((): Piece => {
    const types = Object.keys(TETROMINOES) as (keyof typeof TETROMINOES)[]
    const type = types[Math.floor(Math.random() * types.length)]
    return {
      shape: TETROMINOES[type],
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(TETROMINOES[type][0].length / 2),
      y: 0,
      type
    }
  }, [])

  const isValidMove = useCallback((piece: Piece, newX: number, newY: number, newShape?: number[][]) => {
    const shape = newShape || piece.shape
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const boardX = newX + x
          const boardY = newY + y
          if (
            boardX < 0 || 
            boardX >= BOARD_WIDTH || 
            boardY >= BOARD_HEIGHT ||
            (boardY >= 0 && board[boardY][boardX])
          ) {
            return false
          }
        }
      }
    }
    return true
  }, [board])

  const rotatePiece = useCallback((piece: Piece): number[][] => {
    const rotated = piece.shape[0].map((_, index) =>
      piece.shape.map(row => row[index]).reverse()
    )
    return rotated
  }, [])

  const clearLines = useCallback((newBoard: (keyof typeof TETROMINOES | 0)[][]) => {
    let linesCleared = 0
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (newBoard[y].every(cell => cell !== 0)) {
        newBoard.splice(y, 1)
        newBoard.unshift(Array(BOARD_WIDTH).fill(0))
        linesCleared++
        y++ // 重新检查这一行
      }
    }
    return linesCleared
  }, [])

  const placePiece = useCallback((piece: Piece) => {
    const newBoard = board.map(row => [...row])
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardY = piece.y + y
          const boardX = piece.x + x
          if (boardY >= 0) {
            newBoard[boardY][boardX] = piece.type
          }
        }
      }
    }

    const linesCleared = clearLines(newBoard)
    setBoard(newBoard)
    setLines(prev => prev + linesCleared)
    setScore(prev => prev + linesCleared * 100 * level)
    setLevel(Math.floor(lines / 10) + 1)

    // 检查游戏结束
    const newPiece = createPiece()
    if (!isValidMove(newPiece, newPiece.x, newPiece.y)) {
      setGameRunning(false)
      setGameOver(true)
      const playTime = Math.floor((Date.now() - startTime) / 1000)
      onGameEnd(score, playTime)
      message.info(`游戏结束！得分: ${score}`)
    } else {
      setCurrentPiece(newPiece)
    }
  }, [board, clearLines, level, lines, score, startTime, createPiece, isValidMove, onGameEnd])

  const movePiece = useCallback((dx: number, dy: number) => {
    if (!currentPiece || !gameRunning) return

    const newX = currentPiece.x + dx
    const newY = currentPiece.y + dy

    if (isValidMove(currentPiece, newX, newY)) {
      setCurrentPiece({ ...currentPiece, x: newX, y: newY })
    } else if (dy > 0) {
      // 方块落地
      placePiece(currentPiece)
    }
  }, [currentPiece, gameRunning, isValidMove, placePiece])

  const rotatePieceHandler = useCallback(() => {
    if (!currentPiece || !gameRunning) return

    const rotated = rotatePiece(currentPiece)
    if (isValidMove(currentPiece, currentPiece.x, currentPiece.y, rotated)) {
      setCurrentPiece({ ...currentPiece, shape: rotated })
    }
  }, [currentPiece, gameRunning, rotatePiece, isValidMove])

  // 绘制游戏
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 清空画布
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // 绘制已放置的方块
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (board[y][x]) {
          ctx.fillStyle = COLORS[board[y][x] as keyof typeof COLORS]
          ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1)
        }
      }
    }

    // 绘制当前方块
    if (currentPiece) {
      ctx.fillStyle = COLORS[currentPiece.type]
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            ctx.fillRect(
              (currentPiece.x + x) * BLOCK_SIZE,
              (currentPiece.y + y) * BLOCK_SIZE,
              BLOCK_SIZE - 1,
              BLOCK_SIZE - 1
            )
          }
        }
      }
    }

    // 绘制网格
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 1
    for (let x = 0; x <= BOARD_WIDTH; x++) {
      ctx.beginPath()
      ctx.moveTo(x * BLOCK_SIZE, 0)
      ctx.lineTo(x * BLOCK_SIZE, CANVAS_HEIGHT)
      ctx.stroke()
    }
    for (let y = 0; y <= BOARD_HEIGHT; y++) {
      ctx.beginPath()
      ctx.moveTo(0, y * BLOCK_SIZE)
      ctx.lineTo(CANVAS_WIDTH, y * BLOCK_SIZE)
      ctx.stroke()
    }
  }, [board, currentPiece])

  // 游戏循环
  useEffect(() => {
    if (!gameRunning) return

    const interval = setInterval(() => {
      movePiece(0, 1)
    }, Math.max(100, 1000 - (level - 1) * 100))

    return () => clearInterval(interval)
  }, [gameRunning, level, movePiece])

  // 键盘控制
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameRunning) return

      switch (e.key) {
        case 'ArrowLeft':
          movePiece(-1, 0)
          break
        case 'ArrowRight':
          movePiece(1, 0)
          break
        case 'ArrowDown':
          movePiece(0, 1)
          break
        case 'ArrowUp':
        case ' ':
          rotatePieceHandler()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameRunning, movePiece, rotatePieceHandler])

  const startGame = () => {
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0)))
    setCurrentPiece(createPiece())
    setScore(0)
    setLines(0)
    setLevel(1)
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
        <div>行数: {lines}</div>
        <div>等级: {level}</div>
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
        <p>方向键移动，上键或空格键旋转</p>
        <p>消除整行得分，速度随等级提升</p>
      </div>
    </GameContainer>
  )
}

export default TetrisGame 