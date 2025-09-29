
// src/controllers/userController.ts

import { Request, Response } from 'express';
import prisma from '../db/prisma';

// Define the fields that are safe to be publicly exposed
const userPublicFields = {
  id: true,
  name: true,
  email: true,
  phone: true,
  address: true,
  role: true,
  refreshToken: true,
  createdAt: true,
  updatedAt: true,
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
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
      select: userPublicFields,
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

// @desc    Get a single user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: userPublicFields,
    });

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// @desc    Update a user
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, role, phone, address } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        name,
        email,
        role,
        phone,
        address,
      },
      select: userPublicFields,
    });

    res.json(updatedUser);
  } catch (error) {
    // @ts-ignore
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    // @ts-ignore
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Email or phone number is already in use.' });
    }
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({
      where: { id: parseInt(id) },
    });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
};
