import { logError } from '../utils/logger.js';

function isDatabaseConnectionError(err) {
  return err?.code === 'ECONNREFUSED' || err?.errors?.some((item) => item.code === 'ECONNREFUSED');
}

export default function errorHandler(err, req, res, next) {
  if (!err.status || err.status >= 500) {
    logError('Request failed', err, {
      method: req.method,
      path: req.originalUrl,
      userId: req.user?.id
    });
  }

  if (isDatabaseConnectionError(err)) {
    return res.status(500).json({
      success: false,
      message: '数据库连接失败，请确认 MySQL 已启动并检查 server/.env 配置'
    });
  }

  return res.status(err.status || 500).json({
    success: false,
    message: err.message || '服务器内部错误'
  });
}
