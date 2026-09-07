import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.model.js";

/**
 * Middleware para validar la autenticidad y vigencia de un JSON Web Token (JWT).
 * Extrae el token de la cabecera 'x-token' o 'Authorization' (Bearer),
 * verifica la firma y asocia el usuario autenticado a req.usuario.
 */
export const validarJWT = async (req, res, next) => {
  // Soporta cabecera 'x-token' de la guía o 'Authorization: Bearer <token>'
  let token = req.header("x-token");

  if (!token && req.header("Authorization")) {
    const authHeader = req.header("Authorization");
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else {
      token = authHeader;
    }
  }

  if (!token) {
    return res.status(401).json({
      mensaje: "No hay token en la peticion",
    });
  }

  try {
    const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);

    // Buscar el usuario autenticado en la base de datos
    const usuario = await Usuario.findById(uid);

    if (!usuario) {
      return res.status(401).json({
        mensaje: "Token no válido - usuario no existe en DB",
      });
    }

    // Verificar si el usuario está activo (estado: true)
    if (!usuario.estado) {
      return res.status(401).json({
        mensaje: "Token no válido - usuario inactivo",
      });
    }

    // Inyectar el usuario autenticado en la petición
    req.usuario = usuario;
    next();
  } catch (error) {
    return res.status(401).json({
      mensaje: "Token no valido",
    });
  }
};
