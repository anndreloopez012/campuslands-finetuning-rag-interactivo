import { body, validationResult } from "express-validator";

const responderErrores = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }
  next();
};

export const validarParFineTuning = [
  body("dominio")
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("El dominio debe tener entre 3 y 50 caracteres (ej. ventas, soporte técnico)"),
  body("preguntaUsuario")
    .trim()
    .isLength({ min: 8, max: 400 })
    .withMessage("La pregunta del usuario debe tener entre 8 y 400 caracteres"),
  body("respuestaAgente")
    .trim()
    .isLength({ min: 10, max: 800 })
    .withMessage("La respuesta del agente humano debe tener entre 10 y 800 caracteres"),
  responderErrores,
];

export const validarDocumento = [
  body("titulo")
    .trim()
    .isLength({ min: 4, max: 100 })
    .withMessage("El título debe tener entre 4 y 100 caracteres"),
  body("contenido")
    .trim()
    .isLength({ min: 15, max: 1200 })
    .withMessage("El contenido documental debe tener entre 15 y 1200 caracteres"),
  responderErrores,
];

export const validarConsultaRAG = [
  body("pregunta")
    .trim()
    .isLength({ min: 5, max: 300 })
    .withMessage("La consulta debe tener entre 5 y 300 caracteres"),
  responderErrores,
];
