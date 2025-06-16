import axios from 'axios'
import Cookies from 'js-cookie'
import { ApiResponse } from '../types'

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 30000, // 增加超时时间到30秒
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token过期，清除本地存储
      Cookies.remove('token')
      window.location.href = '/login'
    }
    
    const message = 
      error.response?.data?.message || 
      error.response?.data?.error || 
      error.message || 
      '网络请求失败'
    
    return Promise.reject(new Error(message))
  }
)

export default api 