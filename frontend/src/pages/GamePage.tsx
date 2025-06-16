import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, Spin, message } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { submitScore } from '../store/gameSlice'
import * as gameService from '../services/gameService'
import SnakeGame from '../games/SnakeGame'
import TetrisGame from '../games/TetrisGame'
import BreakoutGame from '../games/BreakoutGame'
import Game2048 from '../games/Game2048'
import SpaceShooter from '../games/SpaceShooter'
import styled from 'styled-components'

const PageContainer = styled.div`
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: calc(100vh - 64px);
`

const GameHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
`

const GameTitle = styled.h1`
  margin: 0;
  color: #1890ff;
  font-size: 28px;
`

const GameContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`

const GamePage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state: RootState) => state.auth)
  
  const [game, setGame] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGame = async () => {
      if (!id) {
        message.error('游戏ID无效')
        navigate('/')
        return
      }

      try {
        const gameData = await gameService.getGame(parseInt(id))
        setGame(gameData)
      } catch (error) {
        message.error('获取游戏信息失败')
        navigate('/')
      } finally {
        setLoading(false)
      }
    }

    fetchGame()
  }, [id, navigate])

  const handleGameEnd = async (score: number, playTime: number) => {
    if (user && id) {
      try {
        // @ts-ignore
        await dispatch(submitScore({
          gameId: parseInt(id),
          score,
          playTime
        }))
        message.success('分数已提交！')
      } catch (error) {
        message.error('分数提交失败')
      }
    }
  }

  const renderGame = () => {
    if (!game || !id) return null

    const gameId = parseInt(id)
    
    switch (gameId) {
      case 1:
        return <SnakeGame onGameEnd={handleGameEnd} />
      case 2:
        return <TetrisGame onGameEnd={handleGameEnd} />
      case 3:
        return <BreakoutGame onGameEnd={handleGameEnd} />
      case 4:
        return <Game2048 onGameEnd={handleGameEnd} />
      case 5:
        return <SpaceShooter onGameEnd={handleGameEnd} />
      default:
        return <div>游戏暂未实现</div>
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" />
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <GameHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/')}
          >
            返回首页
          </Button>
          <GameTitle>{game?.name || '游戏'}</GameTitle>
        </div>
      </GameHeader>

      <GameContainer>
        {renderGame()}
      </GameContainer>
    </PageContainer>
  )
}

export default GamePage 