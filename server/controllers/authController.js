import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { logInfo } from '../utils/logger.js';

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;
    if (!username?.trim() || !email?.trim() || !password) {
      throw createHttpError(400, '用户名、邮箱和密码不能为空');
    }
    if (!validateEmail(email)) {
      throw createHttpError(400, '邮箱格式不正确');
    }
    if (password.length < 6) {
      throw createHttpError(400, '密码至少 6 位');
    }

    const existedUsername = await User.findByUsername(username.trim());
    if (existedUsername) {
      throw createHttpError(409, '用户名已存在');
    }

    const existedEmail = await User.findByEmail(email.trim());
    if (existedEmail) {
      throw createHttpError(409, '邮箱已被注册');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = await User.create({ username: username.trim(), email: email.trim(), passwordHash });
    logInfo('User registered', { userId: id, email: email.trim() });

    res.json({
      success: true,
      message: '注册成功',
      user: { id, username: username.trim(), email: email.trim() }
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password) {
      throw createHttpError(400, '邮箱和密码不能为空');
    }

    const user = await User.findByEmail(email.trim());
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
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    logInfo('User logged in', { userId: user.id, email: user.email });
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

export async function updateProfile(req, res, next) {
  try {
    const { username } = req.body;
    if (!username?.trim()) {
      throw createHttpError(400, '用户名不能为空');
    }

    const existed = await User.findByUsername(username.trim());
    if (existed && existed.id !== req.user.id) {
      throw createHttpError(409, '用户名已存在');
    }

    const user = await User.updateUsername(req.user.id, username.trim());
    logInfo('User profile updated', { userId: req.user.id });
    res.json({ success: true, message: '修改成功', data: user });
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req, res, next) {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      throw createHttpError(400, '原密码和新密码不能为空');
    }
    if (newPassword.length < 6) {
      throw createHttpError(400, '新密码至少 6 位');
    }

    const user = await User.findByEmail(req.user.email);
    if (!user) {
      throw createHttpError(404, '用户不存在');
    }

    const matched = await bcrypt.compare(oldPassword, user.password);
    if (!matched) {
      throw createHttpError(400, '原密码错误');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await User.updatePassword(req.user.id, passwordHash);
    logInfo('User password changed', { userId: req.user.id });
    res.json({ success: true, message: '密码修改成功' });
  } catch (error) {
    next(error);
  }
}
