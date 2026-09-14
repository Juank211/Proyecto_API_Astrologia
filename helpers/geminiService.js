import { GoogleGenAI } from "@google/genai";

/**
 * Genera una lectura astrológico-numerológica interpretativa usando Google Gemini AI (gemini-2.5-flash).
 * @param {Object} datosUsuario
 * @param {string} datosUsuario.nombre - Nombre completo del usuario
 * @param {string} datosUsuario.fechaNacimiento - Fecha de nacimiento formateada
 * @param {string} datosUsuario.signo - Signo zodiacal solar
 * @param {Object} datosUsuario.numerologia - Objeto con caminoVida, expresion y alma
 * @returns {Promise<string>} Texto interpretativo generado por Gemini AI
 */
export async function generarLecturaGeminiService(datosUsuario) {
  const apiKey = process.env.GEMINI_API_KEY;

  const { nombre, fechaNacimiento, signo, numerologia } = datosUsuario;
  const camino = numerologia.caminoVida;
  const expresion = numerologia.expresion;
  const alma = numerologia.alma;

  // Si no hay API Key configurada en .env, devolvemos un fallback informativo elegante
  if (!apiKey) {
    console.warn("⚠️ GEMINI_API_KEY no encontrada en .env. Usando lectura generativa local de respaldo.");
    return generarLecturaFallback(nombre, signo, camino, expresion, alma);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
Eres un místico, astrologo y numerólogo experto con profunda sabiduría cósmica.
Genera una lectura personalizada, inspiradora, profesional y reveladora en español para la siguiente persona:

- Nombre Completo: ${nombre}
- Signo Zodiacal Solar: ${signo}
- Fecha de Nacimiento: ${fechaNacimiento}
- Número de Camino de Vida: ${camino.numero} (${camino.titulo})
- Número de Expresión (Destino): ${expresion.numero} (${expresion.titulo})
- Número de Alma (Deseo Interior): ${alma.numero} (${alma.titulo})

Estructura la lectura exactamente en 3 secciones bien definidas usando encabezados en formato Markdown y emojis:

### 🔮 1. Alquimia Astral y Cósmica
(Analiza la combinación entre su signo solar ${signo} y su Camino de Vida ${camino.numero}).

### 🧭 2. El Propósito de tu Alma y Talentos
(Sintetiza la sinergia entre su Número de Expresión ${expresion.numero} y su Deseo de Alma ${alma.numero}).

### 🌟 3. Consejo de Luz del Universo
(Entrega una reflexión de crecimiento personal y un consejo práctico para su momento actual).

Mantén un tono empático, profundo y motivador. Máximo 350 palabras.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    if (response && response.text) {
      return response.text;
    } else {
      return generarLecturaFallback(nombre, signo, camino, expresion, alma);
    }
  } catch (error) {
    console.error("Error al comunicarse con la API de Google Gemini:", error);
    return generarLecturaFallback(nombre, signo, camino, expresion, alma);
  }
}

/**
 * Lectura de respaldo cuando no hay clave API o falla la conexión
 */
function generarLecturaFallback(nombre, signo, camino, expresion, alma) {
  return `
### 🔮 1. Alquimia Astral y Cósmica
Saludos, **${nombre}**. Tu signo solar **${signo}** se entrelaza con la energía del **Camino de Vida ${camino.numero}** (${camino.titulo}). Esta combinación te otorga una fuerte determinación interior para forjar tu propio destino con originalidad y propósito.

### 🧭 2. El Propósito de tu Alma y Talentos
Tu **Número de Expresión ${expresion.numero}** (${expresion.titulo}) revela una vocación hacia la creatividad y el desarrollo personal, mientras que tu **Número de Alma ${alma.numero}** (${alma.titulo}) destaca una búsqueda constante de armonía y verdad interior en tus decisiones cotidianas.

### 🌟 3. Consejo de Luz del Universo
Confía en tu intuición y en la sabiduría del universo. Tu mapa astrológico y numerológico señala que estás en el camino correcto para expandir tus fortalezas y alcanzar tus aspiraciones más elevadas.

*(Nota: Para obtener lecturas dinámicas avanzadas en tiempo real con inteligencia artificial, agrega tu **GEMINI_API_KEY** en el archivo .env)*
`;
}
