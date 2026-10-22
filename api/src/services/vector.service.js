// Motor de Base de Datos Vectorial en Memoria (6 dimensiones semánticas)
const DIMENSIONES_LEXICAS = [
  ["finetuning", "fine-tuning", "ajuste", "entrenar", "pesos", "tono", "jerga", "modelo", "sft", "alpaca", "llama"],
  ["post-entrenamiento", "rlhf", "dpo", "alineacion", "razonamiento", "eficiencia", "lora", "peft", "transfer", "few-shot", "instruction"],
  ["rag", "retrieval", "recuperacion", "generacion", "contexto", "tiempo", "real", "alucinaciones", "prompt", "libro"],
  ["vector", "vectorial", "database", "embeddings", "semantica", "search", "pinecone", "qdrant", "coseno"],
  ["reranker", "rerankers", "reranked", "precision", "ruido", "redundancia", "calidad", "correct", "ambiguous", "incorrect", "decompose"],
  ["campuslands", "camper", "viernes", "deploy", "politica", "soporte", "ventas"],
];

export function generarEmbedding(texto) {
  const limpio = String(texto ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const vector = DIMENSIONES_LEXICAS.map((terminos) => {
    let score = 0.05;
    for (const t of terminos) {
      if (limpio.includes(t)) score += 0.35;
    }
    return Number(score.toFixed(4));
  });

  const norma = Math.sqrt(vector.reduce((acc, v) => acc + v * v, 0)) || 1;
  return vector.map((v) => Number((v / norma).toFixed(4)));
}

export function similitudCoseno(vecA, vecB) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB) || 1;
  return Number((dot / denom).toFixed(4));
}

const DOCUMENTOS_SEMILLA = [
  {
    id: "doc-01",
    titulo: "Elementos del Fine-Tuning (Diapositivas 2 a 4)",
    categoria: "fine-tuning",
    contenido:
      "El fine-tuning toma un modelo preentrenado a gran escala y lo entrena nuevamente con datos de ajuste fino (conversaciones reales entre usuarios y agentes humanos) para convertirlo en experto de un área (ventas, soporte técnico), ajustando su tono, políticas internas y jerga de la organización.",
  },
  {
    id: "doc-02",
    titulo: "Pre-Entrenamiento vs Fine-Tuning y Post-Entrenamiento (Diapositivas 5 y 6)",
    categoria: "post-training",
    contenido:
      "El pre-entrenamiento usa datos masivos no etiquetados (CommonCrawl, arXiv, Wikipedia) para crear un modelo base como LLaMA con alto costo computacional. El post-entrenamiento incluye Supervised Fine-Tuning (SFT), Alineación (RLHF, DPO), Mejora del Razonamiento y Optimización de Eficiencia (PEFT/LoRA, Destilación).",
  },
  {
    id: "doc-03",
    titulo: "Tipos de Refinamiento (Diapositiva 7)",
    categoria: "refinamiento",
    contenido:
      "Los 5 tipos de refinamiento son: Transfer Learning (Aprendizaje por Transferencia), Supervised Fine-tuning (SFT), Few-shot Fine-tuning (con pocos ejemplos), Instruction Fine-tuning (por instrucciones) y Domain-Specific Fine-tuning (adaptación de dominio).",
  },
  {
    id: "doc-04",
    titulo: "Arquitectura RAG en 4 Etapas (Diapositivas 8 y 9)",
    categoria: "rag",
    contenido:
      "Retrieval-Augmented Generation (RAG) combina métodos basados en recuperación (retrieval-based) y modelos generativos. Su arquitectura opera en 4 pasos: 1) Question del cliente al Framework, 2) Semantic Search en la Vector Database para obtener Contextual Data, 3) Envío del Prompt enriquecido al LLM, y 4) Post Processing de la Response hacia el cliente.",
  },
  {
    id: "doc-05",
    titulo: "Función Estratégica de los Rerankers en RAG (Diapositiva 10)",
    categoria: "reranker",
    contenido:
      "Dentro del flujo RAG, los rerankers cumplen tres funciones clave: 1) Mejoran la Precisión en la Recuperación de Información, 2) Elevan la Calidad de la Generación del LLM, y 3) Reducen el Ruido y la Redundancia. El Retrieval Evaluator clasifica en Correct, Ambiguous o Incorrect y aplica Decompose, Filter y Recompose.",
  },
  {
    id: "doc-06",
    titulo: "Fragmento Redundante con Ruido General (Ruido de Prueba)",
    categoria: "ruido",
    contenido:
      "Nota borrador sin verificar: los sistemas informáticos procesan información general en servidores varios y a veces usan bases de datos antiguas sin relevancia directa para la pregunta actual.",
  },
].map((doc) => ({ ...doc, vector: generarEmbedding(`${doc.titulo} ${doc.contenido}`) }));

export const vectorService = {
  listarDocumentos() {
    return DOCUMENTOS_SEMILLA;
  },

  indexarDocumento(dto) {
    const nuevo = {
      id: `doc-0${DOCUMENTOS_SEMILLA.length + 1}`,
      titulo: dto.titulo,
      categoria: dto.categoria,
      contenido: dto.contenido,
      vector: generarEmbedding(`${dto.titulo} ${dto.contenido}`),
    };
    DOCUMENTOS_SEMILLA.unshift(nuevo);
    return nuevo;
  },

  buscarSemantico(pregunta, topK = 4) {
    const queryVector = generarEmbedding(pregunta);
    const resultados = DOCUMENTOS_SEMILLA.map((doc) => ({
      ...doc,
      vectorScore: similitudCoseno(queryVector, doc.vector),
    }))
      .sort((a, b) => b.vectorScore - a.vectorScore)
      .slice(0, topK + 1);

    return { queryVector, resultados };
  },
};
