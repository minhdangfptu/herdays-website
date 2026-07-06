import express from 'express';

import * as orderController from '../controllers/orderController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', orderController.getMyOrders);
router.post('/', orderController.createOrderFromCart);

export default router;
