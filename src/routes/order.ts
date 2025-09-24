
import { Router } from 'express';
import {
  createOrder,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware';

const router = Router();

// All order routes are protected
router.use(authMiddleware);

// POST /api/orders - Create a new order (for all authenticated users)
router.post('/', createOrder);

// GET /api/orders - Get all orders (admins only)
router.get('/', adminMiddleware, getAllOrders);

// PUT /api/orders/:orderId/status - Update order status (admins only)
router.put('/:orderId/status', adminMiddleware, updateOrderStatus);

export default router;
