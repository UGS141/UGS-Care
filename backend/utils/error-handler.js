/**
 * Wrap async route handlers and forward errors to Express error middleware.
 * Usage: exports.register = catchAsync(async (req, res) => { ... });
 */
function catchAsync(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Helper to send a minimal JSON error response.
 */
function handleError(res, err, status = 500) {
  // console.error(err && err.stack ? err.stack : err);
    const message = err && err.message ? err.message : 'Internal Server Error';
    res.status(status).json({ error: message });
}

/**
 * Express error-handling middleware (use in server.js as app.use(errorMiddleware))
 */
function errorMiddleware(err, req, res, next) {
  // console.error(err && err.stack ? err.stack : err);
    const status = err.status || 500;
    res.status(status).json({ error: err.message || 'Internal Server Error' });
}

module.exports = {
  catchAsync,
  handleError,
  errorMiddleware,
};