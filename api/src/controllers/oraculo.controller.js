import { ParFineTuningDTO, CrearDocumentoDTO, ConsultaRAGDTO } from "../dtos/oraculo.dto.js";
import { finetuningService } from "../services/finetuning.service.js";
import { vectorService } from "../services/vector.service.js";
import { rerankerService } from "../services/reranker.service.js";

export function prepararFineTuning(req, res, next) {
  try {
    const dto = new ParFineTuningDTO(req.body);
    const resultado = finetuningService.prepararEjemploSFT(dto);
    res.status(201).json(resultado);
  } catch (error) {
    next(error);
  }
}

export function listarDocumentos(req, res, next) {
  try {
    const data = vectorService.listarDocumentos();
    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
}

export function indexarDocumento(req, res, next) {
  try {
    const dto = new CrearDocumentoDTO(req.body);
    const nuevo = vectorService.indexarDocumento(dto);
    res.status(201).json({ data: nuevo });
  } catch (error) {
    next(error);
  }
}

export function consultarRAG(req, res, next) {
  try {
    const dto = new ConsultaRAGDTO(req.body);
    const resultado = rerankerService.ejecutarPipelineRAG(dto);
    res.status(200).json(resultado);
  } catch (error) {
    next(error);
  }
}

export function compararEnfoques(req, res, next) {
  try {
    res.status(200).json(finetuningService.obtenerMatrizComparativa());
  } catch (error) {
    next(error);
  }
}
