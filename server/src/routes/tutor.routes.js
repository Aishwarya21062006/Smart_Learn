import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getTutorUsage, chatWithTutor } from '../controllers/tutor.controller.js';

const router = Router();

// GET /api/tutor/usage - Check daily remaining messages
router.get('/usage', requireAuth, getTutorUsage);

// POST /api/tutor/chat - Ask AI tutor with RAG retrieval
router.post('/chat', requireAuth, chatWithTutor);

export default router;
