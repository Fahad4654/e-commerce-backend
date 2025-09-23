
// src/middleware/authMiddleware.ts

import { Request as ExpressRequest, Response, NextFunction } from 'express';
import { verifyToken } from '../auth/auth';

export type AuthRequest = ExpressRequest & {
  user?: any;
};

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  req.user = decoded;
  next();
};
