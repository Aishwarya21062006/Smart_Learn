import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getMyProfile } from '../controllers/me.controller.js';

const router = Router();

// GET /api/me - Retrieve authenticated user's profile and role
router.get('/', requireAuth, getMyProfile);

export default router;
