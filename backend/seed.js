import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "./src/config/db.js";
import Topic from "./src/models/Topic.js";
import Message from "./src/models/Message.js";
import { SESSION_SYSTEM_PROMPT } from "./src/prompts/index.js";

dotenv.config();

const topics = [
  {
    name: "Agentes de IA",
    slug: "agentes-ia",
    description: "Arquitecturas autonomas, enrutado y bucles de herramientas.",
  },
  {
    name: "Presupuestos",
    slug: "presupuestos",
    description: "Cotizacion de horas para sistemas con agentes.",
  },
  {
    name: "Contexto",
    slug: "contexto",
    description: "Ventana de historial: system prompt mas los ultimos turnos.",
  },
];

async function seed() {
  await connectDB();
  await Promise.all([Topic.deleteMany({}), Message.deleteMany({})]);
  await Topic.insertMany(topics);
  await Message.create({
    sessionId: "demo-session",
    index: 0,
    role: "system",
    content: SESSION_SYSTEM_PROMPT,
    agent: "orchestrator",
  });
  console.log("Seed listo: topics y historial limpios.");
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error("Seed fallo:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
