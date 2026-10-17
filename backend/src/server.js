import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import agentRoutes from "./routes/agentRoutes.js";
import lessonRoutes from "./routes/lessonRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import courseRoutes from "./routes/courseRoutes.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import orchestratorRoutes from "./routes/orchestrator.js";

const envPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.env");
dotenv.config({ path: envPath, override: true });
console.log(`Env: ${envPath}`);
console.log(`Modelo del agente: ${process.env.GEMINI_MODEL || "(no definido)"}`);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === "production";
const frontendDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../frontend/dist");

if (isProd) app.set("trust proxy", 1);

app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
  req.startedAt = Date.now();
  next();
});

connectDB();

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/v1", orchestratorRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use(errorHandler);

if (isProd) {
  app.use(express.static(frontendDist));
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api")) return next();
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor escuchando en el puerto ${PORT}${isProd ? " (producción)" : ""}`);
});
