import express from 'express';
import { login, register } from '../controllers/authController.js';

const router = express.Router();

// 用户注册：创建新用户，密码会在控制器中加密后保存。
router.post('/register', register);

// 用户登录：校验用户名和密码，成功后返回 JWT。
router.post('/login', login);

export default router;
