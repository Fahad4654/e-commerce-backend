
import { Router } from 'express';
import { getCart, addItemToCart, updateCartItem, removeCartItem } from '../controllers/cartController';

const router = Router();

router.get('/', getCart);
router.post('/items', addItemToCart);
router.put('/items/:itemId', updateCartItem);
router.delete('/items/:itemId', removeCartItem);

export default router;
