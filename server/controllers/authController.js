import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      throw createHttpError(400, '用户名、邮箱和密码不能为空');
    }
    if (password.length < 6) {
      throw createHttpError(400, '密码至少 6 位');
    }

    const existedUsername = await User.findByUsername(username);
    if (existedUsername) {
      throw createHttpError(409, '用户名已存在');
    }

    const existedEmail = await User.findByEmail(email);
    if (existedEmail) {
      throw createHttpError(409, '邮箱已被注册');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = await User.create({ username, email, passwordHash });

    res.json({
      success: true,
      message: '注册成功',
      user: { id, username, email }
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw createHttpError(400, '邮箱和密码不能为空');
    }

    const user = await User.findByEmail(email);
    if (!user) {
      throw createHttpError(401, '邮箱或密码错误');
    }

    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      throw createHttpError(401, '邮箱或密码错误');
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function profile(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      throw createHttpError(404, '用户不存在');
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
}
