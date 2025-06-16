import api from './api'
import { Game, GameListResponse, GameScore } from '../types'

// 获取游戏列表
export const getGames = async (params: { 
  page?: number; 
  limit?: number; 
  category?: string; 
  search?: string 
}): Promise<GameListResponse> => {
  const response = await api.get('/games', { params })
  return response
}

// 获取游戏详情
export const getGame = async (id: number): Promise<Game> => {
  const response = await api.get(`/games/${id}`)
  return response
}

// 提交游戏分数
export const submitScore = async (
  gameId: number, 
  score: number, 
  playTime: number
): Promise<GameScore> => {
  const response = await api.post(`/games/${gameId}/scores`, {
    score,
    playTime
  })
  return response
}

// 获取游戏排行榜
export const getLeaderboard = async (
  gameId: number, 
  params?: { limit?: number; timeRange?: string }
): Promise<GameScore[]> => {
  const response = await api.get(`/games/${gameId}/leaderboard`, { params })
  return response
}

// 获取用户游戏历史
export const getUserGameHistory = async (): Promise<GameScore[]> => {
  const response = await api.get('/user/game-history')
  return response
} 