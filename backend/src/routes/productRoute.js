import express from 'express';
import * as productController from '../controllers/productController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

// ─── READ ─────────────────────────────────────────────────────────────────────
router.get('/', productController.getAllProducts);
router.get('/products', productController.getProducts);
router.get('/boxes', productController.getBoxes);

// ─── PRODUCT CRUD ──────────────────────────────────────────────────────────────
router.post('/products', productController.createProduct);
router.get('/products/:id', productController.getProduct);
router.put('/products/:id', productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

// ─── BOX CRUD ────────────────────────────────────────────────────────────────
router.post('/boxes', productController.createBox);
router.get('/boxes/:id', productController.getBox);
router.put('/boxes/:id', productController.updateBox);
router.delete('/boxes/:id', productController.deleteBox);

export default router;
