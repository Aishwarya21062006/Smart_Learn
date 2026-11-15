import AppError from '../utils/AppError.js';

/**
 * Validates request data (body, query, or params) against a Zod schema.
 * Formats errors nicely to return a clean single error message.
 *
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {'body' | 'query' | 'params'} source - Property of req to validate (default 'body')
 */
export const validate = (schema, source = 'body') => (req, res, next) => {
  try {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const firstError = result.error.errors[0];
      const message = firstError ? `${firstError.path.join('.')}: ${firstError.message}` : 'Validation error';
      return next(new AppError(message, 400));
    }
    // Replace with parsed/sanitized data
    req[source] = result.data;
    next();
  } catch (err) {
    return next(new AppError(err.message || 'Validation failed', 400));
  }
};

export default validate;
