import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import * as cartController from '../controllers/cartController.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.put('/', cartController.updateCartItem);
router.delete('/:boxId', cartController.removeFromCart);
router.delete('/', cartController.clearCart);

export default router;
