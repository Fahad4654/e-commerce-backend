
// src/routes/order.ts

import { Router } from 'express';
import {
  createOrder,
  getAllOrders,
  updateOrderStatus,
  getUserOrders,
} from '../controllers/orderController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';
import { guestMiddleware } from '../middleware/guestMiddleware';

const router = Router();

// --- Admin Only Routes ---
// GET /api/orders - Get all orders
router.get('/', authMiddleware, adminMiddleware, getAllOrders);
// PUT /api/orders/:orderId/status - Update order status
router.put('/:orderId/status', authMiddleware, adminMiddleware, updateOrderStatus);

// --- Authenticated User Routes ---
// GET /api/orders/my-orders - Get all orders for the authenticated user
router.get('/my-orders', authMiddleware, getUserOrders);

// --- Guest or Authenticated User Routes ---
// POST /api/orders - Create a new order
router.post('/', authMiddleware, guestMiddleware, createOrder);


export default router;
