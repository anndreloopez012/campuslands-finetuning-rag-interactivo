import { Router } from "express";
import {
  prepararFineTuning,
  listarDocumentos,
  indexarDocumento,
  consultarRAG,
  compararEnfoques,
} from "../controllers/oraculo.controller.js";
import {
  validarParFineTuning,
  validarDocumento,
  validarConsultaRAG,
} from "../validators/oraculo.validator.js";

export const oraculoRouter = Router();

// 1. Preparación de Dataset de Supervised Fine-Tuning (SFT)
oraculoRouter.post("/finetuning/preparar", validarParFineTuning, prepararFineTuning);

// 2. Gestión de la Base de Datos Vectorial para RAG
oraculoRouter.get("/rag/documentos", listarDocumentos);
oraculoRouter.post("/rag/documentos", validarDocumento, indexarDocumento);

// 3. Pipeline RAG de 4 etapas + Reranker estratégico
oraculoRouter.post("/rag/consultar", validarConsultaRAG, consultarRAG);

// 4. Matriz comparativa Fine-Tuning vs RAG + Prompt Engineering
oraculoRouter.get("/comparar", compararEnfoques);
