import React, { useEffect, useState, useCallback } from 'react'
import { Button, message } from 'antd'
import styled from 'styled-components'

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`

const GameBoard = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 10px;
  background: #bbada0;
  border-radius: 6px;
  padding: 10px;
  width: 320px;
  height: 320px;
`

const GameTile = styled.div<{ value: number }>`
  width: 70px;
  height: 70px;
  background: ${props => getTileColor(props.value)};
  color: ${props => props.value > 4 ? '#f9f6f2' : '#776e65'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.value > 99 ? '24px' : '32px'};
  font-weight: bold;
  border-radius: 3px;
  transition: all 0.15s ease-in-out;
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

function getTileColor(value: number): string {
  const colors: { [key: number]: string } = {
    0: '#cdc1b4',
    2: '#eee4da',
    4: '#ede0c8',
    8: '#f2b179',
    16: '#f59563',
    32: '#f67c5f',
    64: '#f65e3b',
    128: '#edcf72',
    256: '#edcc61',
    512: '#edc850',
    1024: '#edc53f',
    2048: '#edc22e'
  }
  return colors[value] || '#3c3a32'
}

type Board = number[][]

const Game2048: React.FC<{ onGameEnd: (score: number, playTime: number) => void }> = ({ onGameEnd }) => {
  const [board, setBoard] = useState<Board>(() => Array(4).fill(null).map(() => Array(4).fill(0)))
  const [score, setScore] = useState(0)
  const [gameRunning, setGameRunning] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [startTime, setStartTime] = useState<number>(0)

  const addRandomTile = useCallback((board: Board): Board => {
    const emptyCells: [number, number][] = []
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 0) {
          emptyCells.push([i, j])
        }
      }
    }

    if (emptyCells.length === 0) return board

    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)]
    const newBoard = board.map(row => [...row])
    newBoard[randomCell[0]][randomCell[1]] = Math.random() < 0.9 ? 2 : 4
    return newBoard
  }, [])

  const initBoard = useCallback(() => {
    let newBoard: Board = Array(4).fill(null).map(() => Array(4).fill(0))
    newBoard = addRandomTile(newBoard)
    newBoard = addRandomTile(newBoard)
    return newBoard
  }, [addRandomTile])

  const moveLeft = useCallback((board: Board): { board: Board; score: number; moved: boolean } => {
    const newBoard = board.map(row => [...row])
    let scoreIncrease = 0
    let moved = false

    for (let i = 0; i < 4; i++) {
      const row = newBoard[i].filter(val => val !== 0)
      
      // 合并相同的数字
      for (let j = 0; j < row.length - 1; j++) {
        if (row[j] === row[j + 1]) {
          row[j] *= 2
          scoreIncrease += row[j]
          row[j + 1] = 0
        }
      }
      
      // 移除合并后的0并填充到右边
      const filteredRow = row.filter(val => val !== 0)
      while (filteredRow.length < 4) {
        filteredRow.push(0)
      }
      
      // 检查是否有移动
      for (let j = 0; j < 4; j++) {
        if (newBoard[i][j] !== filteredRow[j]) {
          moved = true
        }
        newBoard[i][j] = filteredRow[j]
      }
    }

    return { board: newBoard, score: scoreIncrease, moved }
  }, [])

  const moveRight = useCallback((board: Board): { board: Board; score: number; moved: boolean } => {
    const rotatedBoard = board.map(row => [...row].reverse())
    const result = moveLeft(rotatedBoard)
    const finalBoard = result.board.map(row => [...row].reverse())
    return { ...result, board: finalBoard }
  }, [moveLeft])

  const moveUp = useCallback((board: Board): { board: Board; score: number; moved: boolean } => {
    // 转置矩阵
    const transposed = board[0].map((_, colIndex) => board.map(row => row[colIndex]))
    const result = moveLeft(transposed)
    // 转置回来
    const finalBoard = result.board[0].map((_, colIndex) => result.board.map(row => row[colIndex]))
    return { ...result, board: finalBoard }
  }, [moveLeft])

  const moveDown = useCallback((board: Board): { board: Board; score: number; moved: boolean } => {
    // 转置并翻转
    const transposed = board[0].map((_, colIndex) => board.map(row => row[colIndex]).reverse())
    const result = moveLeft(transposed)
    // 翻转并转置回来
    const finalBoard = result.board.map(row => [...row].reverse())[0].map((_, colIndex) => 
      result.board.map(row => [...row].reverse()).map(row => row[colIndex])
    )
    return { ...result, board: finalBoard }
  }, [moveLeft])

  const canMove = useCallback((board: Board): boolean => {
    // 检查是否有空格
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 0) return true
      }
    }

    // 检查是否可以合并
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const current = board[i][j]
        if (
          (i < 3 && board[i + 1][j] === current) ||
          (j < 3 && board[i][j + 1] === current)
        ) {
          return true
        }
      }
    }

    return false
  }, [])

  const hasWon = useCallback((board: Board): boolean => {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 2048) return true
      }
    }
    return false
  }, [])

  const handleMove = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    if (!gameRunning || gameOver || gameWon) return

    let result: { board: Board; score: number; moved: boolean }

    switch (direction) {
      case 'left':
        result = moveLeft(board)
        break
      case 'right':
        result = moveRight(board)
        break
      case 'up':
        result = moveUp(board)
        break
      case 'down':
        result = moveDown(board)
        break
    }

    if (!result.moved) return

    const newBoard = addRandomTile(result.board)
    setBoard(newBoard)
    setScore(prev => prev + result.score)

    // 检查获胜
    if (!gameWon && hasWon(newBoard)) {
      setGameWon(true)
      const playTime = Math.floor((Date.now() - startTime) / 1000)
      onGameEnd(score + result.score + 1000, playTime) // 获胜奖励
      message.success(`恭喜达到2048！得分: ${score + result.score + 1000}`)
      return
    }

    // 检查游戏结束
    if (!canMove(newBoard)) {
      setGameRunning(false)
      setGameOver(true)
      const playTime = Math.floor((Date.now() - startTime) / 1000)
      onGameEnd(score + result.score, playTime)
      message.info(`游戏结束！得分: ${score + result.score}`)
    }
  }, [board, gameRunning, gameOver, gameWon, score, startTime, moveLeft, moveRight, moveUp, moveDown, addRandomTile, hasWon, canMove, onGameEnd])

  // 键盘控制
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          handleMove('left')
          break
        case 'ArrowRight':
          e.preventDefault()
          handleMove('right')
          break
        case 'ArrowUp':
          e.preventDefault()
          handleMove('up')
          break
        case 'ArrowDown':
          e.preventDefault()
          handleMove('down')
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleMove])

  const startGame = () => {
    setBoard(initBoard())
    setScore(0)
    setGameRunning(true)
    setGameOver(false)
    setGameWon(false)
    setStartTime(Date.now())
  }

  const continueGame = () => {
    setGameWon(false)
  }

  return (
    <GameContainer>
      <GameBoard>
        {board.flat().map((value, index) => (
          <GameTile key={index} value={value}>
            {value !== 0 && value}
          </GameTile>
        ))}
      </GameBoard>
      <GameInfo>
        <div>得分: {score}</div>
        <div>状态: {gameWon ? '达到2048！' : gameOver ? '游戏结束' : gameRunning ? '进行中' : '未开始'}</div>
      </GameInfo>
      <Controls>
        <Button type="primary" onClick={startGame}>
          {gameOver ? '重新开始' : '开始游戏'}
        </Button>
        {gameWon && !gameOver && (
          <Button onClick={continueGame}>
            继续游戏
          </Button>
        )}
      </Controls>
      <div style={{ marginTop: '10px', textAlign: 'center' }}>
        <p>使用方向键移动数字方块</p>
        <p>相同数字相撞时会合并，目标是达到2048</p>
      </div>
    </GameContainer>
  )
}

export default Game2048 