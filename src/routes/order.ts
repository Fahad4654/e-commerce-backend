
// src/routes/order.ts

import { Router } from 'express';
import { createOrder } from '../controllers/orderController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// All order routes are protected
router.use(authMiddleware);

// POST /api/orders - Create a new order
router.post('/', createOrder);

export default router;
