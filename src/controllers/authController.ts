
// src/controllers/authController.ts

import { Request, Response } from 'express';
import { hashPassword, comparePasswords, generateTokens, verifyToken } from '../auth/auth';
import prisma from '../db/prisma';

export const register = async (req: Request, res: Response) => {
  const { email, password, address, phone } = req.body;

  if (!email || !password || !phone) {
    return res.status(400).json({ message: 'Email, password, and phone number are required' });
  }

  try {
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        address,
        phone,
      },
    });
    res.status(201).json({ message: 'User created successfully', userId: user.id });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
};

export const login = async (req: Request, res: Response) => {
    const { email, phone, password } = req.body;
  
    if ((!email && !phone) || !password) {
      return res.status(400).json({ message: 'Email or phone number, and password are required' });
    }
  
    try {
      const user = email
        ? await prisma.user.findUnique({ where: { email } })
        : await prisma.user.findFirst({ where: { phone } });
  
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      const isMatch = await comparePasswords(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      const { accessToken, refreshToken } = generateTokens(user);
  
      res.cookie('refreshToken', refreshToken, { 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
  
      res.json({ accessToken });
    } catch (error) {
      res.status(500).json({ message: 'Error logging in', error });
    }
  };

export const refreshToken = async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;
  
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token not found' });
    }
  
    const payload = verifyToken(refreshToken, true);
  
    if (!payload) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }
  
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
  
    if (!user) {
      return res.status(403).json({ message: 'User not found' });
    }
  
    const { accessToken } = generateTokens(user);
  
    res.json({ accessToken });
  };
  
  export const logout = (req: Request, res: Response) => {
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Logged out successfully' });
  };
