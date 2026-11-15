import asyncHandler from '../utils/asyncHandler.js';

/**
 * Controller to fetch the authenticated user's current profile.
 * GET /api/me
 */
export const getMyProfile = asyncHandler(async (req, res) => {
  // req.user is populated by requireAuth middleware
  res.json({
    id: req.user.id,
    name: req.user.name,
    role: req.user.role,
    email: req.user.email
  });
});
