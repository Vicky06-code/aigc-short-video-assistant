function formatMeta(meta = {}) {
  const safeMeta = { ...meta };
  delete safeMeta.password;
  delete safeMeta.confirmPassword;
  return Object.keys(safeMeta).length ? ` ${JSON.stringify(safeMeta)}` : '';
}

export function logInfo(message, meta) {
  console.log(`[INFO] ${new Date().toISOString()} ${message}${formatMeta(meta)}`);
}

export function logWarn(message, meta) {
  console.warn(`[WARN] ${new Date().toISOString()} ${message}${formatMeta(meta)}`);
}

export function logError(message, error, meta) {
  console.error(`[ERROR] ${new Date().toISOString()} ${message}${formatMeta(meta)}`);
  if (error) {
    console.error(error.stack || error.message || error);
  }
}
