import pool from '../db.js';

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function parseJson(value, fallback) {
  if (value == null) return fallback;
  if (typeof value === 'string') {
    return JSON.parse(value);
  }
  return value;
}

function normalizeRecord(row) {
  if (!row) return null;

  return {
    id: row.id,
    topic: row.topic,
    platform: row.platform,
    style: row.style,
    duration: Number(row.duration),
    audience: row.audience,
    titles: parseJson(row.titles_json, []),
    speechScript: row.speech_script,
    storyboard: parseJson(row.storyboard_json, []),
    tags: parseJson(row.tags_json, []),
    publishAdvice: parseJson(row.publish_advice_json, {}),
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

export async function saveCreation(userId, payload) {
  const requiredFields = ['topic', 'platform', 'style', 'duration', 'audience'];
  const missingField = requiredFields.find((field) => !payload[field]);
  if (missingField) {
    throw createHttpError(400, '创作输入信息不完整');
  }

  if (!Array.isArray(payload.titles) || !payload.speechScript || !Array.isArray(payload.storyboard)) {
    throw createHttpError(400, '生成结果不完整，无法保存');
  }

  const [result] = await pool.query(
    `INSERT INTO creations
      (user_id, topic, platform, style, duration, audience, titles_json, speech_script, storyboard_json, tags_json, publish_advice_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      payload.topic,
      payload.platform,
      payload.style,
      payload.duration,
      payload.audience,
      JSON.stringify(payload.titles || []),
      payload.speechScript,
      JSON.stringify(payload.storyboard || []),
      JSON.stringify(payload.tags || []),
      JSON.stringify(payload.publishAdvice || {})
    ]
  );

  return result.insertId;
}

export async function getHistory(userId) {
  const [rows] = await pool.query(
    `SELECT id, topic, platform, style, duration, created_at
     FROM creations
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [userId]
  );

  return rows;
}

export async function getHistoryDetail(userId, id) {
  const [rows] = await pool.query(
    `SELECT id, topic, platform, style, duration, audience, titles_json, speech_script,
            storyboard_json, tags_json, publish_advice_json, created_at, updated_at
     FROM creations
     WHERE id = ? AND user_id = ?
     LIMIT 1`,
    [id, userId]
  );

  const record = normalizeRecord(rows[0]);
  if (!record) {
    throw createHttpError(404, '记录不存在');
  }

  return record;
}

export async function deleteHistory(userId, id) {
  const [result] = await pool.query('DELETE FROM creations WHERE id = ? AND user_id = ?', [id, userId]);
  if (result.affectedRows === 0) {
    throw createHttpError(404, '记录不存在或无权删除');
  }

  return true;
}

export async function clearHistory(userId) {
  const [result] = await pool.query('DELETE FROM creations WHERE user_id = ?', [userId]);
  return result.affectedRows;
}
