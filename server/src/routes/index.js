import { Router } from 'express';
import meRoutes from './me.routes.js';
import subjectsRoutes from './subjects.routes.js';
import topicsRoutes from './topics.routes.js';
import progressRoutes from './progress.routes.js';
import recommendationsRoutes from './recommendations.routes.js';
import tutorRoutes from './tutor.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

// Public health check route
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SmartLearn API',
    time: new Date().toISOString()
  });
});

// Authenticated user profile route
router.use('/me', meRoutes);

// Learning module routes
router.use('/subjects', subjectsRoutes);
router.use('/topics', topicsRoutes);
router.use('/progress', progressRoutes);
router.use('/recommendations', recommendationsRoutes);
router.use('/tutor', tutorRoutes);

// Admin management routes
router.use('/admin', adminRoutes);

export default router;
