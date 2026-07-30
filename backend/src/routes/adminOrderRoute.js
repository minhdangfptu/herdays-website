import express from 'express';
import * as orderController from '../controllers/orderController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get('/', orderController.getOrders);
router.get('/stats', orderController.getStats);
router.get('/export', orderController.exportOrders);
router.get('/:id', orderController.getOrder);
router.patch('/:id/created-at', orderController.updateCreatedAt);
router.put('/:id/status', orderController.updateStatus);

export default router;
