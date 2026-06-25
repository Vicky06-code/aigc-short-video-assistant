import Creation from '../models/Creation.js';
import { generateCreationPlan } from '../services/creationService.js';

export async function generateCreation(req, res, next) {
  try {
    const data = await generateCreationPlan(req.body);

    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
}

export async function generateAndSaveCreation(req, res, next) {
  try {
    const { topic, platform, style, duration, audience } = req.body;
    const result = await generateCreationPlan(req.body);
    const id = await Creation.create({
      userId: req.user.id,
      topic,
      platform,
      style,
      duration,
      audience,
      result
    });

    res.json({
      success: true,
      message: '生成成功',
      data: { id, result }
    });
  } catch (error) {
    next(error);
  }
}

export async function getCreations(req, res, next) {
  try {
    const records = await Creation.findByUserId(req.user.id);
    res.json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
}

export async function getCreationDetail(req, res, next) {
  try {
    const record = await Creation.findById(req.params.id, req.user.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: '记录不存在'
      });
    }

    res.json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
}

export async function deleteCreation(req, res, next) {
  try {
    await Creation.remove(req.params.id, req.user.id);
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    next(error);
  }
}
