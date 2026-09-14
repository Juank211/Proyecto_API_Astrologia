import Lectura from "../models/Lectura.model.js";

/**
 * GET /api/v1/lecturas
 * Obtiene todas las lecturas registradas resolviendo la relación ref con populate
 */
export const obtenerLecturas = async (req, res) => {
  try {
    const lecturas = await Lectura.find()
      .populate("usuario", "nombre_completo email fecha_nacimiento estado")
      .sort({ fecha_consulta: -1 });

    res.status(200).json({
      total: lecturas.length,
      lecturas,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener las lecturas",
      error: error.message,
    });
  }
};

/**
 * GET /api/v1/lecturas/:id
 * Obtiene una lectura específica por su ObjectId resolviendo el ref de usuario
 */
export const obtenerLecturaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const lectura = await Lectura.findById(id).populate("usuario", "nombre_completo email fecha_nacimiento");

    if (!lectura) {
      return res.status(404).json({ mensaje: "Lectura no encontrada" });
    }

    res.status(200).json({ lectura });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al consultar la lectura",
      error: error.message,
    });
  }
};

/**
 * POST /api/v1/lecturas
 * Crea una nueva lectura asociada al usuario autenticado (extraído por validarJWT)
 */
export const crearLectura = async (req, res) => {
  try {
    const { tipo, signo_zodiacal, resultado, privada } = req.body;
    const usuarioId = req.usuario._id;

    const nuevaLectura = await Lectura.create({
      usuario: usuarioId,
      tipo,
      signo_zodiacal,
      resultado,
      privada: privada !== undefined ? privada : true,
    });

    // Poblar los datos del usuario para la respuesta
    await nuevaLectura.populate("usuario", "nombre_completo email");

    res.status(201).json({
      mensaje: "Lectura registrada con éxito",
      lectura: nuevaLectura,
    });
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al crear la lectura",
      error: error.message,
    });
  }
};

/**
 * DELETE /api/v1/lecturas/:id
 * Elimina una lectura existente
 */
export const eliminarLectura = async (req, res) => {
  try {
    const { id } = req.params;
    const lectura = await Lectura.findByIdAndDelete(id);

    if (!lectura) {
      return res.status(404).json({ mensaje: "Lectura no encontrada para eliminar" });
    }

    res.status(200).json({
      mensaje: "Lectura eliminada exitosamente",
      lecturaEliminada: lectura,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar la lectura",
      error: error.message,
    });
  }
};
