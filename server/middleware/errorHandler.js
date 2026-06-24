export default function errorHandler(err, req, res, next) {
  if (!err.status || err.status >= 500) {
    console.error(err);
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || '服务器内部错误'
  });
}
