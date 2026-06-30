import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';
import * as adminUserController from '../controllers/adminUserController.js';

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get('/', adminUserController.listUsers);
router.patch('/:id/disable', adminUserController.disableUser);
router.get('/:id', adminUserController.getUser);

export default router;
