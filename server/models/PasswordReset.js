import pool from '../db.js';

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS password_reset_codes (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      email VARCHAR(120) NOT NULL,
      code_hash VARCHAR(255) NOT NULL,
      expires_at DATETIME NOT NULL,
      used_at DATETIME DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_password_reset_email_created_at (email, created_at),
      CONSTRAINT fk_password_reset_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

async function create({ userId, email, codeHash, expiresAt }) {
  await ensureTable();
  await pool.query('UPDATE password_reset_codes SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL', [userId]);

  const [result] = await pool.query(
    `INSERT INTO password_reset_codes (user_id, email, code_hash, expires_at)
     VALUES (?, ?, ?, ?)`,
    [userId, email, codeHash, expiresAt]
  );

  return result.insertId;
}

async function findLatestValid(email) {
  await ensureTable();
  const [rows] = await pool.query(
    `SELECT *
     FROM password_reset_codes
     WHERE email = ? AND used_at IS NULL AND expires_at > NOW()
     ORDER BY created_at DESC
     LIMIT 1`,
    [email]
  );

  return rows[0] || null;
}

async function markUsed(id) {
  await pool.query('UPDATE password_reset_codes SET used_at = NOW() WHERE id = ?', [id]);
  return true;
}

export default {
  create,
  findLatestValid,
  markUsed
};
