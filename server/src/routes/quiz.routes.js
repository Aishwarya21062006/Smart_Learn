import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  getQuizForTopic,
  submitQuizForTopic,
  submitQuizSchema
} from '../controllers/quiz.controller.js';

const router = Router({ mergeParams: true });

// Student accessible routes
router.get('/:id/quiz', requireAuth, getQuizForTopic);
router.post('/:id/quiz/submit', requireAuth, validate(submitQuizSchema), submitQuizForTopic);

export default router;
