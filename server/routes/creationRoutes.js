import express from 'express';
import {
  deleteCreation,
  generateAndSaveCreation,
  generateCreation,
  getCreationDetail,
  getCreations
} from '../controllers/creationController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

// Generate a creation plan with rule templates. This stage does not save history.
router.post('/generate', generateCreation);

// Reserved for the history module: generate and save a creation plan.
router.post('/generate-and-save', generateAndSaveCreation);

router.get('/', getCreations);
router.get('/:id', getCreationDetail);
router.delete('/:id', deleteCreation);

export default router;
