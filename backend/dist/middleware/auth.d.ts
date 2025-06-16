import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const auth: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
