import express from 'express';
import * as productController from '../controllers/productController.js';

const router = express.Router();

router.get('/', productController.getAllProducts);
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProduct);
router.get('/boxes', productController.getBoxes);
router.get('/boxes/:id', productController.getBox);

export default router;
