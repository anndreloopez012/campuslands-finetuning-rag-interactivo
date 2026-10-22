# API REST de Fine-Tuning & RAG con Reranker · Oráculo Neural · 30 Minutos

Este proyecto acompaña la plataforma interactiva de refuerzo para Campuslands sobre **Fundamentos de Fine-Tuning (SFT, RLHF, DPO) y Arquitectura Retrieval-Augmented Generation (RAG) con Rerankers y Base de Datos Vectorial**.

---

## 🎯 Objetivo de Aprendizaje
Comprender la diferencia técnica y arquitectónica entre **Fine-Tuning** (*"New memory formation"*, adaptación de pesos, tono y jerga mediante datasets SFT) y **RAG** (*"Open book quiz"*, recuperación semántica en tiempo real + Reranking en 4 etapas):

```text
[RAG Architecture Model - 4 Etapas]
(1) Client Question → (2) Vector Database Semantic Search + Reranker → (3) Prompt + Contextual Data → (4) LLM Post Processing & Response
```

---

## 📦 Estructura del Proyecto API

```text
api/
├── package.json                    # Dependencias y scripts (Express 5, CORS, express-validator)
├── README.md                       # Guía técnica de la API y pruebas cURL
├── src/
│   ├── app.js                      # Configuración de Express, CORS, SemVer y rutas
│   ├── server.js                   # Arranque del servidor en puerto 3000
│   ├── controllers/
│   │   └── oraculo.controller.js   # Controladores de Fine-Tuning SFT, Vector DB y RAG
│   ├── dtos/
│   │   └── oraculo.dto.js          # Sanitización de pares SFT, documentos y consultas RAG
│   ├── middlewares/
│   │   └── error.middleware.js     # Manejador centralizado de errores y 404
│   ├── routes/
│   │   └── oraculo.routes.js       # Endpoints RESTful del Oráculo Neural
│   ├── services/
│   │   ├── finetuning.service.js   # Formateador SFT (JSONL) y matriz Fine-Tuning vs RAG
│   │   ├── vector.service.js       # Motor de Embeddings y similitud de coseno en memoria
│   │   └── reranker.service.js     # Reranker estratégico y Corrective RAG (Correct/Ambiguous/Incorrect)
│   └── validators/
│       └── oraculo.validator.js    # Validaciones declarativas con express-validator
└── test/
    └── api.test.js                 # 10 pruebas automatizadas nativas con node:test
```

---

## 🚀 Cómo Ejecutar la API

```bash
cd api
npm install
npm start
```

Para ejecutar las 10 pruebas automatizadas:
```bash
npm test
npm run check
```

---

## 🧪 Pruebas Manuales con cURL

### 1. Preparar un par de Ajuste Fino Supervisado (`POST /api/v1/finetuning/preparar`)
```bash
curl -i -X POST http://localhost:3000/api/v1/finetuning/preparar \
  -H "Content-Type: application/json" \
  -d '{
    "dominio": "Soporte Técnico",
    "tono": "Empático y resolutivo",
    "preguntaUsuario": "¿Cómo reinicio mi contenedor en el laboratorio?",
    "respuestaAgente": "Ejecuta docker restart camper-node y revisa los logs con docker logs -f."
  }'
```

### 2. Consultar el Pipeline RAG de 4 Etapas con Reranker Activo (`POST /api/v1/rag/consultar`)
```bash
curl -i -X POST http://localhost:3000/api/v1/rag/consultar \
  -H "Content-Type: application/json" \
  -d '{
    "pregunta": "¿Qué función cumplen los rerankers para mejorar la precisión y reducir el ruido en RAG?",
    "topK": 3,
    "useReranker": true
  }'
```

### 3. Consultar la Matriz Comparativa Fine-Tuning vs RAG (`GET /api/v1/comparar`)
```bash
curl -i http://localhost:3000/api/v1/comparar
```
