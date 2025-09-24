
// src/routes/auth.ts

import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, refreshToken, logout } from '../controllers/authController';

const router = Router();

router.post(
  '/signup',
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('phone').notEmpty().withMessage('Phone number is required'),
  register
);

router.post('/login', login);

router.post('/refresh-token', refreshToken);

router.post('/logout', logout);

export default router;
