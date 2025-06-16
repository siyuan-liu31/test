import React, { useEffect } from 'react'
import { Card, Avatar, Statistic, Row, Col, Table, Tag, Button } from 'antd'
import { UserOutlined, TrophyOutlined, ClockCircleOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

const PageContainer = styled.div`
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: calc(100vh - 64px);
`

const ProfileHeader = styled(Card)`
  margin-bottom: 24px;
  border-radius: 12px;
  
  .profile-content {
    display: flex;
    align-items: center;
    gap: 24px;
    
    @media (max-width: 768px) {
      flex-direction: column;
      text-align: center;
    }
  }
  
  .user-info {
    flex: 1;
    
    h2 {
      margin: 0 0 8px 0;
      color: #1890ff;
    }
    
    .user-meta {
      color: #666;
      margin-bottom: 16px;
    }
  }
`

const StatsSection = styled.div`
  margin-bottom: 24px;
`

const GameHistoryCard = styled(Card)`
  border-radius: 12px;
`

const ProfilePage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const { scores } = useSelector((state: RootState) => state.game)

  // 模拟游戏历史数据
  const gameHistory = [
    {
      key: '1',
      game: '贪吃蛇',
      score: 1250,
      playTime: '03:45',
      date: '2024-12-25 14:30',
      rank: 'A',
    },
    {
      key: '2',
      game: '贪吃蛇',
      score: 980,
      playTime: '02:15',
      date: '2024-12-25 13:20',
      rank: 'B',
    },
    {
      key: '3',
      game: '贪吃蛇',
      score: 750,
      playTime: '01:50',
      date: '2024-12-24 20:15',
      rank: 'B',
    },
  ]

  const columns = [
    {
      title: '游戏',
      dataIndex: 'game',
      key: 'game',
      render: (text: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <PlayCircleOutlined />
          {text}
        </div>
      ),
    },
    {
      title: '得分',
      dataIndex: 'score',
      key: 'score',
      render: (score: number) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
          {score.toLocaleString()}
        </span>
      ),
      sorter: (a: any, b: any) => b.score - a.score,
    },
    {
      title: '游戏时长',
      dataIndex: 'playTime',
      key: 'playTime',
    },
    {
      title: '评级',
      dataIndex: 'rank',
      key: 'rank',
      render: (rank: string) => {
        const color = rank === 'S' ? 'gold' : rank === 'A' ? 'green' : rank === 'B' ? 'blue' : 'default'
        return <Tag color={color}>{rank}</Tag>
      },
    },
    {
      title: '游戏时间',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Button type="link" onClick={() => navigate('/game/1')}>
          再玩一次
        </Button>
      ),
    },
  ]

  // 计算统计数据
  const totalGames = gameHistory.length
  const bestScore = Math.max(...gameHistory.map(record => record.score))
  const totalPlayTime = gameHistory.reduce((total, record) => {
    const [minutes, seconds] = record.playTime.split(':').map(Number)
    return total + minutes * 60 + seconds
  }, 0)

  const formatTotalTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}小时${minutes}分钟`
    }
    return `${minutes}分钟`
  }

  if (!user) {
    return null
  }

  return (
    <PageContainer>
      <ProfileHeader title="个人资料">
        <div className="profile-content">
          <Avatar
            size={80}
            icon={<UserOutlined />}
            src={user.avatar_url}
          />
          <div className="user-info">
            <h2>{user.username}</h2>
            <div className="user-meta">
              <p>邮箱：{user.email}</p>
              <p>注册时间：{new Date(user.created_at).toLocaleDateString()}</p>
              <p>
                账号状态：
                {user.is_verified ? (
                  <Tag color="green">已验证</Tag>
                ) : (
                  <Tag color="orange">未验证</Tag>
                )}
              </p>
            </div>
            <Button type="primary">编辑资料</Button>
          </div>
        </div>
      </ProfileHeader>

      <StatsSection>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="总游戏次数"
                value={totalGames}
                prefix={<PlayCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="最高得分"
                value={bestScore}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="总游戏时长"
                value={formatTotalTime(totalPlayTime)}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>
      </StatsSection>

      <GameHistoryCard
        title="游戏历史"
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            去游戏
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={gameHistory}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
          }}
          scroll={{ x: 800 }}
        />
      </GameHistoryCard>
    </PageContainer>
  )
}

export default ProfilePage 