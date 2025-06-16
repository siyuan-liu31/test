import { Request } from 'express';
export interface User {
    id: number;
    username: string;
    email: string;
    password_hash: string;
    avatar_url?: string;
    is_verified: boolean;
    created_at: Date;
    updated_at: Date;
}
export interface Game {
    id: number;
    name: string;
    description: string;
    image_url?: string;
    category: string;
    is_premium: boolean;
    play_count: number;
    rating: number;
    created_at: Date;
    updated_at: Date;
}
export interface GameScore {
    id: number;
    user_id?: number;
    game_id: number;
    score: number;
    play_time?: number;
    created_at: Date;
}
export interface AuthenticatedRequest extends Request {
    user?: {
        userId: number;
        username: string;
    };
}
export interface JWTPayload {
    userId: number;
    username: string;
}
