
// src/routes/product.ts

import { Router } from 'express';
import { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  bulkUploadProducts
} from '../controllers/productController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';
import { uploadMiddleware } from '../middleware/uploadMiddleware';

const router = Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, uploadMiddleware.array('images', 5), createProduct);
router.put('/:id', authMiddleware, adminMiddleware, uploadMiddleware.array('images', 5), updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, deleteProduct);
router.post('/bulk-upload', authMiddleware, adminMiddleware, uploadMiddleware.single('file'), bulkUploadProducts);

export default router;
