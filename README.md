# 🔮 API de Autenticación y Astrología / Numerología

API REST robusta desarrollada en **Node.js** y **Express** con base de datos **MongoDB / Mongoose**, implementando validación de datos en capas, autenticación mediante **JSON Web Tokens (JWT)** y hashing criptográfico de contraseñas con **bcryptjs**.

---

## 📁 Estructura del Proyecto

```
Astrologia/
├── config / database/
│   └── cnxMongoDB.js          # Conexión a la base de datos MongoDB Atlas
├── controllers/
│   └── usuario.controller.js  # Lógica de registro, login y perfil de usuario
├── helpers/
│   └── generarJWT.js          # Emisión de tokens firmados (4h de expiración)
├── middlewares/
│   ├── validarCampos.js       # Interceptor de errores de express-validator (400)
│   └── validarJWT.js          # Escudo de seguridad para rutas privadas (401)
├── models/
│   └── Usuario.model.js       # Schema de Mongoose con Hooks y métodos toJSON
├── routes/
│   └── usuario.routes.js      # Definición de rutas públicas y protegidas
├── validators/
│   └── usuario.validator.js   # Reglas de sanitización y validación de entrada
├── .env                       # Variables de entorno
├── app.js                     # Servidor Express principal
└── package.json               # Dependencias y scripts
```

---

## ⚙️ Variables de Entorno (`.env`)

Crea o configura el archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
PORT=3000
MONGO_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/<nombre_bd>
SECRETORPRIVATEKEY=TuClaveSecretaParaFirmarJWT_2026!
```

---

## 🚀 Instalación y Puesta en Marcha

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Iniciar en modo desarrollo (con nodemon):**
   ```bash
   npm run dev
   ```

---

## 🛡️ Mejoras de Seguridad y Rendimiento Implementadas

1. **Cifrado Automático con Hook `pre('save')` (Mongoose):**
   * Antes de almacenar cualquier usuario en MongoDB, el modelo intercepta la contraseña y genera el hash con `bcryptjs` de forma automática.
   * Cuenta con la condición `this.isModified("password_hash")` para evitar re-hashear contraseñas existentes al actualizar otros campos.

2. **Sanitización de Respuestas con `.toJSON()`:**
   * El modelo excluye automáticamente el campo `password_hash` y `__v` de cualquier respuesta enviada al cliente, protegiendo la privacidad de los usuarios.

3. **Operaciones Criptográficas Asíncronas (No Bloqueantes):**
   * Se utilizan `await bcryptjs.hash()` y `await bcryptjs.compare()` para no congelar el *Event Loop* de Node.js ante múltiples peticiones simultáneas.

4. **Control de Estado de Usuario (`estado`):**
   * Se incluye el campo `estado: { type: Boolean, default: true }`.
   * Tanto el inicio de sesión como el middleware `validarJWT` verifican que la cuenta del usuario no esté deshabilitada.

---

## 📑 Documentación de Endpoints

**URL Base:** `http://localhost:3000/api/v1/auth`

### 1. Registrar Usuario
* **Método:** `POST`
* **Ruta:** `/register`
* **Acceso:** Público (validado por `express-validator`)
* **Body (JSON):**
  ```json
  {
    "nombre_completo": "Ana María Gómez",
    "email": "ana.gomez@example.com",
    "password_hash": "claveSegura123*",
    "fecha_nacimiento": "1995-04-15"
  }
  ```
* **Respuestas:**
  * `201 Created`: Usuario registrado con contraseña cifrada (hash oculto en respuesta).
  * `400 Bad Request`: Error de validación (campos faltantes, fecha futura o correo duplicado).

---

### 2. Iniciar Sesión
* **Método:** `POST`
* **Ruta:** `/login`
* **Acceso:** Público
* **Body (JSON):**
  ```json
  {
    "email": "ana.gomez@example.com",
    "password_hash": "claveSegura123*"
  }
  ```
* **Respuestas:**
  * `200 OK`:
    ```json
    {
      "mensaje": "Inicio de sesion exitoso",
      "usuario": {
        "_id": "64f1...",
        "nombre_completo": "Ana María Gómez",
        "email": "ana.gomez@example.com",
        "fecha_nacimiento": "1995-04-15T00:00:00.000Z",
        "estado": true
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```
  * `400 Bad Request`: Credenciales incorrectas o usuario inactivo.

---

### 3. Obtener Perfil (Ruta Protegida)
* **Método:** `GET`
* **Ruta:** `/perfil`
* **Acceso:** Privado (requiere Token)
* **Headers:**
  * `x-token: <tu_token_jwt>` *(o `Authorization: Bearer <tu_token_jwt>`)*
* **Respuestas:**
  * `200 OK`: Retorna los datos del usuario autenticado inyectados en `req.usuario`.
  * `401 Unauthorized`: No hay token o el token no es válido/expiró.
