import supabase from '../config/supabase.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

/**
 * Authentication middleware that verifies the Supabase Bearer JWT token.
 * Populates req.user with the user's profile information (id, name, role).
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Authorization token is required', 401));
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next(new AppError('Invalid token format', 401));
    }

    // Verify token with Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return next(new AppError('Invalid or expired authentication token', 401));
    }

    // Retrieve user's profile row to determine their role ('student' or 'admin')
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      // If profile hasn't been created yet by the trigger, fallback gracefully
      logger.warn(`Profile not found for user ${user.id}, using default student profile`);
      req.user = {
        id: user.id,
        name: user.user_metadata?.name || 'Student',
        role: 'student',
        email: user.email
      };
    } else {
      req.user = {
        id: profile.id,
        name: profile.name,
        role: profile.role,
        email: user.email
      };
    }

    next();
  } catch (err) {
    logger.error('Authentication error:', err.message);
    return next(new AppError('Authentication failed', 401));
  }
};

export default requireAuth;
