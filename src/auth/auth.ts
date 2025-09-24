// src/auth/auth.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret';

if (JWT_SECRET === 'your_jwt_secret') {
  console.warn('Warning: JWT_SECRET is not set. Using a default value in production is insecure.');
}

if (REFRESH_TOKEN_SECRET === 'your_refresh_token_secret') {
    console.warn('Warning: REFRESH_TOKEN_SECRET is not set. Using a default value in production is insecure.');
}

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePasswords = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateAccessToken = (user: User): string => {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        isAdmin: user.isAdmin 
      }, 
      JWT_SECRET, 
      { 
        expiresIn: '15m' 
      }
    );
  };
  
  export const generateRefreshToken = (user: User): string => {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        isAdmin: user.isAdmin
      }, 
      REFRESH_TOKEN_SECRET, 
      { 
        expiresIn: '7d' 
      }
    );
  };
  
  export const generateTokens = (user: User): { accessToken: string, refreshToken: string } => {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    return { accessToken, refreshToken };
  };

export const verifyToken = (token: string, isRefreshToken = false): { id: number; email: string; isAdmin: boolean } | null => {
    const secret = isRefreshToken ? REFRESH_TOKEN_SECRET : JWT_SECRET;
    try {
      return jwt.verify(token, secret) as { id: number; email: string; isAdmin: boolean };
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  };

// Optional: Add a function to get user from token
export const getUserFromToken = (token: string): Pick<User, 'id' | 'email' | 'isAdmin'> | null => {
  const payload = verifyToken(token);
  if (!payload) return null;
  
  return {
    id: payload.id,
    email: payload.email,
    isAdmin: payload.isAdmin
  };
};
