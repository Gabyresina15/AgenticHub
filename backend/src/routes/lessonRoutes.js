import express from 'express';
import { getDrafts, publishLesson, getPublishedLessons, getLessonById, createManualLesson, updateLesson, deleteLesson } from '../controllers/lessonController.js';
import { requireAuth, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET: /api/lessons -> Lista todas las lecciones públicas
router.get('/', getPublishedLessons);

// GET: /api/lessons/drafts -> Lista todos los borradores pendientes
router.get('/drafts', getDrafts);

// PATCH: /api/lessons/:id/publish -> Publica una lección específica por su ID
router.patch('/:id/publish', publishLesson);

// GET: /api/lessons/:id -> Obtiene una lección específica por su ID (PROTEGIDA)
router.get('/:id', requireAuth, getLessonById);

// NUEVA RUTA: La que tu AdminPanel está buscando (POST /api/lessons)
// Podés protegerla con requireAuth y requireAdmin cuando el sistema esté estable
router.post('/', createManualLesson);

router.put('/:id', requireAuth, requireAdmin, updateLesson);
router.delete('/:id', requireAuth, requireAdmin, deleteLesson);

export default router;