
// src/controllers/authController.ts

import { Request, Response } from 'express';
import { hash, compare } from 'bcryptjs';
import { generateTokens, verifyToken } from '../auth/auth';
import prisma from '../db/prisma';

export const register = async (req: Request, res: Response) => {
  const { email, password, address, phone } = req.body;

  if (!email || !password || !phone) {
    return res.status(400).json({ message: 'Email, password, and phone number are required' });
  }

  try {
    const hashedPassword = await hash(password, 10);
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

    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    // Store the hashed refresh token in the database
    const hashedRefreshToken = await hash(refreshToken, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.json({ accessToken });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken: requestRefreshToken } = req.cookies;

  if (!requestRefreshToken) {
    return res.status(401).json({ message: 'Refresh token not found' });
  }

  const payload = verifyToken(requestRefreshToken, true);

  if (!payload) {
    return res.status(403).json({ message: 'Invalid refresh token' });
  }

  const user = await prisma.user.findUnique({ where: { id: payload.id } });

  if (!user || !user.refreshToken) {
    return res.status(403).json({ message: 'User not found or refresh token revoked' });
  }

  // Compare the received refresh token with the one stored in the database
  const isRefreshTokenMatch = await compare(requestRefreshToken, user.refreshToken);

  if (!isRefreshTokenMatch) {
    return res.status(403).json({ message: 'Invalid refresh token' });
  }

  // Generate new tokens
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

  // Store the new hashed refresh token in the database
  const hashedRefreshToken = await hash(newRefreshToken, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: hashedRefreshToken },
  });

  // Send the new refresh token as a cookie
  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.json({ accessToken });
};

export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  if (refreshToken) {
    const payload = verifyToken(refreshToken, true);

    if (payload) {
      // Clear the refresh token from the database
      await prisma.user.update({
        where: { id: payload.id },
        data: { refreshToken: null },
      });
    }
  }

  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logged out successfully' });
};
