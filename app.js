const TOTAL_SECONDS = 30 * 60;
const STORAGE_KEY = "campuslands-finetuning-rag-progress";

const timerDisplay = document.querySelector("#timerDisplay");
const timerToggle = document.querySelector("#timerToggle");
const timerReset = document.querySelector("#timerReset");
const timerContainer = document.querySelector(".timer");
const progressBar = document.querySelector("#progressBar");
const progressLabel = document.querySelector("#progressLabel");
const progressMessage = document.querySelector("#progressMessage");
const finishCard = document.querySelector("#finishCard");
const toast = document.querySelector("#toast");

let secondsRemaining = TOTAL_SECONDS;
let timerId = null;
let toastId = null;
let completedSteps = readStorage(STORAGE_KEY, []);

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Continúa sin bloqueo si localStorage está restringido.
  }
}

function showToast(message) {
  window.clearTimeout(toastId);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastId = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

function renderTimer() {
  timerDisplay.textContent = formatTime(secondsRemaining);
  document.title = timerId
    ? `${formatTime(secondsRemaining)} · AI Lab Fine-Tuning & RAG`
    : "AI Lab · Fine-Tuning & RAG (Oráculo Neural)";
}

function pauseTimer() {
  window.clearInterval(timerId);
  timerId = null;
  timerContainer.classList.remove("is-running");
  timerToggle.title = "Continuar cronómetro";
  timerToggle.setAttribute("aria-label", "Continuar cronómetro");
  timerToggle.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7z" /></svg>';
  renderTimer();
}

function startTimer() {
  if (timerId || secondsRemaining <= 0) return;
  timerContainer.classList.add("is-running");
  timerToggle.title = "Pausar cronómetro";
  timerToggle.setAttribute("aria-label", "Pausar cronómetro");
  timerToggle.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14" /></svg>';
  timerId = window.setInterval(() => {
    secondsRemaining -= 1;
    renderTimer();
    if (secondsRemaining === 0) {
      pauseTimer();
      showToast("¡Tiempo! Ejecuta la Boss Fight del Oráculo Neural.");
    }
  }, 1000);
}

timerToggle.addEventListener("click", () => (timerId ? pauseTimer() : startTimer()));
timerReset.addEventListener("click", () => {
  pauseTimer();
  secondsRemaining = TOTAL_SECONDS;
  renderTimer();
  showToast("Cronómetro reiniciado a 30:00");
});

document.querySelectorAll("[data-start-lab]").forEach((button) => {
  button.addEventListener("click", () => {
    startTimer();
    document.querySelector("#post-entrenamiento").scrollIntoView({ behavior: "smooth" });
  });
});

document.querySelector("#focusToggle").addEventListener("click", (event) => {
  const active = document.body.classList.toggle("focus-mode");
  event.currentTarget.querySelector("span").textContent = active ? "Mostrar ruta" : "Modo enfoque";
  event.currentTarget.setAttribute("aria-pressed", String(active));
});

const TOTAL_CHECKPOINTS = 7;

function updateProgress() {
  completedSteps = [...new Set(completedSteps)].sort((a, b) => a - b);
  const percentage = Math.round((completedSteps.length / TOTAL_CHECKPOINTS) * 100);
  progressBar.style.width = `${percentage}%`;
  progressLabel.textContent = `${percentage}%`;
  progressMessage.textContent =
    completedSteps.length === TOTAL_CHECKPOINTS
      ? "¡Misión completada! Dominas Fine-Tuning, RAG y Rerankers."
      : `${completedSteps.length} de ${TOTAL_CHECKPOINTS} misiones completadas.`;

  document.querySelectorAll("[data-complete]").forEach((checkpoint) => {
    const step = Number(checkpoint.dataset.complete);
    const complete = completedSteps.includes(step);
    checkpoint.classList.toggle("is-complete", complete);
    checkpoint.setAttribute("aria-pressed", String(complete));
  });

  document.querySelectorAll("[data-section]").forEach((navItem) => {
    const section = document.querySelector(`#${navItem.dataset.section}`);
    if (section) {
      const step = Number(section.dataset.step);
      navItem.classList.toggle("is-complete", completedSteps.includes(step));
    }
  });

  finishCard.classList.toggle("is-unlocked", completedSteps.length === TOTAL_CHECKPOINTS);
  writeStorage(STORAGE_KEY, completedSteps);
}

document.querySelectorAll("[data-complete]").forEach((checkpoint) => {
  checkpoint.addEventListener("click", () => {
    const step = Number(checkpoint.dataset.complete);
    if (completedSteps.includes(step)) {
      completedSteps = completedSteps.filter((savedStep) => savedStep !== step);
    } else {
      completedSteps.push(step);
      showToast(step === 6 ? "¡Oráculo Neural desbloqueado al 100%!" : `Checkpoint ${String(step).padStart(2, "0")} completado (+100 XP)`);
    }
    updateProgress();
  });
});

document.querySelector("[data-reset-progress]").addEventListener("click", () => {
  completedSteps = [];
  updateProgress();
  document.querySelector("#inicio").scrollIntoView({ behavior: "smooth" });
  showToast("Progreso reiniciado");
});

const navItems = [...document.querySelectorAll("[data-section]")];
const lessonSections = [...document.querySelectorAll(".lesson")];
let navigationLocked = false;
let scrollFrame = null;

function setActiveNavigation(sectionId) {
  navItems.forEach((item) => {
    const active = item.dataset.section === sectionId;
    item.classList.toggle("is-active", active);
    if (active) item.setAttribute("aria-current", "step");
    else item.removeAttribute("aria-current");
  });
}

function updateActiveNavigation() {
  if (navigationLocked) return;
  const marker = window.scrollY + window.innerHeight * 0.34;
  let activeSection = lessonSections[0];
  lessonSections.forEach((section) => {
    if (section.offsetTop <= marker) activeSection = section;
  });
  if (activeSection) setActiveNavigation(activeSection.id);
}

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    navigationLocked = true;
    setActiveNavigation(item.dataset.section);
    window.setTimeout(() => {
      navigationLocked = false;
      updateActiveNavigation();
    }, 850);
  });
});

window.addEventListener("scroll", () => {
  if (scrollFrame) return;
  scrollFrame = window.requestAnimationFrame(() => {
    updateActiveNavigation();
    scrollFrame = null;
  });
}, { passive: true });

document.querySelectorAll("[data-copy-code]").forEach((button) => {
  button.addEventListener("click", async () => {
    const code = [...button.closest("[data-code-panel]").querySelectorAll(".code-line > span")]
      .map((line) => {
        const cleanLine = line.cloneNode(true);
        cleanLine.querySelectorAll("small").forEach((comment) => comment.remove());
        return cleanLine.textContent.trimEnd();
      })
      .join("\n");
    try {
      await navigator.clipboard.writeText(code);
      button.textContent = "¡Copiado!";
      showToast("Código copiado al portapapeles");
      window.setTimeout(() => {
        button.textContent = "Copiar código";
      }, 1400);
    } catch {
      showToast("Selecciona el código y usa Ctrl/Cmd + C");
    }
  });
});

// ============================================================================
// EXPLORADOR DE LOS 4 PASOS DE RAG ARCHITECTURE MODEL (DIAPOSITIVA 09)
// ============================================================================
const ragStepsInfo = {
  step1: `<strong>Paso 1 — Question (Client → Framework):</strong> El usuario envía su consulta al Framework. En lugar de mandarla directo al LLM sin contexto, el Framework la transforma en un vector (Embedding) para consultar fuentes actualizadas.`,
  step2: `<strong>Paso 2 — Semantic Search &amp; Contextual Data (Vector Database):</strong> El Framework ejecuta una búsqueda semántica sobre la <code>Vector Database</code> (alimentada por <em>Original Content</em> y <em>New Content</em>) y recupera los fragmentos documentales más cercanos en significado.`,
  step3: `<strong>Paso 3 — Prompt (Framework → LLM):</strong> El Framework ensambla un Prompt aumentado combinando las instrucciones del sistema, los fragmentos verificados (<em>Contextual Data</em>) y la pregunta original del usuario.`,
  step4: `<strong>Paso 4 — Post Processing &amp; Response (LLM → Framework → Client):</strong> El LLM genera la respuesta fundamentada en los documentos, el Framework realiza el post-procesamiento (citas, formato, filtros) y entrega el <code>Response</code> al cliente.`,
};

document.querySelectorAll("[data-rag-step]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-rag-step]").forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    document.querySelector("#ragStepDetail").innerHTML = ragStepsInfo[btn.dataset.ragStep];
  });
});

// ============================================================================
// SIMULADOR VISUAL INTERACTIVO DE RERANKER ON/OFF (DIAPOSITIVA 10)
// ============================================================================
const toggleRerankerDemo = document.querySelector("#toggleRerankerDemo");
const rerankDemoList = document.querySelector("#rerankDemoList");
let demoRerankerActive = true;

const demoCandidates = [
  {
    id: "d1",
    titulo: "Función Estratégica de los Rerankers en RAG (Diapositiva 10)",
    texto: "Mejoran la precisión en la recuperación, elevan la calidad del LLM y reducen el ruido y la redundancia mediante Corrective RAG.",
    vectorScore: 0.79,
    rerankScore: 0.98,
    esRuido: false,
  },
  {
    id: "d2",
    titulo: "Fragmento Redundante con Ruido General (Borrador Antiguo)",
    texto: "Los servidores procesan búsquedas generales con ruido informativo que puede confundir al generador si no se filtra.",
    vectorScore: 0.81,
    rerankScore: 0.22,
    esRuido: true,
  },
  {
    id: "d3",
    titulo: "Arquitectura RAG en 4 Etapas (Diapositivas 8 y 9)",
    texto: "Articula métodos retrieval-based y generation-based con búsqueda documental en tiempo real sobre una Vector Database.",
    vectorScore: 0.74,
    rerankScore: 0.88,
    esRuido: false,
  },
];

function renderRerankerDemo() {
  const list = [...demoCandidates].sort((a, b) =>
    demoRerankerActive ? b.rerankScore - a.rerankScore : b.vectorScore - a.vectorScore
  );

  rerankDemoList.innerHTML = list
    .map((item, index) => {
      const filtered = demoRerankerActive && item.esRuido;
      const badgeText = demoRerankerActive
        ? filtered
          ? "✕ FILTRADO (RUIDO)"
          : `✔ #${index + 1} · Rerank: ${item.rerankScore}`
        : `#${index + 1} · Vector: ${item.vectorScore}`;
      return `
        <div class="rerank-doc ${filtered ? "is-filtered" : ""}">
          <span style="font:800 11px var(--mono);color:${filtered ? "#fb7185" : "#22d3ee"}">${item.id.toUpperCase()}</span>
          <div>
            <strong style="display:block;font-size:13px;color:#f8fafc">${item.titulo}</strong>
            <small style="color:#94a3b8;font-size:11.5px">${item.texto}</small>
          </div>
          <div class="rerank-score" style="${filtered ? "background:rgba(244,63,94,.18);color:#fb7185" : ""}">${badgeText}</div>
        </div>
      `;
    })
    .join("");
}

toggleRerankerDemo.addEventListener("click", () => {
  demoRerankerActive = !demoRerankerActive;
  toggleRerankerDemo.classList.toggle("is-active", demoRerankerActive);
  toggleRerankerDemo.textContent = demoRerankerActive
    ? "✔ RERANKER ACTIVO (ON)"
    : "⚠ RERANKER DESACTIVADO (OFF)";
  renderRerankerDemo();
});

renderRerankerDemo();

// ============================================================================
// SIMULADOR DEL ORÁCULO NEURAL EN VIVO (SECCIÓN 06)
// ============================================================================
const VECTOR_DOCS = [
  {
    id: "doc-01",
    titulo: "Elementos del Fine-Tuning (Diapositivas 2 a 4)",
    categoria: "fine-tuning",
    contenido:
      "El fine-tuning toma un modelo preentrenado y lo entrena con interacciones reales usuario-agente para especializarlo en ventas o soporte técnico, ajustando tono, políticas internas y jerga.",
    vector: [0.89, 0.22, 0.12, 0.11, 0.1, 0.35],
  },
  {
    id: "doc-02",
    titulo: "Tipos de Post-Entrenamiento y Refinamiento (Diapositivas 6 y 7)",
    categoria: "post-training",
    contenido:
      "Incluye Supervised Fine-Tuning (SFT), Alineación (RLHF, DPO), Mejora del Razonamiento y Optimización de Eficiencia (PEFT/LoRA), además de Transfer Learning, Few-shot e Instruction Fine-tuning.",
    vector: [0.65, 0.88, 0.14, 0.12, 0.15, 0.25],
  },
  {
    id: "doc-03",
    titulo: "Función Estratégica de los Rerankers en RAG (Diapositiva 10)",
    categoria: "reranker",
    contenido:
      "Los rerankers mejoran la precisión en la recuperación de información, elevan la calidad de la generación del LLM y reducen el ruido y la redundancia evaluando en Correct, Ambiguous o Incorrect.",
    vector: [0.15, 0.18, 0.78, 0.62, 0.94, 0.3],
  },
  {
    id: "doc-04",
    titulo: "Fragmento Redundante con Ruido General",
    categoria: "ruido",
    contenido: "Borrador sin verificar con ruido redundante sobre servidores antiguos.",
    vector: [0.32, 0.31, 0.45, 0.41, 0.38, 0.2],
  },
];

const methodSelect = document.querySelector("#methodSelect");
const routeSelect = document.querySelector("#routeSelect");
const requestBody = document.querySelector("#requestBody");
const sendRequest = document.querySelector("#sendRequest");
const responseOutput = document.querySelector("#responseOutput");
const responseStatus = document.querySelector("#responseStatus");
const cookieOutput = document.querySelector("#cookieOutput");

const presets = {
  ragRerankOn: {
    method: "POST",
    route: "/api/v1/rag/consultar",
    body: {
      pregunta: "¿Qué función cumplen los rerankers para mejorar la precisión y reducir el ruido en RAG?",
      topK: 3,
      useReranker: true,
    },
  },
  ragRerankOff: {
    method: "POST",
    route: "/api/v1/rag/consultar",
    body: {
      pregunta: "¿Qué función cumplen los rerankers para mejorar la precisión y reducir el ruido en RAG?",
      topK: 3,
      useReranker: false,
    },
  },
  sftDataset: {
    method: "POST",
    route: "/api/v1/finetuning/preparar",
    body: {
      dominio: "Soporte Técnico Campuslands",
      tono: "Empático, claro y con jerga camper",
      preguntaUsuario: "¿Cuándo debo aplicar Fine-Tuning en vez de RAG?",
      respuestaAgente: "Aplica Fine-Tuning cuando busques adaptar el tono, estilo, reglas de formato o jerga interna de la organización mediante conversaciones reales.",
    },
  },
  newDoc: {
    method: "POST",
    route: "/api/v1/rag/documentos",
    body: {
      titulo: "Política de Deploy en Viernes",
      categoria: "campuslands",
      contenido: "Ningún camper despliega a producción los viernes después de las 4 PM sin pasar las 10 pruebas automatizadas.",
    },
  },
  compare: {
    method: "GET",
    route: "/api/v1/comparar",
    body: null,
  },
};

document.querySelectorAll("[data-preset]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const p = presets[btn.dataset.preset];
    methodSelect.value = p.method;
    routeSelect.value = p.route;
    requestBody.disabled = p.method === "GET";
    if (p.body) requestBody.value = JSON.stringify(p.body, null, 2);
  });
});

function simulateOraculo() {
  const route = routeSelect.value;
  const method = methodSelect.value;

  if (route === "/api/v1/comparar") {
    return {
      status: 200,
      body: {
        fineTuning: {
          analogiaHumana: "New memory formation (formación de nueva memoria / especialización profunda)",
          mecanismo: "Actualiza directamente los pesos de la red neuronal con muestras etiquetadas (SFT, RLHF, DPO).",
          idealPara: "Adaptar tono, políticas internas, estilo y jerga de la organización.",
        },
        rag: {
          analogiaHumana: "Open book quiz (examen a libro abierto con búsqueda en tiempo real)",
          mecanismo: "1) Búsqueda semántica en Vector Database + Reranker. 2) Inyección de contexto en el Prompt.",
          idealPara: "Conocimiento actualizado en tiempo real y reducción de alucinaciones.",
        },
      },
    };
  }

  if (route === "/api/v1/rag/documentos" && method === "GET") {
    return { status: 200, body: { data: VECTOR_DOCS } };
  }

  let bodyData = {};
  try {
    bodyData = JSON.parse(requestBody.value);
  } catch {
    return { status: 400, body: { error: "El body no contiene JSON válido" } };
  }

  if (route === "/api/v1/finetuning/preparar") {
    if (!bodyData.dominio || String(bodyData.preguntaUsuario || "").length < 8) {
      return {
        status: 400,
        body: { errores: [{ msg: "Debes incluir dominio, preguntaUsuario y respuestaAgente válidos" }] },
      };
    }
    const messages = [
      {
        role: "system",
        content: `Eres un modelo ajustado mediante Supervised Fine-Tuning (SFT) experto en ${bodyData.dominio} con tono ${bodyData.tono || "profesional"}.`,
      },
      { role: "user", content: bodyData.preguntaUsuario },
      { role: "assistant", content: bodyData.respuestaAgente },
    ];
    cookieOutput.textContent = `Dataset SFT actualizado · Dominio: ${bodyData.dominio}`;
    return {
      status: 201,
      body: {
        data: { id: `sft-${Date.now()}`, dominio: bodyData.dominio, messages },
        jsonl: JSON.stringify({ messages }),
        metricas: { tipoPostEntrenamiento: "Supervised Fine-tuning (SFT)", tokensEstimados: 64 },
      },
    };
  }

  if (route === "/api/v1/rag/documentos" && method === "POST") {
    const nuevo = {
      id: `doc-0${VECTOR_DOCS.length + 1}`,
      titulo: bodyData.titulo || "Documento Nuevo",
      categoria: bodyData.categoria || "campuslands",
      contenido: bodyData.contenido || "",
      vector: [0.42, 0.38, 0.66, 0.71, 0.55, 0.89],
    };
    VECTOR_DOCS.unshift(nuevo);
    cookieOutput.textContent = `Vector DB: ${VECTOR_DOCS.length} docs indexados · Último: ${nuevo.titulo}`;
    return { status: 201, body: { data: nuevo } };
  }

  if (route === "/api/v1/rag/consultar") {
    const useReranker = bodyData.useReranker !== false;
    const docs = useReranker
      ? VECTOR_DOCS.filter((d) => d.categoria !== "ruido").map((d, i) => ({
          id: d.id,
          titulo: d.titulo,
          vectorScore: Number((0.84 - i * 0.06).toFixed(2)),
          rerankScore: Number((0.97 - i * 0.05).toFixed(2)),
          contenido: d.contenido,
        }))
      : VECTOR_DOCS.map((d, i) => ({
          id: d.id,
          titulo: d.titulo,
          vectorScore: Number((0.82 - i * 0.04).toFixed(2)),
          rerankScore: Number((0.82 - i * 0.04).toFixed(2)),
          contenido: d.contenido,
        }));

    cookieOutput.textContent = `RAG 4 Pasos · Reranker: ${useReranker ? "ON (Ruido filtrado)" : "OFF (Sin filtrar)"}`;
    return {
      status: 200,
      body: {
        reranker: {
          activo: useReranker,
          evaluacionRecuperacion: useReranker ? "Correct" : "Sin evaluar (Reranker OFF)",
          etapasCorrectiveRAG: ["Decompose", "Filter (Reducción de Ruido)", "Recompose"],
          ruidoEliminado: useReranker ? 1 : 0,
        },
        arquitectura4Pasos: {
          paso1_question: { pregunta: bodyData.pregunta, queryVector: [0.18, 0.24, 0.79, 0.68, 0.92, 0.31] },
          paso2_semanticSearch: docs.slice(0, bodyData.topK || 3),
          paso3_prompt: `SISTEMA: Responde con base en los documentos verificados.\nCONTEXTO: ${docs[0]?.titulo}\nPREGUNTA: ${bodyData.pregunta}`,
          paso4_response: `Respuesta fundamentada (${docs[0]?.titulo}): ${docs[0]?.contenido}`,
        },
      },
    };
  }

  return { status: 404, body: { error: "Ruta no encontrada" } };
}

function escapeHtml(value) {
  return value.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
}

function highlightJson(data) {
  const safeJson = escapeHtml(JSON.stringify(data, null, 2));
  return safeJson.replace(
    /(&quot;.*?&quot;)(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?/g,
    (match, string, colon) => {
      if (string) return colon ? `<span class="console-key">${string}</span>${colon}` : `<span class="console-string">${string}</span>`;
      return `<span class="console-number">${match}</span>`;
    }
  );
}

sendRequest.addEventListener("click", () => {
  responseStatus.textContent = "PROCESANDO...";
  responseStatus.className = "response-status";
  responseOutput.innerHTML = '<span class="console-muted">// Ejecutando pipeline: Question → Vector DB Semantic Search → Reranker → Prompt → LLM...</span>';
  sendRequest.disabled = true;

  window.setTimeout(() => {
    const response = simulateOraculo();
    responseStatus.textContent = `${response.status} ${response.status < 400 ? "OK" : "ERROR"}`;
    responseStatus.classList.add(response.status < 400 ? "is-success" : "is-error");
    responseOutput.innerHTML = `<span class="console-muted">X-API-Version: 1.0.0\nContent-Type: application/json\n\n</span>${highlightJson(response.body)}`;
    sendRequest.disabled = false;
  }, 260);
});

document.querySelectorAll("[data-quiz-answer]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const ok = btn.dataset.quizAnswer === "rag";
    const feedback = document.querySelector("#quizFeedback");
    feedback.textContent = ok
      ? "✔ ¡Correcto! RAG actúa como un examen a libro abierto (Open book quiz): consulta la Vector Database en tiempo real sin necesidad de reentrenar los pesos del modelo cada 5 minutos."
      : "✕ Incorrecto: Reentrenar o hacer Fine-Tuning cada 5 minutos es costoso y lento; para datos que cambian en tiempo real la solución ideal es RAG + Base de Datos Vectorial.";
    feedback.style.color = ok ? "#10b981" : "#f43f5e";
  });
});

updateProgress();
renderTimer();
updateActiveNavigation();
