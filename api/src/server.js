import app from "./app.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🧠 Servidor Oráculo Neural (Fine-Tuning & RAG + Reranker) listo en http://localhost:${PORT}`);
});
