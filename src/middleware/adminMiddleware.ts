
// src/middleware/adminMiddleware.ts

import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.isAdmin) {
    return res.status(403).json({ error: 'Forbidden: Admins only' });
  }
  next();
};
