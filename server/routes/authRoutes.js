import express from 'express';
import { login, profile, register } from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// 用户注册：校验用户名和邮箱唯一性，使用 bcrypt 加密密码后保存。
router.post('/register', register);

// 用户登录：使用邮箱和密码登录，成功后返回有效期 7 天的 JWT。
router.post('/login', login);

// 当前用户：需要携带 Authorization: Bearer <token>。
router.get('/profile', authMiddleware, profile);

export default router;
