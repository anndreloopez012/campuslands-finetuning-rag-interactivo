const datasetEntrenamiento = [];

export const finetuningService = {
  prepararEjemploSFT(dto) {
    const systemPrompt = `Eres un modelo ajustado mediante Supervised Fine-Tuning (SFT) experto en ${dto.dominio} con tono ${dto.tono}. Aplica políticas internas y terminología oficial de la organización.`;

    const registro = {
      id: `sft-${Date.now()}`,
      dominio: dto.dominio,
      tono: dto.tono,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: dto.preguntaUsuario },
        { role: "assistant", content: dto.respuestaAgente },
      ],
      createdAt: new Date().toISOString(),
    };

    datasetEntrenamiento.unshift(registro);
    const jsonl = JSON.stringify({ messages: registro.messages });
    const palabras = `${systemPrompt} ${dto.preguntaUsuario} ${dto.respuestaAgente}`.split(/\s+/).length;

    return {
      data: registro,
      jsonl,
      metricas: {
        tipoPostEntrenamiento: "Supervised Fine-tuning (SFT)",
        tokensEstimados: Math.round(palabras * 1.35),
        totalEjemplosDataset: datasetEntrenamiento.length,
      },
    };
  },

  obtenerMatrizComparativa() {
    // Tabla comparativa exacta de la Diapositiva 7 (Finetuning vs RAG + Prompt Engineering)
    return {
      fineTuning: {
        casoUsoCanonico: "Incrementar el rendimiento del LLM en tareas específicas, optimizar costos o forzar esquemas de decodificación, tono y jerga.",
        mecanismo: "Cambia el comportamiento del LLM actualizando directamente los pesos de la red neuronal y/o su arquitectura.",
        analogiaHumana: "New memory formation (formación de nueva memoria / especialización profunda)",
        requisitoDatos: "Requiere cientos a decenas de miles de muestras etiquetadas de entrenamiento (interacciones reales usuario-agente).",
        inversionInicial: "Curación de dataset ($ a $$$$$), horas/días de entrenamiento en GPU y tiempo del equipo ML.",
      },
      rag: {
        casoUsoCanonico: "Anclar (grounding) las generaciones del LLM con contexto en tiempo real para reducir alucinaciones y personalizar respuestas con datos frescos.",
        mecanismo: "1) Recuperación de contexto relevante mediante búsqueda vectorial/semántica. 2) Inyección de dicho contexto en el prompt (in-context learning).",
        analogiaHumana: "Open book quiz (examen a libro abierto con búsqueda en tiempo real)",
        requisitoDatos: "Requiere almacenes de datos vectoriales (Vector Databases) y retrievers con capacidad de consulta en tiempo real.",
        inversionInicial: "Instanciar Vector Database ($), construir índices e ingestar embeddings ($-$$$).",
      },
    };
  },
};
