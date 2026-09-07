import express from "express";
import "dotenv/config";

import { connectDB } from "./database/cnxMongoDB.js";
import usuarioRoutes from "./routes/usuario.routes.js";

const PORT = process.env.PORT || 3000;

const app = express();
//middleware .json
app.use(express.json());

app.use("/api/v1/auth", usuarioRoutes);

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
