import api from './api'
import { User, LoginCredentials, RegisterCredentials } from '../types'

// 用户登录
export const login = async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
  const response = await api.post('/auth/login', credentials) as any
  return response as { user: User; token: string }
}

// 用户注册
export const register = async (credentials: RegisterCredentials): Promise<{ message: string }> => {
  const response = await api.post('/auth/register', credentials) as any
  return response as { message: string }
}

// 获取当前用户信息
export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get('/auth/me') as any
  return response as User
}

// 用户登出
export const logout = async (): Promise<void> => {
  // 前端登出主要是清除本地存储，不需要调用API
  return Promise.resolve()
} 