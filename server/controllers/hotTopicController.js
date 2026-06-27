import { getDailyHotTopics } from '../services/hotTopicService.js';

export async function getHotTopics(req, res, next) {
  try {
    const data = await getDailyHotTopics();
    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
}
