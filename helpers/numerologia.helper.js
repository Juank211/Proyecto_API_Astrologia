/**
 * ==========================================================================
 * HELPER DE CÁLCULOS NUMEROLÓGICOS (SISTEMA PITAGÓRICO)
 * ==========================================================================
 */

// Tabla Pitagórica de conversión de letras a números
const TABLA_PITAGORICA = {
  a: 1, j: 1, s: 1, á: 1,
  b: 2, k: 2, t: 2,
  c: 3, l: 3, u: 3, ú: 3, ü: 3,
  d: 4, m: 4, v: 4,
  e: 5, n: 5, ñ: 5, w: 5, é: 5,
  f: 6, o: 6, x: 6, ó: 6,
  g: 7, p: 7, y: 7,
  h: 8, q: 8, z: 8,
  i: 9, r: 9, í: 9
};

const VOCALES = new Set(['a', 'e', 'i', 'o', 'u', 'á', 'é', 'í', 'ó', 'ú', 'ü']);

/**
 * Reduce un número a un solo dígito (1-9) preservando Números Maestros (11, 22, 33).
 */
export function reducirNumero(num) {
  let actual = Math.abs(parseInt(num, 10));
  if (isNaN(actual) || actual === 0) return 0;

  while (actual > 9 && actual !== 11 && actual !== 22 && actual !== 33) {
    actual = String(actual)
      .split('')
      .reduce((sum, digit) => sum + parseInt(digit, 10), 0);
  }
  return actual;
}

/**
 * 1. CAMINO DE VIDA (Life Path): Suma reducida de la fecha de nacimiento (YYYY-MM-DD)
 */
export function calcularCaminoDeVida(fechaInput) {
  if (!fechaInput) return { numero: 0, titulo: 'Desconocido', significado: '' };

  const fechaStr = typeof fechaInput === 'string' ? fechaInput : fechaInput.toISOString();
  const partes = fechaStr.split('T')[0].split('-');

  if (partes.length < 3) return { numero: 0, titulo: 'Desconocido', significado: '' };

  const anio = reducirNumero(partes[0].split('').reduce((s, d) => s + parseInt(d, 10), 0));
  const mes = reducirNumero(parseInt(partes[1], 10));
  const dia = reducirNumero(parseInt(partes[2], 10));

  const total = reducirNumero(anio + mes + dia);
  return {
    numero: total,
    ...getInterpretacionCorta(total, 'Camino de Vida')
  };
}

/**
 * 2. NÚMERO DE EXPRESIÓN (Destino): Suma reducida de todas las letras del nombre completo
 */
export function calcularNumeroExpresion(nombreCompleto) {
  if (!nombreCompleto) return { numero: 0, titulo: 'Desconocido', significado: '' };

  const letras = nombreCompleto.toLowerCase().normalize('NFD').replace(/[\u0300-\u06ff]/g, '');
  let suma = 0;

  for (const char of letras) {
    if (TABLA_PITAGORICA[char]) {
      suma += TABLA_PITAGORICA[char];
    }
  }

  const total = reducirNumero(suma);
  return {
    numero: total,
    ...getInterpretacionCorta(total, 'Expresión')
  };
}

/**
 * 3. NÚMERO DE ALMA (Deseo del Corazón): Suma reducida de las VOCALES del nombre completo
 */
export function calcularNumeroAlma(nombreCompleto) {
  if (!nombreCompleto) return { numero: 0, titulo: 'Desconocido', significado: '' };

  const letras = nombreCompleto.toLowerCase();
  let suma = 0;

  for (const char of letras) {
    if (VOCALES.has(char) && TABLA_PITAGORICA[char]) {
      suma += TABLA_PITAGORICA[char];
    }
  }

  const total = reducirNumero(suma);
  return {
    numero: total,
    ...getInterpretacionCorta(total, 'Alma')
  };
}

/**
 * Retorna títulos y resúmenes de significados según el número
 */
function getInterpretacionCorta(num, tipo) {
  const significados = {
    1: { titulo: 'El Líder Innovador', significado: 'Independencia, creatividad, liderazgo y nuevos comienzos.' },
    2: { titulo: 'El Diplomático Harmónico', significado: 'Cooperación, sensibilidad, empatía y trabajo en equipo.' },
    3: { titulo: 'El Comunicador Creativo', significado: 'Autoexpresión, optimismo, arte y alegría de vivir.' },
    4: { titulo: 'El Constructor Estructurado', significado: 'Disciplina, trabajo duro, orden y bases sólidas.' },
    5: { titulo: 'El Explorador Libre', significado: 'Versatilidad, aventura, libertad y adaptabilidad al cambio.' },
    6: { titulo: 'El Nutridor Armónico', significado: 'Responsabilidad, amor familiar, servicio y sanación.' },
    7: { titulo: 'El Buscador Analítico', significado: 'Introspección, sabiduría, espiritualidad y análisis profundo.' },
    8: { titulo: 'El Mánager de Abundancia', significado: 'Poder personal, éxito material, manifestación y autoridad.' },
    9: { titulo: 'El Humanitario Universal', significado: 'Compasión, generosidad, visión global y sabiduría espiritual.' },
    11: { titulo: 'El Maestro Intuición', significado: 'Gran percepción espiritual, iluminación e inspiración divina.' },
    22: { titulo: 'El Maestro Arquitecto', significado: 'Capacidad extraordinaria para materializar grandes sueños universales.' },
    33: { titulo: 'El Maestro Sanador', significado: 'Amor incondicional elevado y servicio devoto a la humanidad.' }
  };

  return significados[num] || { titulo: `Frecuencia ${num}`, significado: `Energía numérica vibracional ${num}.` };
}

/**
 * Función integradora para obtener la plantilla completa de números centrales del usuario
 */
export function obtenerNumerologiaCompleta(usuario) {
  const caminoVida = calcularCaminoDeVida(usuario.fecha_nacimiento);
  const expresion = calcularNumeroExpresion(usuario.nombre_completo);
  const alma = calcularNumeroAlma(usuario.nombre_completo);

  return {
    caminoVida,
    expresion,
    alma
  };
}
