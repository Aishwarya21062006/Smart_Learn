import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { validate } from '../middleware/validate.js';
import {
  subjectSchema,
  topicSchema,
  getAdminSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  getAdminTopics,
  getAdminTopicById,
  createTopic,
  updateTopic,
  deleteTopic,
  reindexTopic,
  getAdminStats,
  uploadPdf,
  questionSchema,
  getTopicQuestions,
  createTopicQuestion,
  updateQuestion,
  deleteQuestion,
  generateTopicQuestions
} from '../controllers/admin.controller.js';

const router = Router();

// Protect all admin routes with authentication and admin role check
router.use(requireAuth, requireAdmin);

// Dashboard counts
router.get('/stats', getAdminStats);

// PDF Upload
router.post('/upload-pdf', uploadPdf);

// Subject CRUD
router.get('/subjects', getAdminSubjects);
router.post('/subjects', validate(subjectSchema), createSubject);
router.put('/subjects/:id', validate(subjectSchema), updateSubject);
router.delete('/subjects/:id', deleteSubject);

// Topic CRUD & Reindex
router.get('/topics', getAdminTopics);
router.get('/topics/:id', getAdminTopicById);
router.post('/topics', validate(topicSchema), createTopic);
router.put('/topics/:id', validate(topicSchema), updateTopic);
router.delete('/topics/:id', deleteTopic);
router.post('/topics/:id/reindex', reindexTopic);

// Question CRUD
router.get('/topics/:id/questions', getTopicQuestions);
router.post('/topics/:id/questions', validate(questionSchema), createTopicQuestion);
router.post('/topics/:id/generate-questions', generateTopicQuestions);
router.put('/questions/:id', validate(questionSchema), updateQuestion);
router.delete('/questions/:id', deleteQuestion);

export default router;
