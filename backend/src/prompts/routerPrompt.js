export const ROUTER_SYSTEM_PROMPT = `Clasificador. Cero razonamiento. Responde una sola palabra, sin puntuacion.
Tokens validos: curator | commercial | general
curator = leccion, curso, investigacion tecnica, codigo, academia
commercial = cliente, presupuesto, cotizacion, precio, horas
general = cualquier otro pedido
`;

export const ALLOWED_AGENTS = ["curator", "commercial", "general"];
