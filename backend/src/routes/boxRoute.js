import express from 'express';
import * as boxController from '../controllers/boxController.js';

const router = express.Router();

router.get('/', boxController.listBox);
router.get('/:id', boxController.getBoxDetail);

export default router;
