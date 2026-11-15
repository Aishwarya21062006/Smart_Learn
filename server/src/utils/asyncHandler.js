/**
 * Wraps async Express route handlers and catches any rejected promises,
 * forwarding them to the global error handling middleware via next().
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
