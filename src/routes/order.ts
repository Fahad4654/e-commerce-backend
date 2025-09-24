
import { Router } from 'express';
import {
  createOrder,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware';
import { guestMiddleware } from '../middleware/guestMiddleware';

const router = Router();

// POST /api/orders - Create a new order (for all authenticated users and guests)
router.post('/', authMiddleware, guestMiddleware, createOrder);

// All other order routes are protected and for admins only
router.use(authMiddleware, adminMiddleware);

// GET /api/orders - Get all orders (admins only)
router.get('/', getAllOrders);

// PUT /api/orders/:orderId/status - Update order status (admins only)
router.put('/:orderId/status', updateOrderStatus);

export default router;
