import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import agentRoutes from "./routes/agentRoutes.js";
import lessonRoutes from "./routes/lessonRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import courseRoutes from "./routes/courseRoutes.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orchestratorRoutes from "./routes/orchestrator.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
  req.startedAt = Date.now();
  next();
});

connectDB();

app.use("/api/v1", orchestratorRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
