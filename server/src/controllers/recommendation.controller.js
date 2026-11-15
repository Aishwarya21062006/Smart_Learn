import asyncHandler from '../utils/asyncHandler.js';
import { getRecommendationsForUser } from '../services/recommendation.service.js';

/**
 * Recommendation Controller
 * Handles adaptive topic recommendation endpoints for authenticated students.
 */

/**
 * GET /api/recommendations
 * Query params:
 *  - limit: number of recommendations to return (default: 4, max: 10)
 */
export const getRecommendations = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const limit = Math.min(10, Math.max(1, parseInt(req.query.limit || '4', 10)));

  const recommendations = await getRecommendationsForUser(userId, limit);

  res.json({
    count: recommendations.length,
    recommendations
  });
});

export default {
  getRecommendations
};
