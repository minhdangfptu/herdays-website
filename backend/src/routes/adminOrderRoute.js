import express from 'express';
import * as orderController from '../controllers/orderController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get('/', orderController.getOrders);
router.get('/stats', orderController.getStats);
router.get('/:id', orderController.getOrder);
router.put('/:id/status', orderController.updateStatus);

export default router;
