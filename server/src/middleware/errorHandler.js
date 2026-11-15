import logger from '../utils/logger.js';

/**
 * Global Express error handling middleware.
 * Guarantees every API error response conforms strictly to: { "error": "message" }
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (statusCode >= 500) {
    logger.error(`[${req.method}] ${req.originalUrl} - 500 Error:`, err);
  } else {
    logger.warn(`[${req.method}] ${req.originalUrl} - ${statusCode} Notice:`, message);
  }

  res.status(statusCode).json({
    error: message
  });
};

export default errorHandler;
