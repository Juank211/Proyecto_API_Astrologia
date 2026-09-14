import bcryptjs from "bcryptjs";
import Users from "../models/Usuario.model.js";
import { generarJWT } from "../helpers/generarJWT.js";
import { obtenerNumerologiaCompleta } from "../helpers/numerologia.helper.js";
import { generarLecturaGeminiService } from "../helpers/geminiService.js";

export const registrarUsuario = async (req, res) => {
  try {
    const { nombre_completo, email, password_hash, fecha_nacimiento } = req.body;

    // El hook pre('save') en Usuario.model.js cifra la contraseña automáticamente de forma asíncrona
    const usuario = await Users.create({
      nombre_completo,
      email,
      password_hash,
      fecha_nacimiento,
    });

    res.status(201).json(usuario);
  } catch (error) {
    res.status(400).json({ mensaje: "Error al crear usuario", error: error.message });
  }
};

export const iniciarSesion = async (req, res) => {
  try {
    const { email, password_hash } = req.body;

    // 1. Verificar si el usuario existe por email
    const usuario = await Users.findOne({ email });
    if (!usuario) {
      return res.status(400).json({ mensaje: "Usuario / Password no son correctos" });
    }

    // 2. Verificar si el usuario está activo
    if (!usuario.estado) {
      return res.status(400).json({ mensaje: "Usuario inactivo - hable con el administrador" });
    }

    // 3. Verificar la contraseña de forma asíncrona (no bloqueante)
    const passwordValido = await bcryptjs.compare(password_hash, usuario.password_hash);
    if (!passwordValido) {
      return res.status(400).json({ mensaje: "Usuario / Password no son correctos" });
    }

    // 4. Generar el Token JWT
    const token = await generarJWT(usuario._id.toString());

    res.status(200).json({
      mensaje: "Inicio de sesion exitoso",
      usuario,
      token,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al iniciar sesion",
      error: error.message,
    });
  }
};

export const obtenerPerfil = async (req, res) => {
  try {
    // El usuario autenticado fue inyectado por el middleware validarJWT
    const usuario = req.usuario;

    // Cálculo dinámico de números de numerología central
    const numerologia = obtenerNumerologiaCompleta(usuario);

    res.status(200).json({
      mensaje: "Perfil obtenido correctamente",
      usuario,
      numerologia,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener perfil",
      error: error.message,
    });
  }
};

export const generarLecturaGemini = async (req, res) => {
  try {
    const usuario = req.usuario;
    const { signo } = req.body;

    const numerologia = obtenerNumerologiaCompleta(usuario);

    const lectura = await generarLecturaGeminiService({
      nombre: usuario.nombre_completo,
      fechaNacimiento: new Date(usuario.fecha_nacimiento).toISOString().split("T")[0],
      signo: signo || "Solar",
      numerologia,
    });

    res.status(200).json({
      mensaje: "Lectura generada con éxito con IA Gemini",
      lectura,
      numerologia,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al generar la lectura interpretativa con IA Gemini",
      error: error.message,
    });
  }
};