// 用户相关类型
export interface User {
  id: number;
  username: string;
  email: string;
  avatar_url?: string;
  is_verified: boolean;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// 游戏相关类型
export interface Game {
  id: number;
  name: string;
  description: string;
  image_url: string;
  category: string;
  is_premium: boolean;
  play_count: number;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface GameScore {
  id: number;
  user_id?: number;
  game_id: number;
  score: number;
  play_time: number;
  created_at: string;
}

export interface GameListResponse {
  games: Game[];
  total: number;
  page: number;
  limit: number;
}

// API相关类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Redux状态类型
export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface GameState {
  games: Game[];
  currentGame: Game | null;
  scores: GameScore[];
  isLoading: boolean;
  error: string | null;
}

export interface RootState {
  auth: AuthState;
  game: GameState;
} 