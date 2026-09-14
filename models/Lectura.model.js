import mongoose from "mongoose";

const lecturaSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: [true, "El usuario referenciado es obligatorio"],
    },
    tipo: {
      type: String,
      required: [true, "El tipo de lectura es obligatorio"],
      enum: ["Camino de Vida", "Carta Astral", "Compatibilidad", "Consulta IA Gemini", "Numerologia Alma"],
      default: "Camino de Vida",
    },
    signo_zodiacal: {
      type: String,
      required: true,
      trim: true,
    },
    resultado: {
      type: String,
      required: [true, "El resultado de la lectura es obligatorio"],
    },
    privada: {
      type: Boolean,
      default: true,
    },
    fecha_consulta: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Lectura", lecturaSchema);
