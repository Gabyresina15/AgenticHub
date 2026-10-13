import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  tag: { type: String, default: 'Actualización' },
  summary: { type: String, default: '' },
  body: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('Post', postSchema);
