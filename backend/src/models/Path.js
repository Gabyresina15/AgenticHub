import mongoose from 'mongoose';

const pathSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  level: { type: String, default: 'Básico' },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
}, { timestamps: true });

export default mongoose.model('Path', pathSchema);
