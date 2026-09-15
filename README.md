# 🔮 API de Autenticación, Astrología, Numerología & IA Gemini (AstroPortal)

API REST robusta y aplicación web desarrollada en **Node.js** y **Express** con **MongoDB / Mongoose**, validación de datos en capas, autenticación mediante **JSON Web Tokens (JWT)**, hashing criptográfico de contraseñas con **bcryptjs**, cálculo de **Numerología Pitagórica** e integración con la inteligencia artificial **Google Gemini AI**.

---

## 📁 Estructura del Proyecto

```
Astrologia/
├── database/
│   ├── cnxMongoDB.js          # Conexión a la base de datos MongoDB Atlas
│   └── seedDB.js              # Script de sembrado de datos de prueba (Bloque 0)
├── controllers/
│   ├── usuario.controller.js  # Lógica de registro, login, perfil y lecturas con Gemini AI
│   └── lectura.controller.js  # CRUD de lecturas con relaciones .populate("usuario")
├── helpers/
│   ├── generarJWT.js          # Emisión de tokens firmados (4h de expiración)
│   ├── numerologia.helper.js  # Cálculos de Camino de Vida, Expresión y Alma (Pitagórico)
│   └── geminiService.js       # Integración con el SDK @google/genai (modelo gemini-2.5-flash)
├── middlewares/
│   ├── validarCampos.js       # Interceptor de errores de express-validator (400)
│   └── validarJWT.js          # Escudo de seguridad para rutas privadas (401)
├── models/
│   ├── Usuario.model.js       # Schema de Usuarios con Hooks y métodos toJSON
│   └── Lectura.model.js       # Schema de Lecturas con relación ref a Users
├── public/                    # Frontend Web AstroPortal (Glassmorphism & Dark Cosmic Theme)
│   ├── index.html             # Interfaz de usuario (Login, Registro, Mapa Numerológico, IA)
│   ├── css/styles.css         # Hoja de estilos responsiva con animaciones y gradientes
│   └── js/main.js             # Lógica del cliente, JWT en localStorage e integración API
├── routes/
│   ├── usuario.routes.js      # Rutas de autenticación, perfil e IA Gemini
│   └── lectura.routes.js      # Rutas de la colección Lecturas (.populate)
├── validators/
│   └── usuario.validator.js   # Reglas de sanitización y validación de entrada
├── Documentacion/
│   └── LISTA_ENDPOINTS_ATAQUE.md # Guía para laboratorio de Ataque y Defensa
├── .env                       # Variables de entorno
├── app.js                     # Servidor Express principal
└── package.json               # Dependencias y scripts
```

---

## ⚙️ Variables de Entorno (`.env`)

Crea o configura el archivo `.env` en la raíz del proyecto:

```env
PORT=3000
MONGO_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/<nombre_bd>
SECRETORPRIVATEKEY=TuClaveSecretaParaFirmarJWT_2026!
GEMINI_API_KEY=TuClaveAPIDeGoogleGemini
```

---

## 🚀 Instalación y Puesta en Marcha

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Sembrar base de datos con datos de prueba (Bloque 0):**
   ```bash
   node database/seedDB.js
   ```

3. **Iniciar servidor en modo desarrollo (con nodemon):**
   ```bash
   npm run dev
   ```

4. **Acceder a la aplicación web:**
   Abre tu navegador en **`http://localhost:3000`**

---

## ✨ Características Principales

1. **Autenticación Segura (JWT & bcryptjs):**
   * Registro con sanitización de contraseñas mediante hook `pre('save')`.
   * Inicio de sesión no bloqueante y generación de JWT con expiración de 4h.
   * Middleware de seguridad `validarJWT` para protección de rutas privadas.

2. **Cálculos de Numerología Pitagórica Central:**
   * **Camino de Vida (Life Path):** Reducción de fecha de nacimiento.
   * **Número de Expresión:** Suma pitagórica del nombre completo.
   * **Número de Alma:** Suma de las vocales del nombre completo.
   * Soporte para números simples (1-9) y Números Maestros (11, 22, 33).

3. **Generación de Lecturas con Inteligencia Artificial (Google Gemini):**
   * Integración con el modelo `gemini-2.5-flash` a través del SDK `@google/genai`.
   * Lecturas astrológico-numerológicas interpretativas en español estructuradas dinámicamente.

4. **Relaciones en MongoDB (`ref` & `.populate`):**
   * Colección `Lecturas` vinculada mediante `ref` hacia `Users`.
   * Consultas enriquecidas que retornan los datos del usuario asociado.

---

## 📑 Documentación de Endpoints

### 🔓 Autenticación (Público)

* **`POST /api/v1/auth/register`**: Registrar nuevo usuario.
* **`POST /api/v1/auth/login`**: Autenticar usuario y obtener JWT.

### 🔒 Perfil e IA Gemini (Protegido - Requiere `x-token` o `Authorization: Bearer <token>`)

* **`GET /api/v1/auth/perfil`**: Obtener datos del usuario autenticado + Mapa Numerológico Central.
* **`POST /api/v1/auth/lectura-gemini`**: Generar lectura interpretativa con Google Gemini AI.

### 📚 Colección Lecturas (Relación `ref`)

* **`GET /api/v1/lecturas`**: Listar todas las lecturas con información poblada del usuario (`.populate("usuario")`).
* **`GET /api/v1/lecturas/:id`**: Consultar lectura específica por ObjectId.
* **`POST /api/v1/lecturas`**: Crear una lectura asociada al usuario autenticado (Protegida).
* **`DELETE /api/v1/lecturas/:id`**: Eliminar una lectura (Protegida).
