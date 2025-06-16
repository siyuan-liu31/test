import { Request, Response, NextFunction } from 'express';
export interface CustomError extends Error {
    statusCode?: number;
    status?: string;
    isOperational?: boolean;
    code?: any;
}
export declare class AppError extends Error implements CustomError {
    statusCode: number;
    status: string;
    isOperational: boolean;
    constructor(message: string, statusCode: number);
}
export declare const errorHandler: (err: any, req: Request, res: Response, next: NextFunction) => void;
export declare const catchAsync: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
