
/**
 * Error handling middleware
 */
function errorHandler(err, req, res, next) {
  console.error('[Error]', err);

  const status = err.status || err.statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';
  const message = status >= 500 && isProd ? 'Internal Server Error' : err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    message,
    ...(isProd ? {} : { error: err.message }),
  });
}

/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Route ${req.path} not found`,
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
