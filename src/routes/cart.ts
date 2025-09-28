
import { Router } from 'express';
import { getCart, addItemToCart, updateCartItem, removeCartItem } from '../controllers/cartController';
import { authMiddleware } from '../middleware/authMiddleware';
import { guestMiddleware } from '../middleware/guestMiddleware';

const router = Router();

router.get('/', authMiddleware, guestMiddleware, getCart);
router.post('/items', authMiddleware, guestMiddleware, addItemToCart);
router.put('/items/:itemId', authMiddleware, guestMiddleware, updateCartItem);
router.delete('/items/:itemId', authMiddleware, guestMiddleware, removeCartItem);

export default router;
