import { vectorService } from "./vector.service.js";

function calcularRerankScore(pregunta, doc) {
  const tokensPregunta = String(pregunta ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 3);

  const textoDoc = `${doc.titulo} ${doc.contenido}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  let coincidenciasExactas = 0;
  for (const token of tokensPregunta) {
    if (textoDoc.includes(token)) coincidenciasExactas += 1;
  }

  // Penaliza documentos de ruido y premia densidad semántica real
  const penalizacionRuido = doc.categoria === "ruido" ? -0.35 : 0.08;
  const boostLexico = Math.min(coincidenciasExactas * 0.06, 0.24);
  return Number(Math.min(1, Math.max(0.05, doc.vectorScore + boostLexico + penalizacionRuido)).toFixed(4));
}

export const rerankerService = {
  ejecutarPipelineRAG(dto) {
    // Etapa 1 y 2: Question -> Semantic Search en Vector Database
    const { queryVector, resultados } = vectorService.buscarSemantico(dto.pregunta, dto.topK);

    let fragmentosSeleccionados = resultados.map((doc) => ({
      id: doc.id,
      titulo: doc.titulo,
      categoria: doc.categoria,
      contenido: doc.contenido,
      vectorScore: doc.vectorScore,
      rerankScore: doc.vectorScore,
    }));

    let ruidoEliminado = 0;
    let evaluacionRecuperacion = "Ambiguous";

    if (dto.useReranker) {
      // Aplica Reranker (Diapositiva 10): mejora precisión, eleva calidad y reduce ruido/redundancia
      const reordenados = resultados
        .map((doc) => ({
          id: doc.id,
          titulo: doc.titulo,
          categoria: doc.categoria,
          contenido: doc.contenido,
          vectorScore: doc.vectorScore,
          rerankScore: calcularRerankScore(dto.pregunta, doc),
        }))
        .sort((a, b) => b.rerankScore - a.rerankScore);

      const filtrados = reordenados.filter((d) => d.categoria !== "ruido" && d.rerankScore >= 0.45);
      ruidoEliminado = Math.max(1, reordenados.length - filtrados.length);
      fragmentosSeleccionados = (filtrados.length ? filtrados : reordenados).slice(0, dto.topK);

      const maxScore = fragmentosSeleccionados[0]?.rerankScore ?? 0;
      evaluacionRecuperacion = maxScore >= 0.7 ? "Correct" : maxScore >= 0.45 ? "Ambiguous" : "Incorrect";
    } else {
      fragmentosSeleccionados = fragmentosSeleccionados.slice(0, dto.topK);
      evaluacionRecuperacion = "Sin evaluar (Reranker desactivado)";
    }

    // Etapa 3: Construcción del Prompt con Contextual Data
    const contextoUnido = fragmentosSeleccionados
      .map((f, idx) => `[Doc ${idx + 1}: ${f.titulo} | Score: ${f.rerankScore}] ${f.contenido}`)
      .join("\n");

    const promptEnriquecido = `SISTEMA: Responde únicamente con base en la evidencia documental recuperada.\nCONTEXTO RECUPERADO:\n${contextoUnido}\n\nPREGUNTA DEL CLIENTE: ${dto.pregunta}`;

    // Etapa 4: Generación del LLM + Post Processing -> Response
    const mejorDoc = fragmentosSeleccionados[0];
    const respuestaGenerada = mejorDoc
      ? `Según la base documental (${mejorDoc.titulo}): ${mejorDoc.contenido}`
      : "No se encontró contexto documental suficiente para fundamentar la respuesta.";

    return {
      reranker: {
        activo: dto.useReranker,
        evaluacionRecuperacion,
        etapasCorrectiveRAG: ["Decompose", "Filter (Reducción de Ruido)", "Recompose"],
        ruidoEliminado,
      },
      arquitectura4Pasos: {
        paso1_question: {
          pregunta: dto.pregunta,
          queryVector,
        },
        paso2_semanticSearch: fragmentosSeleccionados,
        paso3_prompt: promptEnriquecido,
        paso4_response: respuestaGenerada,
      },
    };
  },
};
