import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('Topic', topicSchema);