import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const usuarioSchema = new mongoose.Schema(
  {
    nombre_completo: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password_hash: {
      type: String,
      required: true,
    },
    fecha_nacimiento: {
      type: Date,
      required: true,
    },
    estado: {
      type: Boolean,
      default: true,
    },
    fecha_registro: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// ⚡ Hook pre('save'): Cifrado automático de la contraseña antes de guardar en MongoDB
usuarioSchema.pre("save", async function () {
  if (!this.isModified("password_hash")) {
    return;
  }
  const salt = await bcryptjs.genSalt(10);
  this.password_hash = await bcryptjs.hash(this.password_hash, salt);
});

// 🔒 Método toJSON: Excluye automáticamente password_hash y __v al serializar la respuesta
usuarioSchema.methods.toJSON = function () {
  const { __v, password_hash, ...usuario } = this.toObject();
  return usuario;
};

export default mongoose.model("Users", usuarioSchema);