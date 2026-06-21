import express from 'express';

import authMiddleware from '../middlewares/authMiddleware.js';
import * as profileController from '../controllers/profileController.js';

const router = express.Router();

router.get('/', authMiddleware, profileController.getProfile);
router.put('/', authMiddleware, profileController.updateProfile);

export default router;
