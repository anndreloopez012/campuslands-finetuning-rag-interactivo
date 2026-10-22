# Guía para Claude Code - Campuslands Fine-Tuning & RAG Interactivo

Este repositorio forma parte de los proyectos de formación de Campuslands y utiliza el protocolo de sincronización continua con Obsidian Vault y Graphify para colaboración entre agentes (Antigravity, Codex y Claude Code).

---

## Comandos Principales
- **Instalar dependencias:** `cd api && npm install`
- **Iniciar API:** `cd api && npm start`
- **Modo desarrollo:** `cd api && npm run dev`
- **Ejecutar pruebas:** `cd api && npm test`
- **Verificar sintaxis:** `cd api && npm run check`
- **Servidor local para guía interactiva:** `python3 -m http.server 4173`

---

## Protocolo Obligatorio de Sincronización
1. Antes de realizar cambios, ejecutar `git status --short`.
2. Al finalizar cambios de código:
   - `graphify update .` (o `graphify .`)
   - `graphify export obsidian --dir "$HOME/Documents/OBSIDIAN/PROGRAMACION/Graphify/campuslands-finetuning-rag-interactivo"`
   - `memoria refresh`
   - Registrar cualquier aprendizaje o decisión con `memoria registrar campuslands-finetuning-rag-interactivo ...`
3. Mantener ramas `dev` y `main` sincronizadas.
