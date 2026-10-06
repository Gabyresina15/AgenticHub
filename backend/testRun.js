import 'dotenv/config';
import { connectDB } from './src/config/db.js';
import { correrAgenteCurador } from './src/ai/agents/curatorAgent.js';
import mongoose from 'mongoose';

async function test() {
  // 1. Conectamos a la base de datos primero
  await connectDB();
  
  // 2. Corremos el agente
  await correrAgenteCurador("¿Por qué se prefieren arquitecturas de bucles frente a agentes autónomos cerrados?");
  
  // 3. Cerramos la conexión para que la consola no se quede colgada
  await mongoose.connection.close();
  console.log("🔌 Conexión cerrada. Script finalizado.");
}

test();