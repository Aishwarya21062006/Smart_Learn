import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getRecommendations } from '../controllers/recommendation.controller.js';

const router = Router();

// GET /api/recommendations - Protected for authenticated students
router.get('/', requireAuth, getRecommendations);

export default router;
