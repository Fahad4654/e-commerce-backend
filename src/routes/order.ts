
// src/routes/order.ts

import { Router } from 'express';
import {
  createOrder,
  getAllOrders,
  updateOrderStatus,
  getUserOrders,
} from '../controllers/orderController';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware';
import { guestMiddleware } from '../middleware/guestMiddleware';

const router = Router();

// POST /api/orders - Create a new order (for all authenticated users and guests)
router.post('/', authMiddleware, guestMiddleware, createOrder);

// GET /api/orders/my-orders - Get all orders for the authenticated user
router.get('/my-orders', authMiddleware, getUserOrders);

// --- Admin Only Routes ---

// GET /api/orders - Get all orders
router.get('/', authMiddleware, adminMiddleware, getAllOrders);

// PUT /api/orders/:orderId/status - Update order status
router.put('/:orderId/status', authMiddleware, adminMiddleware, updateOrderStatus);

export default router;
