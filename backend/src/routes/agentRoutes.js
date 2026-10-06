import express from 'express';
import { investigarTema } from '../controllers/agentController.js';

const router = express.Router();

// Ruta POST: /api/agents/research
router.post('/research', investigarTema);

export default router;