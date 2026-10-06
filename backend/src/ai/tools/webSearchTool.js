export const webSearchToolDefinition = {
  function: {
    name: 'buscar_en_internet',
    description: 'Busca información actualizada en internet sobre un tema específico.',
    parameters: {
      type: 'OBJECT',
      properties: {
        query: {
          type: 'STRING',
          description: 'La consulta de búsqueda en formato de texto claro.',
        },
      },
      required: ['query'],
    },
  },
};

export const ejecutarWebSearch = async (args) => {
  console.log(`\n🔍 [Tool Execution] Buscando en internet real: "${args.query}"...`);
  
  try {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) {
      throw new Error("Falta la variable TAVILY_API_KEY en el archivo .env");
    }

    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query: args.query,
        search_depth: "basic",
        include_answer: true,
        max_results: 3
      })
    });

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const contexto = data.results.map(r => `Fuente: ${r.url}\nContenido: ${r.content}`).join('\n\n---\n\n');
      return `Resumen de IA: ${data.answer}\n\nResultados de páginas web:\n${contexto}`;
    }
    
    return "No se encontraron resultados relevantes en internet.";

  } catch (error) {
    console.error("❌ Error en webSearchTool:", error.message);
    return "Ocurrió un error al intentar buscar en internet.";
  }
};