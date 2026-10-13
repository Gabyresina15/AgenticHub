import express from 'express';
import { getPosts, createPost } from '../controllers/postController.js';
import { requireAuth, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getPosts);
router.post('/', requireAuth, requireAdmin, createPost);

export default router;
