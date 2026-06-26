import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import PasswordReset from '../models/PasswordReset.js';
import User from '../models/User.js';
import { sendPasswordResetCode } from '../utils/emailSender.js';
import { logInfo } from '../utils/logger.js';
import { passwordPolicyMessage, validatePasswordPolicy } from '../utils/passwordPolicy.js';

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
    if (!validatePasswordPolicy(password)) {
      throw createHttpError(400, passwordPolicyMessage);
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
    if (!validatePasswordPolicy(newPassword)) {
      throw createHttpError(400, passwordPolicyMessage);
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

function createVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function requestPasswordReset(req, res, next) {
  try {
    const { email } = req.body;
    if (!email?.trim()) {
      throw createHttpError(400, '邮箱不能为空');
    }
    if (!validateEmail(email.trim())) {
      throw createHttpError(400, '邮箱格式不正确');
    }

    const normalizedEmail = email.trim();
    const user = await User.findByEmail(normalizedEmail);

    if (user) {
      const code = createVerificationCode();
      const codeHash = await bcrypt.hash(code, 10);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await PasswordReset.create({
        userId: user.id,
        email: normalizedEmail,
        codeHash,
        expiresAt
      });

      await sendPasswordResetCode(normalizedEmail, code);
      logInfo('Password reset code requested', { userId: user.id, email: normalizedEmail });
    }

    res.json({
      success: true,
      message: '如果邮箱已注册，验证码将发送到该邮箱'
    });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { email, code, newPassword } = req.body;
    if (!email?.trim() || !code?.trim() || !newPassword) {
      throw createHttpError(400, '邮箱、验证码和新密码不能为空');
    }
    if (!validateEmail(email.trim())) {
      throw createHttpError(400, '邮箱格式不正确');
    }
    if (!/^\d{6}$/.test(code.trim())) {
      throw createHttpError(400, '验证码格式不正确');
    }
    if (!validatePasswordPolicy(newPassword)) {
      throw createHttpError(400, passwordPolicyMessage);
    }

    const normalizedEmail = email.trim();
    const user = await User.findByEmail(normalizedEmail);
    const resetRecord = await PasswordReset.findLatestValid(normalizedEmail);
    if (!user || !resetRecord) {
      throw createHttpError(400, '验证码错误或已过期');
    }

    const matched = await bcrypt.compare(code.trim(), resetRecord.code_hash);
    if (!matched) {
      throw createHttpError(400, '验证码错误或已过期');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await User.updatePassword(user.id, passwordHash);
    await PasswordReset.markUsed(resetRecord.id);
    logInfo('Password reset completed', { userId: user.id, email: normalizedEmail });

    res.json({
      success: true,
      message: '密码重置成功，请重新登录'
    });
  } catch (error) {
    next(error);
  }
}
