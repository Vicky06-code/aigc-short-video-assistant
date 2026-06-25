import pool from '../db.js';

function parseResult(record) {
  if (!record) return null;
  const resultValue = record.result_json ?? record.result;
  return {
    ...record,
    result: typeof resultValue === 'string' ? JSON.parse(resultValue) : resultValue
  };
}

async function create({ userId, topic, platform, style, duration, audience, result }) {
  const [dbResult] = await pool.query(
    `INSERT INTO creations
      (user_id, topic, platform, style, duration, audience, result_json)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, topic, platform, style, duration, audience, JSON.stringify(result)]
  );
  return dbResult.insertId;
}

async function findByUserId(userId) {
  const [rows] = await pool.query(
    `SELECT id, topic, platform, style, duration, audience, created_at
     FROM creations
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
}

async function findById(id, userId) {
  const [rows] = await pool.query(
    `SELECT id, topic, platform, style, duration, audience, result_json, created_at
     FROM creations
     WHERE id = ? AND user_id = ?
     LIMIT 1`,
    [id, userId]
  );
  return parseResult(rows[0]);
}

async function remove(id, userId) {
  const [result] = await pool.query('DELETE FROM creations WHERE id = ? AND user_id = ?', [id, userId]);
  return result.affectedRows;
}

export default {
  create,
  findByUserId,
  findById,
  remove
};
