import express from 'express';

import { createUploadSignature } from '../controllers/uploadController.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware, adminMiddleware);
router.post('/signature', createUploadSignature);

export default router;
