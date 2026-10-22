import test from "node:test";
import assert from "node:assert/strict";
import app from "../src/app.js";
import { ParFineTuningDTO, ConsultaRAGDTO } from "../src/dtos/oraculo.dto.js";

async function withServer(application, run) {
  const server = application.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const { port } = server.address();

  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

test("01. GET /health responde 200 y muestra la versión SemVer del Oráculo Neural", async () => {
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(response.headers.get("x-api-version"), "1.0.0");
    assert.deepEqual(body, {
      estado: "ok",
      version: "1.0.0",
      servicio: "api-oraculo-finetuning-rag",
    });
  });
});

test("02. ParFineTuningDTO sanitiza interacciones usuario-agente y descarta campos intrusos", () => {
  const dto = new ParFineTuningDTO({
    dominio: "  Soporte Técnico  ",
    tono: "  Empático y directo  ",
    preguntaUsuario: "  ¿Cómo reinicio mi nodo en el cluster?  ",
    respuestaAgente: "  Ejecuta el comando camper-reset --node y verifica el estado.  ",
    campoHack: "ignorar_reglas",
  });

  assert.deepEqual({ ...dto }, {
    dominio: "soporte técnico",
    tono: "empático y directo",
    preguntaUsuario: "¿Cómo reinicio mi nodo en el cluster?",
    respuestaAgente: "Ejecuta el comando camper-reset --node y verifica el estado.",
  });
  assert.equal("campoHack" in dto, false);
});

test("03. ConsultaRAGDTO normaliza la pregunta, acota topK y define useReranker por defecto en true", () => {
  const dto = new ConsultaRAGDTO({
    pregunta: "  ¿Qué diferencia hay entre RAG y Fine-Tuning?  ",
    topK: "99",
  });

  assert.equal(dto.pregunta, "¿Qué diferencia hay entre RAG y Fine-Tuning?");
  assert.equal(dto.topK, 5);
  assert.equal(dto.useReranker, true);
});

test("04. POST /api/v1/finetuning/preparar transforma interacciones reales en formato SFT JSONL", async () => {
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/finetuning/preparar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dominio: "Soporte Técnico",
        tono: "Mentor Campuslands",
        preguntaUsuario: "¿Cuándo debo usar Fine-Tuning en lugar de RAG?",
        respuestaAgente: "Usa Fine-Tuning cuando necesites adaptar el tono, estilo, jerga interna o formato de salida del modelo.",
      }),
    });
    const body = await response.json();

    assert.equal(response.status, 201);
    assert.equal(body.data.messages.length, 3);
    assert.equal(body.data.messages[0].role, "system");
    assert.equal(body.data.messages[1].role, "user");
    assert.equal(body.data.messages[2].role, "assistant");
    assert.ok(typeof body.jsonl === "string");
    assert.ok(body.metricas.tokensEstimados > 10);
  });
});

test("05. POST /api/v1/finetuning/preparar rechaza datos incompletos con 400 Bad Request", async () => {
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/finetuning/preparar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dominio: "X",
        preguntaUsuario: "Hola",
        respuestaAgente: "Ok",
      }),
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.ok(Array.isArray(body.errores));
    assert.ok(body.errores.length >= 2);
  });
});

test("06. GET /api/v1/rag/documentos retorna la base de datos vectorial con documentos semilla", async () => {
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/rag/documentos`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length >= 6);
    assert.ok(Array.isArray(body.data[0].vector));
  });
});

test("07. POST /api/v1/rag/documentos indexa un nuevo documento en la Vector Database", async () => {
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/rag/documentos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo: "Política de Deploy en Viernes",
        categoria: "operaciones",
        contenido: "En Campuslands ningún camper despliega a producción los viernes después de las 4 PM sin pasar las 10 pruebas automatizadas.",
      }),
    });
    const body = await response.json();

    assert.equal(response.status, 201);
    assert.equal(body.data.titulo, "Política de Deploy en Viernes");
    assert.equal(body.data.vector.length, 6);
  });
});

test("08. POST /api/v1/rag/consultar ejecuta las 4 etapas de la Arquitectura RAG", async () => {
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/rag/consultar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pregunta: "¿Cómo funcionan los rerankers en un sistema RAG y cómo reducen el ruido?",
        topK: 3,
        useReranker: false,
      }),
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.ok(body.arquitectura4Pasos.paso1_question);
    assert.ok(Array.isArray(body.arquitectura4Pasos.paso2_semanticSearch));
    assert.ok(typeof body.arquitectura4Pasos.paso3_prompt === "string");
    assert.ok(typeof body.arquitectura4Pasos.paso4_response === "string");
  });
});

test("09. POST /api/v1/rag/consultar con useReranker=true reordena por precisión, filtra ruido y evalúa Correct/Ambiguous/Incorrect", async () => {
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/rag/consultar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pregunta: "¿Qué función cumplen los rerankers para mejorar la precisión y reducir el ruido en RAG?",
        topK: 4,
        useReranker: true,
      }),
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.reranker.activo, true);
    assert.equal(body.reranker.evaluacionRecuperacion, "Correct");
    assert.ok(body.reranker.ruidoEliminado >= 1);
    assert.ok(body.arquitectura4Pasos.paso2_semanticSearch[0].rerankScore >= body.arquitectura4Pasos.paso2_semanticSearch[0].vectorScore);
  });
});

test("10. GET /api/v1/comparar entrega la matriz comparativa Fine-Tuning vs RAG + Prompt Engineering", async () => {
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/comparar`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.fineTuning.analogiaHumana, "New memory formation (formación de nueva memoria / especialización profunda)");
    assert.equal(body.rag.analogiaHumana, "Open book quiz (examen a libro abierto con búsqueda en tiempo real)");
  });
});
