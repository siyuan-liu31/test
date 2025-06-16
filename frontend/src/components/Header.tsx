import React from 'react'
import { Layout, Menu, Button, Avatar, Dropdown, Space } from 'antd'
import { UserOutlined, LoginOutlined, LogoutOutlined, HomeOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { logout } from '../store/authSlice'
import styled from 'styled-components'

const { Header: AntHeader } = Layout

const StyledHeader = styled(AntHeader)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  background: linear-gradient(90deg, #1890ff, #722ed1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`

const Logo = styled.div`
  color: white;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
`

const NavMenu = styled(Menu)`
  background: transparent;
  border-bottom: none;
  
  .ant-menu-item {
    color: rgba(255, 255, 255, 0.85);
    
    &:hover {
      color: white;
    }
    
    &.ant-menu-item-selected {
      color: white;
      background: rgba(255, 255, 255, 0.2);
    }
  }
`

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`

const Header: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { user } = useSelector((state: RootState) => state.auth)

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页',
    },
  ]

  const handleMenuClick = (key: string) => {
    navigate(key)
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
      onClick: () => navigate('/profile'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ]

  return (
    <StyledHeader>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Logo onClick={() => navigate('/')}>
          <PlayCircleOutlined />
          小游戏平台
        </Logo>
        <NavMenu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => handleMenuClick(key)}
          style={{ marginLeft: 32, minWidth: 200 }}
        />
      </div>

      <UserSection>
        {user ? (
          <Space>
            <span style={{ color: 'white' }}>欢迎，{user.username}</span>
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
            >
              <Avatar
                size="small"
                icon={<UserOutlined />}
                src={user.avatar_url}
                style={{ cursor: 'pointer' }}
              />
            </Dropdown>
          </Space>
        ) : (
          <Space>
            <Button
              type="text"
              icon={<LoginOutlined />}
              onClick={() => navigate('/login')}
              style={{ color: 'white' }}
            >
              登录
            </Button>
            <Button
              type="primary"
              onClick={() => navigate('/register')}
              style={{ 
                background: 'rgba(255, 255, 255, 0.2)',
                borderColor: 'rgba(255, 255, 255, 0.3)'
              }}
            >
              注册
            </Button>
          </Space>
        )}
      </UserSection>
    </StyledHeader>
  )
}

export default Header 