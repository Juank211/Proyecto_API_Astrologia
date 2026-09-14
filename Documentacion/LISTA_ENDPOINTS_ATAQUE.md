# ⚔️ Ficha de Preparación de la API — Bloque 0 (Laboratorio de Ataque y Defensa)

Esta guía contiene la información necesaria para exponer la API mediante un túnel público y la lista completa de endpoints con datos de prueba reales para entregar a tu compañero.

---

## 🌐 1. Instrucciones para Exponer tu Servidor (Túnel)

Asegúrate de tener el servidor corriendo en una terminal con:
```bash
npm run dev
```

En **otra terminal**, ejecuta uno de los siguientes comandos para crear la URL del túnel público:

### Opción A (localtunnel - sin instalación previa):
```bash
npx localtunnel --port 3000
```
> **Nota:** Copia la URL generada (ejemplo: `https://astrologia-api-test.loca.lt`).

### Opción B (ngrok):
```bash
ngrok http 3000
```
> **Nota:** Copia la URL forwarding generada (ejemplo: `https://abcd-123.ngrok-free.app`).

---

## 🔑 2. Usuarios de Prueba Creados (Base de Datos Sembrada)

* **Contraseña universal de prueba:** `ClaveSegura123*`

| Usuario | Correo Electrónico | Contraseña |
| :--- | :--- | :--- |
| Ana María Gómez | `ana.gomez@example.com` | `ClaveSegura123*` |
| Carlos Eduardo Mendoza | `carlos.mendoza@example.com` | `ClaveSegura123*` |
| Laura Sofía Restrepo | `laura.restrepo@example.com` | `ClaveSegura123*` |

---

## 📡 3. Lista Completa de Endpoints

**URL Base del Túnel:** `<TU_URL_DEL_TUNEL>` (reemplazar con la URL obtenida arriba)

### 🔓 A. Autenticación (Público)

#### 1. Registrar Usuario
* **Método:** `POST`
* **Ruta:** `<TU_URL_DEL_TUNEL>/api/v1/auth/register`
* **Headers:** `Content-Type: application/json`
* **Body (JSON):**
  ```json
  {
    "nombre_completo": "Pedro Picapiedra",
    "email": "pedro.p@example.com",
    "password_hash": "ClaveSegura123*",
    "fecha_nacimiento": "1990-05-20"
  }
  ```

#### 2. Iniciar Sesión
* **Método:** `POST`
* **Ruta:** `<TU_URL_DEL_TUNEL>/api/v1/auth/login`
* **Headers:** `Content-Type: application/json`
* **Body (JSON):**
  ```json
  {
    "email": "ana.gomez@example.com",
    "password_hash": "ClaveSegura123*"
  }
  ```
* **Respuesta de éxito:** Devuelve el campo `token`.

---

### 🔒 B. Perfil e Inteligencia Artificial (Protegidos con JWT)

#### 3. Obtener Perfil Autenticado y Numerología Central
* **Método:** `GET`
* **Ruta:** `<TU_URL_DEL_TUNEL>/api/v1/auth/perfil`
* **Headers:** `x-token: <TU_TOKEN_JWT>` *(o `Authorization: Bearer <TU_TOKEN_JWT>`)*

#### 4. Generar Lectura Interpretativa con IA Gemini
* **Método:** `POST`
* **Ruta:** `<TU_URL_DEL_TUNEL>/api/v1/auth/lectura-gemini`
* **Headers:** 
  * `Content-Type: application/json`
  * `x-token: <TU_TOKEN_JWT>`
* **Body (JSON):**
  ```json
  {
    "signo": "Aries"
  }
  ```

---

### 📚 C. Colección de Lecturas con Relación `ref` (Público / Protegido)

#### 5. Listar Todas las Lecturas (con `.populate("usuario")`)
* **Método:** `GET`
* **Ruta:** `<TU_URL_DEL_TUNEL>/api/v1/lecturas`
* **Descripción:** Retorna las lecturas registradas resolviendo la relación `ref` para incluir los datos reales del usuario creador (`nombre_completo`, `email`, `fecha_nacimiento`).

#### 6. Obtener Lectura por ID
* **Método:** `GET`
* **Ruta:** `<TU_URL_DEL_TUNEL>/api/v1/lecturas/:id`
* **Ejemplo con ID real:** `<TU_URL_DEL_TUNEL>/api/v1/lecturas/6aa80ab6c3d1303a57483ca5`

#### 7. Crear Nueva Lectura (Protegido)
* **Método:** `POST`
* **Ruta:** `<TU_URL_DEL_TUNEL>/api/v1/lecturas`
* **Headers:** 
  * `Content-Type: application/json`
  * `x-token: <TU_TOKEN_JWT>`
* **Body (JSON):**
  ```json
  {
    "tipo": "Compatibilidad",
    "signo_zodiacal": "Tauro",
    "resultado": "Compatibilidad alta entre Fuego y Tierra para proyectos creativos.",
    "privada": true
  }
  ```

#### 8. Eliminar Lectura (Protegido)
* **Método:** `DELETE`
* **Ruta:** `<TU_URL_DEL_TUNEL>/api/v1/lecturas/:id`
* **Headers:** `x-token: <TU_TOKEN_JWT>`
