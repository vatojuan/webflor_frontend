// server.js (Express debe ejecutarse aparte de Next.js)
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;
const API_URL = process.env.API_URL || "http://127.0.0.1:8000"; // URL del backend

// Middleware CORS
app.use(cors());

// Proxy para redirigir a FastAPI
app.use(
  "/cv",
  createProxyMiddleware({
    target: API_URL,
    changeOrigin: true,
  })
);

// Servir archivos estáticos de Next.js
app.use(express.static(path.join(__dirname, "out"))); // Para "next export"

// Iniciar el servidor Express
app.listen(PORT, () => {
  console.log(`Servidor Express en http://localhost:${PORT}`);
});
