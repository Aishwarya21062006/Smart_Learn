import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getTopicById } from '../controllers/topics.controller.js';
import { getExplainer, getConcepts, submitFeedback } from '../controllers/explainer.controller.js';
import quizRoutes from './quiz.routes.js';

const router = Router();

// Student accessible routes
router.get('/:id', requireAuth, getTopicById);

// Anime Explainer visual novel routes
router.get('/:id/concepts', requireAuth, getConcepts);
router.get('/:id/explainer', requireAuth, getExplainer);
router.post('/:id/explainer/feedback', requireAuth, submitFeedback);

// Quiz routes attached to topics
router.use('/', quizRoutes);

export default router;
