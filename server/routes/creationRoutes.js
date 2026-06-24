import express from 'express';
import {
  deleteCreation,
  generateCreation,
  getCreationDetail,
  getCreations
} from '../controllers/creationController.js';
import authMiddleware from '../utils/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

// 生成创作方案：接收主题、平台、风格、时长、受众，使用规则模板模拟 AIGC 并保存。
router.post('/generate', generateCreation);

// 获取当前登录用户的全部历史记录。
router.get('/', getCreations);

// 获取单条创作记录详情。
router.get('/:id', getCreationDetail);

// 删除当前登录用户的一条创作记录。
router.delete('/:id', deleteCreation);

export default router;
