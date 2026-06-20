import express from 'express';

import * as blogController from '../controllers/blogController.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware, adminMiddleware);
router.get('/', blogController.getAdminPosts);
router.get('/:postId', blogController.getAdminPost);
router.post('/', blogController.createPost);
router.put('/:postId', blogController.updatePost);

export default router;
