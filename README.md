# Campuslands · Fundamentos de Fine-Tuning y RAG con Rerankers (AI Lab · Oráculo Neural)

[![Node.js](https://img.shields.io/badge/Node.js-20%2B%20ESM-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Fine-Tuning](https://img.shields.io/badge/Fine--Tuning-SFT%20%7C%20RLHF%20%7C%20DPO-8b5cf6)](#)
[![RAG + Reranker](https://img.shields.io/badge/RAG-Vector%20DB%20%2B%20Reranker-06b6d4)](#)
[![Interactive Web](https://img.shields.io/badge/GitHub%20Pages-Guía%20Interactiva-10b981)](https://anndreloopez012.github.io/campuslands-finetuning-rag-interactivo/)

Laboratorio visual, dinámico y guiado de **30 minutos** para dominar los **Fundamentos de Fine-Tuning (SFT, RLHF, DPO, PEFT/LoRA) y Retrieval-Augmented Generation (RAG) con Rerankers y Bases de Datos Vectoriales**, combinando toda la teoría oficial de **Inteligencia Artificial II** con la construcción de una API REST y 10 pruebas automatizadas.

**Autor:** Andre Lopez · Basado en el material de **Eduin Salas Viloria** (*Campuslands*)

**Guía publicada:** [anndreloopez012.github.io/campuslands-finetuning-rag-interactivo](https://anndreloopez012.github.io/campuslands-finetuning-rag-interactivo/)

---

## 🧠 ¿Qué incluye este repositorio?

- **Plataforma web interactiva responsive** con estética AI Lab / Oráculo Neural, cronómetro de 30 minutos y modo enfoque para proyector en clase.
- **Explicación completa de la presentación oficial**:
  - **Definición y Ciclo de Fine-Tuning**: `Pretraining → Fine-Tuning → Inference & Deployment`.
  - **Los 4 Elementos del Fine-Tuning**: Modelo preentrenado (`Base LLM`), Objetivo del ajuste fino, Datos de ajuste fino (interacciones reales usuario-agente) y Modelo ajustado (tono, políticas internas y jerga de la organización).
  - **Diferencias con el Pre-Entrenamiento**: Escala, objetivo, tipo de datos (`Unlabeled` en Common Crawl/arXiv/Wikipedia → `LLaMA` vs `Labeled / Instructured` → `Alpaca`) y costo computacional.
  - **Tipos de Post-Entrenamiento**: *Supervised Fine-tuning (SFT)*, *Alineación (RLHF, DPO, RLAIF)*, *Mejora del Razonamiento (Self-Refine)* y *Optimización de Eficiencia (PEFT/LoRA, Destilación)*.
  - **Los 5 Tipos de Refinamiento**: *Transfer Learning*, *SFT*, *Few-shot Fine-tuning*, *Instruction Fine-tuning* y *Domain-Specific Fine-tuning*.
  - **Matriz Comparativa Técnica**: **Fine-Tuning** (*"New memory formation"*) vs **RAG + Prompt Engineering** (*"Open book quiz"*).
  - **Arquitectura RAG en 4 Etapas Interactiva**: `(1) Question → (2) Semantic Search en Vector Database → (3) Prompt con Contextual Data → (4) Post Processing & Response`.
  - **Simulador Visual de RAG Reranked & Corrective RAG**: Compara en vivo resultados con Reranker ON/OFF, filtrando ruido y redundancia (`Correct / Ambiguous / Incorrect` + `Decompose → Filter → Recompose`).
- **API Backend funcional en `api/`** con flujo aditivo y **10 pruebas automatizadas** nativas con `node:test`.

---

## ⏱️ Ruta de Aprendizaje de 30 Minutos

| Checkpoint | Tema | Resultado |
|---|---|---|
| **00** | Fine-Tuning & Elementos | Comprender el ciclo de vida del LLM y los 4 elementos del ajuste fino |
| **01** | Post-Training & Matriz VS | Dominar SFT, RLHF, DPO, los 5 tipos de refinamiento y la tabla Fine-Tuning vs RAG |
| **02** | Arquitectura RAG (4 Pasos) | Explorar el flujo `Client → Framework ↔ Vector DB → Prompt → LLM → Response` |
| **03** | RAG Reranked | Probar el simulador de Reranker ON/OFF y Corrective RAG |
| **04** | Controladores & Rutas | Conectar los endpoints RESTful del Oráculo Neural en Express |
| **05** | Base de Datos Vectorial | Instalar y configurar una Vector Database (en memoria o Qdrant en Docker) |
| **06** | Boss Fight: Simulador & Tests | Ejecutar la suite de 10 pruebas (`npm test`) y el simulador en vivo |

---

## 📂 Estructura del Repositorio

```text
campuslands-finetuning-rag-interactivo/
├── index.html                      # Plataforma web interactiva (Teoría + Simulador Reranker + Playground IA)
├── styles.css                      # Estilos con estética AI Lab / Oráculo Neural y modo enfoque
├── app.js                          # Lógica de simuladores RAG, Reranker ON/OFF, cronómetro y XP
├── README.md                       # Documentación principal del laboratorio
├── LICENSE                         # Licencia MIT
├── .gitignore                      # Exclusiones de Git
├── .nojekyll                       # Despliegue directo en GitHub Pages
├── AGENTS.md                       # Reglas multi-agente (Graphify/Obsidian)
├── CLAUDE.md                       # Instrucciones para Claude Code
└── api/
    ├── package.json                # Dependencias y scripts de Node.js (ESM)
    ├── README.md                   # Documentación técnica de la API y comandos cURL
    ├── src/
    │   ├── app.js                  # Servidor Express + CORS + SemVer
    │   ├── server.js               # Arranque en puerto 3000
    │   ├── controllers/
    │   │   └── oraculo.controller.js # Controladores de Fine-Tuning SFT, Vector DB y RAG
    │   ├── dtos/
    │   │   └── oraculo.dto.js      # Sanitización de pares SFT, documentos y consultas RAG
    │   ├── middlewares/
    │   │   └── error.middleware.js # Manejador centralizado de errores y 404
    │   ├── routes/
    │   │   └── oraculo.routes.js   # Definición de endpoints RESTful
    │   ├── services/
    │   │   ├── finetuning.service.js # Generador de datasets SFT (JSONL) y matriz comparativa
    │   │   ├── vector.service.js   # Motor de Embeddings y similitud de coseno en memoria
    │   │   └── reranker.service.js # Reranker estratégico y Corrective RAG
    │   └── validators/
    │       └── oraculo.validator.js # Validaciones con express-validator
    └── test/
        └── api.test.js             # 10 pruebas automatizadas con node:test
```

---

## 🌐 Ejecutar la Guía Web Interactiva

```bash
python3 -m http.server 4173
```

Abre en tu navegador `http://127.0.0.1:4173`.

---

## ⚙️ Ejecutar la API Backend y las 10 Pruebas

```bash
cd api
npm install
npm test
npm run check
npm start
```
