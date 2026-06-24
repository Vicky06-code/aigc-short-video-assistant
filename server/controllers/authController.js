import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function register(req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username || !password || password.length < 6) {
      return res.status(400).json({ code: 400, message: '用户名不能为空，密码至少 6 位' });
    }

    const existed = await User.findByUsername(username);
    if (existed) {
      return res.status(409).json({ code: 409, message: '用户名已存在' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ username, passwordHash });
    res.json({ code: 0, message: '注册成功' });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({ code: 401, message: '用户名或密码错误' });
    }

    const matched = await bcrypt.compare(password, user.password_hash);
    if (!matched) {
      return res.status(401).json({ code: 401, message: '用户名或密码错误' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      code: 0,
      message: '登录成功',
      data: { token, user: { id: user.id, username: user.username } }
    });
  } catch (error) {
    next(error);
  }
}
