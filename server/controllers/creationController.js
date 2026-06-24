import Creation from '../models/Creation.js';
import { generateVideoPlan } from '../utils/aigcGenerator.js';

export async function generateCreation(req, res, next) {
  try {
    const { topic, platform, style, duration, audience } = req.body;
    if (!topic || !platform || !style || !duration || !audience) {
      return res.status(400).json({ code: 400, message: '请完整填写创作输入信息' });
    }

    const result = generateVideoPlan({ topic, platform, style, duration, audience });
    const id = await Creation.create({
      userId: req.user.id,
      topic,
      platform,
      style,
      duration,
      audience,
      result
    });

    res.json({ code: 0, message: '生成成功', data: { id, result } });
  } catch (error) {
    next(error);
  }
}

export async function getCreations(req, res, next) {
  try {
    const records = await Creation.findByUserId(req.user.id);
    res.json({ code: 0, data: records });
  } catch (error) {
    next(error);
  }
}

export async function getCreationDetail(req, res, next) {
  try {
    const record = await Creation.findById(req.params.id, req.user.id);
    if (!record) {
      return res.status(404).json({ code: 404, message: '记录不存在' });
    }
    res.json({ code: 0, data: record });
  } catch (error) {
    next(error);
  }
}

export async function deleteCreation(req, res, next) {
  try {
    await Creation.remove(req.params.id, req.user.id);
    res.json({ code: 0, message: '删除成功' });
  } catch (error) {
    next(error);
  }
}
