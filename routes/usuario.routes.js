import { Router } from "express";
import {
  registrarUsuario,
  iniciarSesion,
  obtenerPerfil,
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

// Ruta protegida con JWT
router.get("/perfil", validarJWT, obtenerPerfil);

export default router;