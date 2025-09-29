
// src/controllers/userController.ts

import { Request, Response } from 'express';
import prisma from '../db/prisma';

export const getUsers = async (req: Request, res: Response) => {
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const offset = (pageNum - 1) * limitNum;

  try {
    const users = await prisma.user.findMany({
      skip: offset,
      take: limitNum,
      orderBy: {
        [sortBy as string]: sortOrder as 'asc' | 'desc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const totalUsers = await prisma.user.count();

    res.json({
      users,
      totalPages: Math.ceil(totalUsers / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};
