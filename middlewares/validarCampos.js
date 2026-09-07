import { validationResult } from "express-validator";

/**
 * Middleware genérico que revisa si las reglas de express-validator
 * encontraron errores en la petición.
 * Si hay errores, responde 400 con los detalles formateados.
 * Si no hay errores, transfiere el control con next().
 */
export const validarCampos = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({
      mensaje: "Error de validación",
      errores: errores.array().map((err) => ({
        campo: err.path,
        mensaje: err.msg,
      })),
    });
  }
  next();
};
