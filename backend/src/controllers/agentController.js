import Lesson from '../models/Lesson.js';
import { correrAgenteCurador } from '../ai/agents/curatorAgent.js';

export const investigarTema = async (req, res) => {
  try {
    const { topic } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Falta el campo "topic" en el cuerpo de la petición' });
    }

    console.log(`\n🚀 [API] Petición recibida para investigar: ${topic}`);

    // 1. Ejecutamos el agente curador para que trabaje con la IA
    const rawResult = await correrAgenteCurador(topic);

    // 2. Limpieza y Parseo seguro del JSON que devuelve el agente
    let parsedAI;
    if (typeof rawResult === 'string') {
      const cleanJsonString = rawResult.replace(/^```json\n?/i, '').replace(/\n?```$/i, '').trim();
      parsedAI = JSON.parse(cleanJsonString);
      console.log("🕵️‍♂️ DATOS DEL RETO ENVIADOS POR GEMINI:", parsedAI.challenge);
    } else {
      parsedAI = rawResult;
    }

    /// 3. Guardado en la Base de Datos con el esquema interactivo de la academia
    console.log("🕵️‍♂️ DATOS DEL RETO ENVIADOS POR GEMINI:", parsedAI.challenge);

    // Creamos la nueva lección
    const newLesson = new Lesson({
      title: parsedAI.title || `Lección sobre ${topic}`,
      contentMarkdown: (parsedAI.contentMarkdown || contenidoTexto).split('🧠')[0].trim(),
      lessonType: 'reto_codigo', // Forzamos siempre que sea un reto
      quizData: parsedAI.quizData || null,
      // Si la IA no manda challenge, le inyectamos uno nosotros para probar
      challenge: parsedAI.challenge || {
        title: "Reto de Respaldo: Fetch Básico",
        description: "Escribe una función que haga un GET a una API falsa.",
        initialCode: "function getData() {\n  // Tu código aquí\n}",
        solutionKey: "fetch(",
        successMessage: "¡Excelente! Has usado fetch correctamente.",
        errorMessage: "Recuerda usar la función fetch()."
      },
      status: 'draft'
    });

    await newLesson.save();
    
    console.log('✅ Lección interactiva creada y guardada como borrador.');
    res.status(201).json({ success: true, data: newLesson });

  } catch (error) {
    console.error('❌ Error al generar lección estructurada:', error);
    res.status(500).json({ error: 'Error en el servidor o IA saturada' });
  }
};