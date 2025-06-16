import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Button, Input, Select, Spin, message, Tag } from 'antd'
import { PlayCircleOutlined, SearchOutlined, StarFilled } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { fetchGames } from '../store/gameSlice'
import styled from 'styled-components'

const { Search } = Input
const { Option } = Select

const PageContainer = styled.div`
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: calc(100vh - 64px);
`

const HeroSection = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  margin-bottom: 40px;
  color: white;
`

const HeroTitle = styled.h1`
  font-size: 3rem;
  margin-bottom: 16px;
  color: white;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 32px;
  opacity: 0.9;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`

const FilterSection = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`

const GameCard = styled(Card)`
  height: 100%;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
  
  .ant-card-cover img {
    height: 200px;
    object-fit: cover;
  }
  
  .ant-card-body {
    padding: 16px;
  }
`

const GameMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
`

const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { games, isLoading } = useSelector((state: RootState) => state.game)
  const { user } = useSelector((state: RootState) => state.auth)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    // @ts-ignore
    dispatch(fetchGames({ page: 1, limit: 20 }))
  }, [dispatch])

  const handleGameClick = (gameId: number, isPremium: boolean) => {
    // 如果是游客模式，只能玩前3个游戏
    if (!user) {
      const gameIndex = games.findIndex(game => game.id === gameId)
      if (gameIndex >= 3) {
        message.warning('游客模式只能游玩前3个游戏，请注册登录体验更多游戏')
        navigate('/register')
        return
      }
    }
    
    navigate(`/game/${gameId}`)
  }

  const filteredGames = games.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         game.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // 获取所有分类
  const categories = Array.from(new Set(games.map(game => game.category)))

  return (
    <PageContainer>
      <HeroSection>
        <HeroTitle>欢迎来到小游戏平台</HeroTitle>
        <HeroSubtitle>发现精彩游戏，享受快乐时光</HeroSubtitle>
        {!user && (
          <Button 
            type="primary" 
            size="large"
            onClick={() => navigate('/register')}
            style={{ 
              background: 'rgba(255, 255, 255, 0.2)',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              fontSize: '16px',
              height: '48px',
              padding: '0 32px'
            }}
          >
            立即注册，解锁更多游戏
          </Button>
        )}
      </HeroSection>

      <FilterSection>
        <Search
          placeholder="搜索游戏..."
          allowClear
          size="large"
          prefix={<SearchOutlined />}
          style={{ maxWidth: 400 }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select
          size="large"
          style={{ minWidth: 200 }}
          value={selectedCategory}
          onChange={setSelectedCategory}
        >
          <Option value="all">所有分类</Option>
          {categories.map(category => (
            <Option key={category} value={category}>{category}</Option>
          ))}
        </Select>
      </FilterSection>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[24, 24]}>
          {filteredGames.map((game, index) => (
            <Col xs={24} sm={12} md={8} lg={6} key={game.id}>
              <GameCard
                cover={
                  <img
                    alt={game.name}
                    src={game.image_url || '/game-placeholder.png'}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/game-placeholder.png'
                    }}
                  />
                }
                actions={[
                  <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    onClick={() => handleGameClick(game.id, game.is_premium)}
                    disabled={!user && index >= 3}
                  >
                    {!user && index >= 3 ? '需要登录' : '开始游戏'}
                  </Button>
                ]}
              >
                <Card.Meta
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{game.name}</span>
                      {game.is_premium && <Tag color="gold">会员专享</Tag>}
                      {!user && index >= 3 && <Tag color="red">需登录</Tag>}
                    </div>
                  }
                  description={game.description}
                />
                <GameMeta>
                  <div>
                    <StarFilled style={{ color: '#faad14', marginRight: 4 }} />
                    {Number(game.rating).toFixed(1)}
                  </div>
                  <div style={{ color: '#666' }}>
                    {game.play_count} 次游玩
                  </div>
                </GameMeta>
              </GameCard>
            </Col>
          ))}
        </Row>
      )}

      {filteredGames.length === 0 && !isLoading && (
        <div style={{ textAlign: 'center', padding: '100px 0', color: '#666' }}>
          <p>没有找到相关游戏</p>
        </div>
      )}
    </PageContainer>
  )
}

export default HomePage 