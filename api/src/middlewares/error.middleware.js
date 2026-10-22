export function rutaNoEncontrada(req, res) {
  res.status(404).json({
    error: "Ruta no encontrada",
    metodo: req.method,
    url: req.originalUrl,
  });
}

export function manejarError(error, req, res, next) {
  console.error("[API Error]", error);
  const status = error.statusCode || error.status || 500;
  res.status(status).json({
    error: error.message || "Error interno del servidor",
  });
}
