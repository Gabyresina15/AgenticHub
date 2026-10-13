import express from 'express';
import { getDrafts, publishLesson, getPublishedLessons, getLessonById, createManualLesson, updateLesson, deleteLesson } from '../controllers/lessonController.js';
import { requireAuth, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET: /api/lessons -> Lista todas las lecciones públicas
router.get('/', getPublishedLessons);

// GET: /api/lessons/drafts -> Lista todos los borradores pendientes
router.get('/drafts', requireAuth, requireAdmin, getDrafts);
router.patch('/:id/publish', requireAuth, requireAdmin, publishLesson);
router.get('/:id', requireAuth, getLessonById);
router.post('/', requireAuth, requireAdmin, createManualLesson);

router.put('/:id', requireAuth, requireAdmin, updateLesson);
router.delete('/:id', requireAuth, requireAdmin, deleteLesson);

export default router;