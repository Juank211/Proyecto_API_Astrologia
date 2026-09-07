import jwt from "jsonwebtoken";

/**
 * Genera un JSON Web Token (JWT) firmado con la clave secreta y expiración de 4h.
 * @param {string} uid - Identificador del usuario (MongoDB _id)
 * @returns {Promise<string>} Token JWT generado
 */
export const generarJWT = (uid) => {
  return new Promise((resolve, reject) => {
    const payload = { uid };

    jwt.sign(
      payload,
      process.env.SECRETORPRIVATEKEY,
      {
        expiresIn: "4h",
      },
      (err, token) => {
        if (err) {
          console.error("Error al firmar JWT:", err);
          reject("No se pudo generar el token");
        } else {
          resolve(token);
        }
      }
    );
  });
};
