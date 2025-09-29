
// src/routes/user.ts

import { Router } from 'express';
import { getUsers, deleteUser } from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';

const router = Router();

// Admin routes
router.get('/', authMiddleware, adminMiddleware, getUsers);
router.delete('/:id', authMiddleware, adminMiddleware, deleteUser);

export default router;
