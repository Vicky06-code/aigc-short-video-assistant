import { generateCreationPlan } from '../services/creationService.js';
import {
  clearHistory,
  deleteHistory,
  getHistory,
  getHistoryDetail,
  saveCreation
} from '../services/historyService.js';

export async function generateCreation(req, res, next) {
  try {
    const data = await generateCreationPlan(req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function saveCreationRecord(req, res, next) {
  try {
    const id = await saveCreation(req.user.id, req.body);
    res.json({
      success: true,
      message: '保存成功',
      data: { id }
    });
  } catch (error) {
    next(error);
  }
}

export async function getCreationHistory(req, res, next) {
  try {
    const records = await getHistory(req.user.id);
    res.json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
}

export async function getCreationDetail(req, res, next) {
  try {
    const record = await getHistoryDetail(req.user.id, req.params.id);
    res.json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
}

export async function deleteCreation(req, res, next) {
  try {
    await deleteHistory(req.user.id, req.params.id);
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    next(error);
  }
}

export async function clearCreationHistory(req, res, next) {
  try {
    const count = await clearHistory(req.user.id);
    res.json({
      success: true,
      message: '清空成功',
      data: { count }
    });
  } catch (error) {
    next(error);
  }
}
