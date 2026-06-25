import pool from '../db.js';

async function findByUsername(username) {
  const [rows] = await pool.query('SELECT * FROM users WHERE username = ? LIMIT 1', [username]);
  return rows[0] || null;
}

async function findByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.query(
    'SELECT id, username, email, created_at FROM users WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
}

async function create({ username, email, passwordHash }) {
  const [result] = await pool.query(
    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
    [username, email, passwordHash]
  );
  return result.insertId;
}

async function updateUsername(id, username) {
  await pool.query('UPDATE users SET username = ? WHERE id = ?', [username, id]);
  return findById(id);
}

async function updatePassword(id, passwordHash) {
  await pool.query('UPDATE users SET password = ? WHERE id = ?', [passwordHash, id]);
  return true;
}

export default {
  findByUsername,
  findByEmail,
  findById,
  create,
  updateUsername,
  updatePassword
};
