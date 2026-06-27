import express from 'express';
import { getHotTopics } from '../controllers/hotTopicController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getHotTopics);

export default router;
