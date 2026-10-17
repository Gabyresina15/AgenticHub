import express from 'express';
import { investigarTema } from '../controllers/agentController.js';
import { generateNext } from '../controllers/planController.js';
import { requireAuth, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/research', requireAuth, requireAdmin, investigarTema);
router.post('/plan/next', requireAuth, requireAdmin, generateNext);

export default router;