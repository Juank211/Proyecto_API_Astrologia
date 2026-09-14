import "dotenv/config";
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import Usuario from "../models/Usuario.model.js";
import Lectura from "../models/Lectura.model.js";

async function seedDatabase() {
  try {
    console.log("🌱 Conectando a MongoDB para sembrado de datos...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conexión establecida a MongoDB.");

    // Limpiar colecciones antes de poblar
    await Usuario.deleteMany({});
    await Lectura.deleteMany({});
    console.log("🧹 Colecciones de Usuarios y Lecturas limpiadas.");

    // 1. Crear 3 Usuarios con contraseñas cifradas
    const passwordHash = await bcryptjs.hash("ClaveSegura123*", 10);

    const usuariosData = [
      {
        nombre_completo: "Ana María Gómez",
        email: "ana.gomez@example.com",
        password_hash: "ClaveSegura123*", // El hook pre('save') o la creación directa asignará la contraseña
        fecha_nacimiento: "1995-04-15",
        estado: true,
      },
      {
        nombre_completo: "Carlos Eduardo Mendoza",
        email: "carlos.mendoza@example.com",
        password_hash: "ClaveSegura123*",
        fecha_nacimiento: "1988-11-23",
        estado: true,
      },
      {
        nombre_completo: "Laura Sofía Restrepo",
        email: "laura.restrepo@example.com",
        password_hash: "ClaveSegura123*",
        fecha_nacimiento: "2001-08-05",
        estado: true,
      },
    ];

    // Usamos Usuario.create para activar los hooks de Mongoose (cifrado automático)
    const usuariosCreados = await Usuario.create(usuariosData);
    console.log(`✅ ${usuariosCreados.length} usuarios creados exitosamente en MongoDB:`);
    usuariosCreados.forEach((u, i) => {
      console.log(`   [${i + 1}] ID: ${u._id} | Nombre: ${u.nombre_completo} | Email: ${u.email}`);
    });

    // 2. Crear 4 Lecturas vinculadas mediante relaciones 'ref' reales a los usuarios creados
    const lecturasData = [
      {
        usuario: usuariosCreados[0]._id, // Ref real a Ana María Gómez
        tipo: "Camino de Vida",
        signo_zodiacal: "Aries",
        resultado: "Camino de Vida 7: Persona de mente analítica, introspectiva y orientada a la búsqueda del conocimiento profundo.",
        privada: true,
      },
      {
        usuario: usuariosCreados[0]._id, // Segunda Ref real a Ana María Gómez
        tipo: "Consulta IA Gemini",
        signo_zodiacal: "Aries",
        resultado: "Alquimia Astral: Tu fuego ariano combinado con la sabiduría del número 7 impulsa proyectos innovadores con liderazgo intuitivo.",
        privada: false,
      },
      {
        usuario: usuariosCreados[1]._id, // Ref real a Carlos Mendoza
        tipo: "Carta Astral",
        signo_zodiacal: "Sagitario",
        resultado: "Camino de Vida 11 (Número Maestro): Fuerte canalización intuitiva e inspiración para guiar a otros grupos.",
        privada: true,
      },
      {
        usuario: usuariosCreados[2]._id, // Ref real a Laura Restrepo
        tipo: "Numerologia Alma",
        signo_zodiacal: "Leo",
        resultado: "Número de Alma 3: Corazón expresivo, amante del arte, la comunicación vibrante y el optimismo.",
        privada: true,
      },
    ];

    const lecturasCreadas = await Lectura.create(lecturasData);
    console.log(`\n✅ ${lecturasCreadas.length} lecturas creadas con relaciones 'ref' reales:`);
    lecturasCreadas.forEach((l, i) => {
      console.log(`   [${i + 1}] ID: ${l._id} | Tipo: ${l.tipo} | Usuario Ref: ${l.usuario}`);
    });

    console.log("\n✨ ¡Sembrado de base de datos (Bloque 0) completado exitosamente!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error durante el sembrado de la base de datos:", error);
    process.exit(1);
  }
}

seedDatabase();
