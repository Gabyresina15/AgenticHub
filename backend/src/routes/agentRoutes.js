import express from 'express';
import { investigarTema } from '../controllers/agentController.js';
import { requireAuth, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/research', requireAuth, requireAdmin, investigarTema);

export default router;