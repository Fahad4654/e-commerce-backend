
// src/routes/auth.ts

import { Router } from 'express';
import { body } from 'express-validator';
import { register, login } from '../controllers/authController';

const router = Router();

router.post(
  '/signup',
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  register
);

router.post('/login', body('email').isEmail(), login);

export default router;
