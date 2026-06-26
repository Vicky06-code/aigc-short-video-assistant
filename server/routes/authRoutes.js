import express from 'express';
import {
  changePassword,
  login,
  profile,
  register,
  requestPasswordReset,
  resetPassword,
  updateProfile
} from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/password-reset/request', requestPasswordReset);
router.post('/password-reset/confirm', resetPassword);
router.get('/profile', authMiddleware, profile);
router.put('/profile', authMiddleware, updateProfile);
router.put('/password', authMiddleware, changePassword);

export default router;
