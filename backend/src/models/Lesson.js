import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    default: null 
  },
  title: { type: String, required: true },
  contentMarkdown: { type: String, required: true },
  order: { type: Number, default: 0 },
  
  lessonType: { type: String, enum: ['teoria', 'quiz', 'reto_codigo'], default: 'teoria' },
  
  quizData: {
    question: { type: String },
    options: [{ type: String }],
    correctAnswerIndex: { type: Number }
  },

  // 👇 Mongoose lee esto directo como un objeto anidado, sin el "type:"
  challenge: {
    title: String,
    description: String,
    language: { type: String, default: "javascript" },
    initialCode: String,
    solutionKey: String,
    tests: [{
      fn: String,
      args: { type: Array, default: undefined },
      stdin: String,
      expected: { type: mongoose.Schema.Types.Mixed }
    }],
    successMessage: String,
    errorMessage: String
  },
  
  status: { type: String, enum: ['draft', 'published'], default: 'draft' }
}, { timestamps: true });

export default mongoose.model('Lesson', lessonSchema);