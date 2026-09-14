import { Router } from "express";
import {
  registrarUsuario,
  iniciarSesion,
  obtenerPerfil,
  generarLecturaGemini,
} from "../controllers/usuario.controller.js";
import {
  registroUsuarioValidator,
  loginUsuarioValidator,
} from "../validators/usuario.validator.js";
import { validarCampos } from "../middlewares/validarCampos.js";
import { validarJWT } from "../middlewares/validarJWT.js";

const router = Router();

// Rutas públicas de autenticación
router.post("/register", registroUsuarioValidator, validarCampos, registrarUsuario);
router.post("/login", loginUsuarioValidator, validarCampos, iniciarSesion);

// Rutas protegidas con JWT
router.get("/perfil", validarJWT, obtenerPerfil);
router.post("/lectura-gemini", validarJWT, generarLecturaGemini);

export default router;