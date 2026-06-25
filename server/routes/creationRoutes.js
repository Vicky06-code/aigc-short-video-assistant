import express from 'express';
import {
  clearCreationHistory,
  deleteCreation,
  deleteCreationBatch,
  generateCreation,
  getCreationDetail,
  getCreationHistory,
  saveCreationRecord
} from '../controllers/creationController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/generate', generateCreation);
router.post('/save', saveCreationRecord);
router.get('/history', getCreationHistory);
router.get('/detail/:id', getCreationDetail);
router.delete('/all', clearCreationHistory);
router.delete('/batch', deleteCreationBatch);
router.delete('/:id', deleteCreation);

export default router;
