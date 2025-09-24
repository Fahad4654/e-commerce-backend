
// src/routes/protected.ts

import { Router, Response } from 'express';
import prisma from '../db/prisma'; // Import the shared prisma instance
import { AuthRequest, authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get(
  '/profile',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          address: true,
          phone: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user });
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
