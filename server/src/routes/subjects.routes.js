import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getSubjects, getSubjectById } from '../controllers/subjects.controller.js';

const router = Router();

// Student accessible routes (require authentication)
router.get('/', requireAuth, getSubjects);
router.get('/:id', requireAuth, getSubjectById);

export default router;
