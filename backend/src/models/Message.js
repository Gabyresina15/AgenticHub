import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, index: true },
    index: { type: Number, required: true },
    role: { type: String, enum: ["system", "user", "model", "tool"], required: true },
    content: { type: String, required: true },
    agent: { type: String, default: null },
  },
  { timestamps: true }
);

messageSchema.index({ sessionId: 1, index: 1 }, { unique: true });

export default mongoose.model("Message", messageSchema);
