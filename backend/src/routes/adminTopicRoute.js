import express from 'express';

import { updateTopicImage } from '../controllers/blogController.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware, adminMiddleware);
router.put('/:topicId/image', updateTopicImage);

export default router;
