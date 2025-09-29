
// src/routes/user.ts

import { Router } from 'express';
import { getUsers } from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';

const router = Router();

// Admin routes
router.get('/', authMiddleware, adminMiddleware, getUsers);

export default router;
