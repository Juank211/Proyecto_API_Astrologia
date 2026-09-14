import { Router } from "express";
import {
  obtenerLecturas,
  obtenerLecturaPorId,
  crearLectura,
  eliminarLectura,
} from "../controllers/lectura.controller.js";
import { validarJWT } from "../middlewares/validarJWT.js";
import { idValidator } from "../validators/usuario.validator.js";
import { validarCampos } from "../middlewares/validarCampos.js";

const router = Router();

// Ruta pública para listar lecturas pobladas
router.get("/", obtenerLecturas);

// Ruta pública para consultar una lectura por ID
router.get("/:id", idValidator, validarCampos, obtenerLecturaPorId);

// Rutas protegidas (requieren token JWT)
router.post("/", validarJWT, crearLectura);
router.delete("/:id", [validarJWT, ...idValidator, validarCampos], eliminarLectura);

export default router;
