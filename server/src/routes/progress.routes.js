import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getStudentProgress } from '../controllers/progress.controller.js';

const router = Router();

// Student accessible route
router.get('/', requireAuth, getStudentProgress);

export default router;
