
import { Router } from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController';
import { adminMiddleware } from '../middleware/adminMiddleware';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getCategories);
router.post('/', authMiddleware, adminMiddleware, createCategory);
router.put('/:id', authMiddleware, adminMiddleware, updateCategory);
router.delete('/:id', authMiddleware, adminMiddleware, deleteCategory);

export default router;
