import { logInfo, logWarn } from './logger.js';

function hasSmtpConfig() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export async function sendPasswordResetCode(email, code) {
  if (!hasSmtpConfig()) {
    logWarn('SMTP not configured, password reset code printed for local development', { email, code });
    return { sent: false, devCode: code };
  }

  const nodemailer = await import('nodemailer');
  const transporter = nodemailer.default.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || 'true') === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'AIGC 短视频助手密码重置验证码',
    text: `你的密码重置验证码是：${code}。验证码 10 分钟内有效。如果不是你本人操作，请忽略这封邮件。`,
    html: `
      <div style="font-family:Arial,'Microsoft YaHei',sans-serif;line-height:1.7;color:#1f2937">
        <h2>AIGC 短视频助手密码重置</h2>
        <p>你的验证码是：</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:6px;color:#2563eb">${code}</p>
        <p>验证码 10 分钟内有效。如果不是你本人操作，请忽略这封邮件。</p>
      </div>
    `
  });

  logInfo('Password reset email sent', { email });
  return { sent: true };
}
