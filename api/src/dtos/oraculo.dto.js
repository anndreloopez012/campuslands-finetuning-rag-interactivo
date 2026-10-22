export class ParFineTuningDTO {
  constructor(data = {}) {
    this.dominio = String(data.dominio ?? "").trim().toLowerCase();
    this.tono = String(data.tono ?? "profesional y pedagógico").trim().toLowerCase();
    this.preguntaUsuario = String(data.preguntaUsuario ?? "").trim();
    this.respuestaAgente = String(data.respuestaAgente ?? "").trim();
    // Descarta cualquier campo no autorizado que intente contaminar el dataset de entrenamiento.
  }
}

export class CrearDocumentoDTO {
  constructor(data = {}) {
    this.titulo = String(data.titulo ?? "").trim();
    this.categoria = String(data.categoria ?? "general").trim().toLowerCase();
    this.contenido = String(data.contenido ?? "").trim();
  }
}

export class ConsultaRAGDTO {
  constructor(data = {}) {
    this.pregunta = String(data.pregunta ?? "").trim();
    const rawK = Number(data.topK ?? 3);
    this.topK = Number.isFinite(rawK) ? Math.min(Math.max(Math.trunc(rawK), 1), 5) : 3;
    this.useReranker = data.useReranker !== undefined ? Boolean(data.useReranker) : true;
  }
}
