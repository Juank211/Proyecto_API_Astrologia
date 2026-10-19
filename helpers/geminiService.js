import { GoogleGenAI } from "@google/genai";

/**
 * Ejecuta una operación asíncrona aplicando reintentos con Retroceso Exponencial (Exponential Backoff).
 * Maneja errores transitorios de alta demanda (503) o límites de tasa (429).
 * @param {Function} fn - Función asíncrona a ejecutar
 * @param {number} maxRetries - Número máximo de reintentos
 * @param {number} baseDelayMs - Tiempo base de espera en milisegundos
 */
async function ejecutarConExponentialBackoff(fn, maxRetries = 3, baseDelayMs = 1200) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      attempt++;

      // Detectar si el error es temporal por alta demanda de Google (503 UNAVAILABLE o 429)
      const esErrorTemporal =
        error?.status === 503 ||
        error?.status === 429 ||
        (typeof error?.message === "string" &&
          (error.message.includes("503") ||
            error.message.includes("high demand") ||
            error.message.includes("UNAVAILABLE") ||
            error.message.includes("429")));

      if (!esErrorTemporal || attempt >= maxRetries) {
        throw error;
      }

      // Cálculo de retroceso exponencial con jitter (variación aleatoria)
      const delay = baseDelayMs * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 400);
      console.warn(`⏳ Servidores de Gemini ocupados (503/429). Reintento automático ${attempt}/${maxRetries} en ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

/**
 * Genera una lectura astrológico-numerológica interpretativa usando Google Gemini AI (gemini-3.8-flash).
 * @param {Object} datosUsuario
 * @param {string} datosUsuario.nombre - Nombre completo del usuario
 * @param {string} datosUsuario.fechaNacimiento - Fecha de nacimiento formateada
 * @param {string} datosUsuario.signo - Signo zodiacal solar
 * @param {Object} datosUsuario.numerologia - Objeto con caminoVida, expresion y alma
 * @returns {Promise<string>} Texto interpretativo generado por Gemini AI o lectura de respaldo
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

Mantén un tono empático, profundo y revelador. Sé muy conciso y directo: escribe exactamente 1 o 2 oraciones por cada sección (máximo 150 palabras en total).
`;

    // Ejecución con reintentos automáticos ante saturación temporal de Gemini
    const response = await ejecutarConExponentialBackoff(async () => {
      return await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          maxOutputTokens: 300, // Límite estricto de tokens de salida para optimizar cuota
          temperature: 0.7,     // Equilibrio entre precisión y creatividad cósmica
        },
      });
    }, 3, 1200);

    if (response && response.text) {
      return response.text;
    } else {
      return generarLecturaFallback(nombre, signo, camino, expresion, alma);
    }
  } catch (error) {
    const esAltaDemanda =
      error?.status === 503 ||
      error?.message?.includes("503") ||
      error?.message?.includes("high demand") ||
      error?.message?.includes("UNAVAILABLE");

    if (esAltaDemanda) {
      console.warn("⚠️ Los servidores de Gemini siguen saturados tras reintentos (503). Entregando lectura interpretativa local sin interrumpir la app.");
    } else {
      console.error("Error al comunicarse con la API de Google Gemini:", error.message || error);
    }

    return generarLecturaFallback(nombre, signo, camino, expresion, alma);
  }
}

/**
 * Lectura de respaldo cuando no hay clave API o cuando los servidores de IA experimentan alta demanda.
 */
function generarLecturaFallback(nombre, signo, camino, expresion, alma) {
  return `
### 🔮 1. Alquimia Astral y Cósmica
Saludos, **${nombre}**. Tu signo solar **${signo}** se entrelaza con la energía del **Camino de Vida ${camino.numero}** (${camino.titulo}). Esta combinación te otorga una fuerte determinación interior para forjar tu propio destino con originalidad y propósito.

### 🧭 2. El Propósito de tu Alma y Talentos
Tu **Número de Expresión ${expresion.numero}** (${expresion.titulo}) revela una vocación hacia la creatividad y el desarrollo personal, mientras que tu **Número de Alma ${alma.numero}** (${alma.titulo}) destaca una búsqueda constante de armonía y verdad interior en tus decisiones cotidianas.

### 🌟 3. Consejo de Luz del Universo
Confía en tu intuición y en la sabiduría del universo. Tu mapa astrológico y numerológico señala que estás en el camino correcto para expandir tus fortalezas y alcanzar tus aspiraciones más elevadas.
`;
}
