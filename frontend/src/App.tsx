import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from './store'
import { setCredentials } from './store/authSlice'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import GamePage from './pages/GamePage'
import ProfilePage from './pages/ProfilePage'
import Cookies from 'js-cookie'

const { Content } = Layout

function App() {
  const dispatch = useDispatch()
  const { user, token } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    // 检查本地存储的token
    const savedToken = Cookies.get('token')
    if (savedToken && !token) {
      // 这里可以调用验证token的API
      // 暂时简单处理
    }
  }, [])

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Content style={{ padding: 0 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/login" 
            element={user ? <Navigate to="/" replace /> : <LoginPage />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/" replace /> : <RegisterPage />} 
          />
          <Route path="/game/:id" element={<GamePage />} />
          <Route 
            path="/profile" 
            element={user ? <ProfilePage /> : <Navigate to="/login" replace />} 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Content>
    </Layout>
  )
}

export default App 