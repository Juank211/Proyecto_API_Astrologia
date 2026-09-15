ATAQUE #1: (Datos faltantes o con error)
•	Petición: POST
•	Body: {
  "email": "prueba@prueba.com"
}
Respondió: 400 Bad Request + 
{
    "mensaje": "Error de validación",
    "errores": [
        {
            "campo": "nombre_completo",
            "mensaje": "El nombre completo es obligatorio"
        },
        {
            "campo": "nombre_completo",
            "mensaje": "El nombre completo debe tener entre 2 y 100 caracteres"
        },
        {
            "campo": "password_hash",
            "mensaje": "La contraseña es obligatoria"
        },
        {
            "campo": "password_hash",
            "mensaje": "La contraseña debe tener al menos 6 caracteres"
        },
        {
            "campo": "fecha_nacimiento",
            "mensaje": "La fecha de nacimiento es obligatoria"
        },
        {
            "campo": "fecha_nacimiento",
            "mensaje": "La fecha debe tener formato válido (YYYY-MM-DD)"
        }
    ]
}
•	 Veredicto: DEFENDIDO 
•	Qué noté: El servidor valido correctamente los campos requeridos y no dejo pasar la peticion.


