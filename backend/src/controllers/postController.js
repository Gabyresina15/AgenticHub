import Post from '../models/Post.js';

export const getPosts = async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: posts });
};

export const createPost = async (req, res) => {
  const { title, tag, summary, body } = req.body || {};
  if (!title || !body) return res.status(400).json({ error: 'Título y cuerpo son obligatorios.' });
  const post = await Post.create({ title, tag: tag || 'Actualización', summary: summary || '', body });
  res.status(201).json({ success: true, data: post });
};
