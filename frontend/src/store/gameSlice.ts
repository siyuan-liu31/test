import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Game, GameScore, GameState, GameListResponse } from '../types'
import * as gameService from '../services/gameService'

// 获取游戏列表
export const fetchGames = createAsyncThunk<GameListResponse, { page?: number; limit?: number }>(
  'game/fetchGames',
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await gameService.getGames({ page, limit })
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || '获取游戏列表失败')
    }
  }
)

// 提交游戏分数
export const submitScore = createAsyncThunk<GameScore, { gameId: number; score: number; playTime: number }>(
  'game/submitScore',
  async ({ gameId, score, playTime }, { rejectWithValue }) => {
    try {
      const response = await gameService.submitScore(gameId, score, playTime)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || '提交分数失败')
    }
  }
)

// 获取游戏排行榜
export const fetchLeaderboard = createAsyncThunk<GameScore[], number>(
  'game/fetchLeaderboard',
  async (gameId, { rejectWithValue }) => {
    try {
      const response = await gameService.getLeaderboard(gameId)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || '获取排行榜失败')
    }
  }
)

const initialState: GameState = {
  games: [],
  currentGame: null,
  scores: [],
  isLoading: false,
  error: null,
}

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setCurrentGame: (state, action: PayloadAction<Game | null>) => {
      state.currentGame = action.payload
    },
    clearGameError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // 获取游戏列表
      .addCase(fetchGames.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchGames.fulfilled, (state, action) => {
        state.isLoading = false
        state.games = action.payload.games
      })
      .addCase(fetchGames.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // 提交分数
      .addCase(submitScore.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(submitScore.fulfilled, (state, action) => {
        state.isLoading = false
        state.scores.push(action.payload)
      })
      .addCase(submitScore.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // 获取排行榜
      .addCase(fetchLeaderboard.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.isLoading = false
        state.scores = action.payload
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { setCurrentGame, clearGameError } = gameSlice.actions
export default gameSlice.reducer 