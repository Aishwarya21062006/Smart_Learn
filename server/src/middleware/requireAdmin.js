import AppError from '../utils/AppError.js';

/**
 * Authorization middleware that ensures the authenticated user possesses the 'admin' role.
 * Must be preceded by requireAuth middleware.
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new AppError('Forbidden: Admin access required', 403));
  }
  next();
};

export default requireAdmin;
