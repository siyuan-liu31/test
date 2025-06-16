import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { User, LoginRequest, RegisterRequest, AuthResponse, AuthState } from '../types'
import * as authService from '../services/authService'
import Cookies from 'js-cookie'

// 异步登录action
export const login = createAsyncThunk<AuthResponse, LoginRequest>(
  'auth/login',
  async (loginData, { rejectWithValue }) => {
    try {
      const response = await authService.login(loginData)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || '登录失败')
    }
  }
)

// 异步注册action
export const register = createAsyncThunk<AuthResponse, RegisterRequest>(
  'auth/register',
  async (registerData, { rejectWithValue }) => {
    try {
      const response = await authService.register(registerData)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || '注册失败')
    }
  }
)

// 初始状态
const initialState: AuthState = {
  user: null,
  token: Cookies.get('token') || null,
  isLoading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.error = null
      Cookies.remove('token')
    },
    clearError: (state) => {
      state.error = null
    },
    setCredentials: (state, action: PayloadAction<AuthResponse>) => {
      state.user = action.payload.user
      state.token = action.payload.token
      Cookies.set('token', action.payload.token, { expires: 7 })
    },
  },
  extraReducers: (builder) => {
    builder
      // 登录
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        Cookies.set('token', action.payload.token, { expires: 7 })
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // 注册
      .addCase(register.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        Cookies.set('token', action.payload.token, { expires: 7 })
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { logout, clearError, setCredentials } = authSlice.actions
export default authSlice.reducer 