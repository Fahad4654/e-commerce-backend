
import { Router } from 'express';
import { getCart, addItemToCart, updateCartItem, removeCartItem } from '../controllers/cartController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// All cart routes are protected
router.use(authenticate);

router.get('/', getCart);
router.post('/items', addItemToCart);
router.put('/items/:itemId', updateCartItem);
router.delete('/items/:itemId', removeCartItem);

export default router;
