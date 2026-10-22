import express from "express";
import cors from "cors";
import { oraculoRouter } from "./routes/oraculo.routes.js";
import { manejarError, rutaNoEncontrada } from "./middlewares/error.middleware.js";

const API_VERSION = "1.0.0";
const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  res.set("X-API-Version", API_VERSION);
  next();
});

app.get("/health", (req, res) => {
  res.status(200).json({
    estado: "ok",
    version: API_VERSION,
    servicio: "api-oraculo-finetuning-rag",
  });
});

app.use("/api/v1", oraculoRouter);

app.use(rutaNoEncontrada);
app.use(manejarError);

export default app;
