import { generateCreationPlan } from '../services/creationService.js';
import {
  clearHistory,
  deleteHistory,
  deleteHistoryBatch,
  getHistory,
  getHistoryDetail,
  saveCreation
} from '../services/historyService.js';
import { logInfo } from '../utils/logger.js';

export async function generateCreation(req, res, next) {
  try {
    const result = await generateCreationPlan(req.body);
    logInfo('Creation generated', {
      userId: req.user.id,
      mode: result.generationMode,
      platform: req.body.platform,
      duration: req.body.duration
    });
    res.json({
      success: true,
      generationMode: result.generationMode,
      fallbackReason: result.fallbackReason,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
}

export async function saveCreationRecord(req, res, next) {
  try {
    const id = await saveCreation(req.user.id, req.body);
    logInfo('Creation saved', { userId: req.user.id, creationId: id });
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
    logInfo('Creation deleted', { userId: req.user.id, creationId: req.params.id });
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    next(error);
  }
}

export async function deleteCreationBatch(req, res, next) {
  try {
    const count = await deleteHistoryBatch(req.user.id, req.body.ids);
    logInfo('Creation batch deleted', { userId: req.user.id, count });
    res.json({ success: true, message: '批量删除成功', data: { count } });
  } catch (error) {
    next(error);
  }
}

export async function clearCreationHistory(req, res, next) {
  try {
    const count = await clearHistory(req.user.id);
    logInfo('Creation history cleared', { userId: req.user.id, count });
    res.json({
      success: true,
      message: '清空成功',
      data: { count }
    });
  } catch (error) {
    next(error);
  }
}
