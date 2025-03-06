// index.js
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const API_URL = process.env.API_URL || "http://127.0.0.1:8000"; // URL dinámica para el backend

// Middleware para CORS (permite conexiones entre frontend y backend)
app.use(cors());

// Servir archivos estáticos del frontend
// Asegúrate de que la carpeta "frontend" contenga la build o los archivos estáticos de tu Next.js (o React)
app.use(express.static(path.join(__dirname, "frontend")));

// Proxy para redirigir solicitudes de /cv al backend (FastAPI)
app.use(
  "/cv",
  createProxyMiddleware({
    target: API_URL,
    changeOrigin: true,
  })
);

// Ruta principal (puedes modificarla según necesites)
app.get("/", (req, res) => {
  res.send("Bienvenido a Webflor Admin 🚀");
});

// Iniciar servidor Express
app.listen(PORT, () => {
  console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
  console.log(`Redirigiendo API a: ${API_URL}`);
});
//pequeño cambio para commit