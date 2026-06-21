import express from 'express';

import { createContact } from '../controllers/contactController.js';
import optionalAuthMiddleware from '../middlewares/optionalAuthMiddleware.js';

const router = express.Router();

router.post('/', optionalAuthMiddleware, createContact);

export default router;
