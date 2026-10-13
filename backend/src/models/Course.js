import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  level: { type: String, enum: ['Básico', 'Intermedio', 'Avanzado'], default: 'Básico' },
  language: { type: String, default: 'general' },
  track: { type: String, default: '' },
  lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }]
}, { timestamps: true });

export default mongoose.model('Course', courseSchema);