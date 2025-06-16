import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, JWTPayload } from '../types';

export const auth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: '访问被拒绝，没有令牌' });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as JWTPayload;

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: '令牌无效' });
  }
}; 