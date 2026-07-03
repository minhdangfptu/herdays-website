import express from 'express';

import { getContacts, updateContactResponseStatus } from '../controllers/contactController.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware, adminMiddleware);
router.get('/', getContacts);
router.patch('/:id/response-status', updateContactResponseStatus);

export default router;
