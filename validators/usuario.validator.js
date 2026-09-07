import { body, param } from "express-validator";
import Usuario from "../models/Usuario.model.js";

/**
 * Validador para parámetros :id en rutas (ObjectId de MongoDB)
 */
export const idValidator = [
  param("id")
    .isMongoId()
    .withMessage("El id proporcionado no es un ObjectId válido de MongoDB"),
];

/**
 * Reglas de validación para el REGISTRO de un usuario
 */
export const registroUsuarioValidator = [
  body("nombre_completo")
    .trim()
    .notEmpty()
    .withMessage("El nombre completo es obligatorio")
    .bail()
    .isLength({ min: 2, max: 100 })
    .withMessage("El nombre debe tener entre 2 y 100 caracteres"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("El email es obligatorio")
    .bail()
    .isEmail()
    .withMessage("Debe proporcionar un email válido")
    .bail()
    .custom(async (email) => {
      if (!email) return true;
      if (Usuario.db?.readyState === 1) {
        const existe = await Usuario.findOne({ email });
        if (existe) {
          throw new Error("Ya existe un usuario registrado con ese email");
        }
      }
      return true;
    }),

  body("password_hash")
    .notEmpty()
    .withMessage("La contraseña es obligatoria")
    .bail()
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres"),

  body("fecha_nacimiento")
    .notEmpty()
    .withMessage("La fecha de nacimiento es obligatoria")
    .bail()
    .isISO8601()
    .withMessage("La fecha debe tener formato válido (YYYY-MM-DD)")
    .bail()
    .custom((valor) => {
      if (!valor) return true;
      if (new Date(valor) > new Date()) {
        throw new Error("La fecha de nacimiento no puede ser futura");
      }
      return true;
    }),
];

/**
 * Reglas de validación para el INICIO DE SESIÓN
 */
export const loginUsuarioValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("El email es obligatorio")
    .bail()
    .isEmail()
    .withMessage("Debe proporcionar un email válido"),

  body("password_hash")
    .notEmpty()
    .withMessage("La contraseña es obligatoria"),
];

/**
 * Reglas de validación para la ACTUALIZACIÓN de un usuario
 */
export const actualizarUsuarioValidator = [
  body("nombre_completo")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("El nombre debe tener entre 2 y 100 caracteres"),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Debe proporcionar un email válido")
    .bail()
    .custom(async (email, { req }) => {
      if (!email) return true;
      if (Usuario.db?.readyState === 1) {
        const existe = await Usuario.findOne({ email });
        if (existe && existe._id.toString() !== req.params?.id) {
          throw new Error("Ya existe un usuario registrado con ese email");
        }
      }
      return true;
    }),

  body("fecha_nacimiento")
    .optional()
    .isISO8601()
    .withMessage("La fecha debe tener formato válido (YYYY-MM-DD)")
    .bail()
    .custom((valor) => {
      if (!valor) return true;
      if (new Date(valor) > new Date()) {
        throw new Error("La fecha de nacimiento no puede ser futura");
      }
      return true;
    }),
];
