import rateLimit from 'express-rate-limit';

/**
 * Global rate limiter: 100 requests per 15 minutes per IP.
 * Protects against brute force and denial of service.
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

export default globalLimiter;
