# Protocolo Multi-Agente - Campuslands Fine-Tuning & RAG Interactivo

Este repositorio forma parte de los proyectos de formación de Campuslands (Inteligencia Artificial II) y utiliza el protocolo de sincronización continua con Obsidian Vault y Graphify para colaboración entre agentes (Antigravity, Codex y Claude Code).

---

## 1. Arquitectura y Tecnologías
- **Entorno:** Node.js 20+ con ES Modules (`"type": "module"` en `package.json`).
- **Framework & Librerías:**
  - Express 5.x para enrutamiento y middleware.
  - `express-validator` 7.x para validación de datasets de Fine-Tuning y consultas RAG.
  - `cors` para cabeceras de acceso HTTP.
  - Motor de **Fine-Tuning Supervisado (SFT)**: Estructuración de interacciones reales (`system`, `user`, `assistant`) en formato JSONL para adaptar tono, políticas internas y jerga organizacional.
  - Motor de **Base de Datos Vectorial en Memoria**: Cálculo determinista de Embeddings multidimensionales y búsqueda semántica por similitud de coseno (`Cosine Similarity`).
  - Motor de **Reranking & Corrective RAG**: Re-evaluación estratégica de fragmentos recuperados para mejorar precisión, reducir ruido/redundancia y clasificar la evidencia en `Correct`, `Ambiguous` o `Incorrect` (`Decompose -> Filter -> Recompose`).
  - Node.js test runner nativo (`node:test` y `node:assert/strict`) con 10 pruebas automatizadas.
- **Frontend Educativo:**
  - Guía web estática interactiva (`index.html`, `styles.css`, `app.js`) compatible con GitHub Pages.
  - Simuladores interactivos de Ciclo Pretraining vs Fine-Tuning, Matriz de Decisión (Fine-Tuning vs RAG), Arquitectura RAG de 4 etapas, Reranker en vivo ON/OFF, cronómetro de 30 minutos y control de checkpoints XP.

---

## 2. Protocolo de Memoria Continua (Obsidian + Graphify)
Al realizar cambios en este repositorio, los agentes deben cumplir estrictamente:

1. **Inspección Previa:**
   - Ejecutar `git status --short` antes de modificar archivos.
2. **Actualización de Grafo y Memoria:**
   - Actualizar el grafo: `graphify update .` o `graphify .`.
   - Exportar a Obsidian:
     ```bash
     graphify export obsidian --dir "$HOME/Documents/OBSIDIAN/PROGRAMACION/Graphify/campuslands-finetuning-rag-interactivo"
     ```
   - Sincronizar memoria: `memoria refresh`.
   - Registrar validaciones o decisiones:
     ```bash
     memoria registrar campuslands-finetuning-rag-interactivo --tipo [aprendizaje|decision|cambio|validacion] --titulo "..." --texto "..."
     ```
3. **Flujo de Ramas Git:**
   - Trabajo estructurado en ramas `dev` y `main`.
   - La rama `main` conserva la versión estable sincronizada y lista para despliegue en GitHub Pages.
