import express from "express";
import "dotenv/config";

import { connectDB } from "./database/cnxMongoDB.js";
import usuarioRoutes from "./routes/usuario.routes.js";
import lecturaRoutes from "./routes/lectura.routes.js";

const PORT = process.env.PORT || 3000;

const app = express();
// Middlewares
app.use(express.json());

// Middleware CORS para permitir peticiones desde Live Server o diferentes puertos
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-token");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.static("public"));

app.use("/api/v1/auth", usuarioRoutes);
app.use("/api/v1/lecturas", lecturaRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ mensaje: "Error interno del servidor" });
});

connectDB().then(() => {
  app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    })
}).catch((error) => {
        console.log("Error al conectar la base de datos:", error);
});
