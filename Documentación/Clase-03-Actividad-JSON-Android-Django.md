# Clase 03 — Actividad Asincrónica de Aprendizaje

**TECNICATURA SUPERIOR EN Desarrollo Web y Aplicaciones Digitales**

| Campo | Dato |
|-------|------|
| **Módulo** | Programador de Aplicaciones para Móviles — TSDWAD |
| **Clase** | 03 Actividad |
| **Tema** | JSON y comunicación entre Android y el servidor |
| **Proyecto** | Mano a Mano |
| **Alumno** | _(Nombre y apellido)_ |
| **DNI** | _(_ _ _ _ _ _ _ _ _)_ |
| **Correo electrónico** | _(_ _ _ @ _ _ _ )_ |

---

## Actividad

Identificar los **JSON** utilizados por el Backend Django existente (consumido hoy por Angular). No se crean formatos nuevos: se documentan los mismos servicios que luego podrá consumir Android.

Para cada endpoint se indica:

| Dato | ¿Qué informar? |
|------|----------------|
| Endpoint | URL utilizada para comunicarse con Django |
| Método HTTP | GET, POST, PUT, PATCH, DELETE, etc. |
| Qué hace | Para qué se utiliza ese endpoint (breve) |
| JSON enviado | JSON que se envía al servidor, si corresponde |
| JSON recibido | JSON que Django devuelve, si corresponde |
| Código HTTP | Códigos de respuesta (200, 400, 404, etc.) |

**URL base:** `http://localhost:8000/api/`  
**Auth:** cabecera `Authorization: Bearer <token>` en endpoints protegidos.

**Usuarios de prueba (seed `Mano2026!`):** `ana_voluntaria`, `fundacion_manos`, `lucas_ayuda`

---

## Endpoints documentados

### 1. Validar sesión

| Función | Respuesta |
|---------|-----------|
| **Endpoint** | `/api/auth/me/` |
| **Método HTTP** | GET |
| **Qué función cumple** | Comprueba si el JWT sigue válido y devuelve datos del usuario |
| **JSON enviado** | Ninguno |
| **JSON recibido** | `{ "user": { "id": 7, "username": "ana_voluntaria", "first_name": "Ana", "last_name": "Méndez", "perfil": { "rol": "VOL" } } }` |
| **Código HTTP** | 200, 401, 403 |

---

### 2. Login

| Función | Respuesta |
|---------|-----------|
| **Endpoint** | `/api/auth/login/` |
| **Método HTTP** | POST |
| **Qué función cumple** | Autenticar usuario y obtener token JWT |
| **JSON enviado** | `{ "username": "ana_voluntaria", "password": "Mano2026!" }` |
| **JSON recibido** | `{ "user": { "id": 7, "username": "ana_voluntaria", "first_name": "Ana", "last_name": "Méndez", "perfil": { "rol": "VOL" } }, "token": "eyJ..." }` |
| **Código HTTP** | 200, 400, 401, 403 |

---

### 3. Registro de usuario

| Función | Respuesta |
|---------|-----------|
| **Endpoint** | `/api/usuarios/` |
| **Método HTTP** | POST |
| **Qué función cumple** | Alta de un usuario nuevo (no inicia sesión automática) |
| **JSON enviado** | `{ "username": "juan_perez", "email": "juan.perez@email.com", "password": "Demo1234", "first_name": "Juan", "last_name": "Pérez" }` |
| **JSON recibido** | `{ "username": "juan_perez", "email": "juan.perez@email.com", "first_name": "Juan", "last_name": "Pérez" }` |
| **Código HTTP** | 201, 400 |

---

### 4. Listado de oportunidades

| Función | Respuesta |
|---------|-----------|
| **Endpoint** | `/api/oportunidades/?activa=true` |
| **Método HTTP** | GET |
| **Qué función cumple** | Listar convocatorias activas (catálogo / feed) |
| **JSON enviado** | Ninguno |
| **JSON recibido** | `[ { "id": 11, "titulo": "Búsqueda de personal", "ubicacion": "Córdoba", "organizacion": { "id": 7, "nombre": "Mi org de prueba" }, "causa": { "id": 3, "nombre": "Salud y bienestar" }, "tipo_actividad": { "id": 10, "nombre": "Deporte, recreación y actividades al aire libre" }, "disponibilidad": "24 hs", "cupos": 1, "fecha_actividad": null, "activa": true, "imagen_url": "http://10.0.2.2:8000/api/oportunidades/11/imagen/?v=1780440638", "resumen": "Se buscan voluntarios para apoyo logístico en Córdoba capital." } ]` |
| **Código HTTP** | 200 |

---

### 5. Detalle de oportunidad

| Función | Respuesta |
|---------|-----------|
| **Endpoint** | `/api/oportunidades/{id}/` |
| **Método HTTP** | GET |
| **Qué función cumple** | Obtener el detalle completo de una convocatoria |
| **JSON enviado** | Ninguno |
| **JSON recibido** | `{ "id": 11, "titulo": "Búsqueda de personal", "descripcion": "Se buscan voluntarios para apoyo logístico en Córdoba capital.", "ubicacion": "Córdoba", "disponibilidad": "24 hs", "requisitos": "Disponibilidad horaria flexible y buena predisposición.", "cupos": 1, "fecha_actividad": null, "activa": true, "causa": { "id": 3, "nombre": "Salud y bienestar" }, "tipo_actividad": { "id": 10, "nombre": "Deporte, recreación y actividades al aire libre" }, "organizacion": { "id": 7, "nombre_publico": "Mi org de prueba", "descripcion": "Organización social de demostración.", "email_contacto": "contacto@miorg.org", "telefono": "351-555-0100", "sitio_web": "https://miorg.org" }, "imagen_url": "http://10.0.2.2:8000/api/oportunidades/11/imagen/?v=1780440638", "updated_at": "2026-06-02T19:50:38.998446-03:00" }` |
| **Código HTTP** | 200, 404 |

---

### 6. Perfil extendido

| Función | Respuesta |
|---------|-----------|
| **Endpoint** | `/api/auth/perfil/` |
| **Método HTTP** | GET |
| **Qué función cumple** | Obtener el perfil completo del usuario logueado (email, teléfono, intereses, disponibilidad y organización si aplica) |
| **JSON enviado** | Ninguno |
| **JSON recibido** | `{ "user": { "id": 7, "username": "ana_voluntaria", "first_name": "Ana", "last_name": "Méndez", "email": "ana.mendez@email.com", "perfil": { "rol": "VOL", "telefono": "", "intereses_causas": "Educación, niños", "disponibilidad_resumen": "Tardes entre semana" }, "organizacion": null } }` |
| **Código HTTP** | 200, 401, 403 |

> Diferencia con `/api/auth/me/`: `me` trae datos mínimos (id, username, nombre, rol); `perfil` agrega email, teléfono, intereses, disponibilidad y `organizacion`.

---

### 7. Cerrar sesión

| Función | Respuesta |
|---------|-----------|
| **Endpoint** | `/api/auth/logout/` |
| **Método HTTP** | POST |
| **Qué función cumple** | Invalidar el JWT en el servidor (blacklist) y cerrar sesión |
| **JSON enviado** | `{}` |
| **JSON recibido** | `{ "detail": "Sesión cerrada correctamente." }` |
| **Código HTTP** | 200, 401, 403 |

---

# Separador — Endpoints adicionales

---

### 8. Crear organización

| Función | Respuesta |
|---------|-----------|
| **Endpoint** | `/api/organizaciones/` |
| **Método HTTP** | POST |
| **Qué función cumple** | Crear organización (el propietario es el usuario autenticado) |
| **JSON enviado** | `{ "nombre_publico": "Mi org de prueba", "descripcion": "Descripción breve", "email_contacto": "org@email.com", "telefono": "351-0000000", "sitio_web": "" }` |
| **JSON recibido** | `{ "id": 8, "nombre_publico": "Mi org de prueba", "descripcion": "Descripción breve", "email_contacto": "org@email.com", "telefono": "351-0000000", "sitio_web": "" }` |
| **Código HTTP** | 201, 400, 401, 403 |

---

### 9. Editar organización

| Función | Respuesta |
|---------|-----------|
| **Endpoint** | `/api/organizaciones/{id}/` |
| **Método HTTP** | PATCH |
| **Qué función cumple** | Editar organización (solo el dueño) |
| **JSON enviado** | `{ "descripcion": "Nueva descripción actualizada", "telefono": "351-1111111" }` |
| **JSON recibido** | `{ "id": 8, "nombre_publico": "Mi org de prueba", "descripcion": "Nueva descripción actualizada", "email_contacto": "org@email.com", "telefono": "351-1111111", "sitio_web": "" }` |
| **Código HTTP** | 200, 400, 403, 404 |

---

### 10. Eliminar organización

| Función | Respuesta |
|---------|-----------|
| **Endpoint** | `/api/organizaciones/{id}/` |
| **Método HTTP** | DELETE |
| **Qué función cumple** | Eliminar organización (solo el dueño) |
| **JSON enviado** | Ninguno |
| **JSON recibido** | Sin cuerpo (`204 No Content`) |
| **Código HTTP** | 204, 403, 404 |

---

### 11. Enviar mensaje

| Función | Respuesta |
|---------|-----------|
| **Endpoint** | `/api/mensajes/` |
| **Método HTTP** | POST |
| **Qué función cumple** | Enviar un mensaje (remitente = usuario autenticado) |
| **JSON enviado** | `{ "destinatario": 5, "oportunidad": 11, "cuerpo": "Hola, me interesa participar. ¿Sigue abierta?" }` |
| **JSON recibido** | `{ "id": 9, "remitente": 7, "remitente_username": "ana_voluntaria", "destinatario": 5, "destinatario_username": "fundacion_manos", "oportunidad": 11, "cuerpo": "Hola, me interesa participar. ¿Sigue abierta?", "created_at": "..." }` |
| **Código HTTP** | 201, 400, 403 |

`oportunidad` puede ser `null`.

---

### 12. Bandeja de mensajes

| Función | Respuesta |
|---------|-----------|
| **Endpoint** | `/api/mensajes/bandeja/?usuario={id}` |
| **Método HTTP** | GET |
| **Qué función cumple** | Consultar mensajes recibidos y enviados del usuario autenticado (`usuario` obligatorio y propio) |
| **JSON enviado** | Ninguno |
| **JSON recibido** | `{ "recibidos": [ { "id": 9, "remitente": 7, "remitente_username": "ana_voluntaria", "destinatario": 5, "destinatario_username": "fundacion_manos", "oportunidad": 11, "cuerpo": "...", "created_at": "..." } ], "enviados": [] }` |
| **Código HTTP** | 200, 400, 403 |

---

## Tabla resumen

| Endpoint | Método | Función | Token | HTTP |
|----------|--------|---------|-------|------|
| `/api/auth/me/` | GET | Validar sesión | Sí | 200, 401, 403 |
| `/api/auth/login/` | POST | Login | No | 200, 400, 401, 403 |
| `/api/usuarios/` | POST | Registro | No | 201, 400 |
| `/api/oportunidades/?activa=true` | GET | Listado | No | 200 |
| `/api/oportunidades/{id}/` | GET | Detalle | No | 200, 404 |
| `/api/auth/perfil/` | GET | Perfil extendido | Sí | 200, 401, 403 |
| `/api/auth/logout/` | POST | Logout | Sí | 200, 401, 403 |
| `/api/organizaciones/` | POST | Crear organización | Sí | 201, 400, 401, 403 |
| `/api/organizaciones/{id}/` | PATCH | Editar organización | Sí | 200, 400, 403, 404 |
| `/api/organizaciones/{id}/` | DELETE | Eliminar organización | Sí | 204, 403, 404 |
| `/api/mensajes/` | POST | Enviar mensaje | Sí | 201, 400, 403 |
| `/api/mensajes/bandeja/?usuario={id}` | GET | Bandeja | Sí | 200, 400, 403 |

---

## Fuentes

| Fuente | Ubicación |
|--------|-----------|
| Rutas API | `Backend/api/urls.py` |
| Vistas | `Backend/api/views.py` |
| Serializers | `Backend/api/serializers.py` |
| Consumo Angular | `Frontend/src/app/` |

---

*Clase 03 Actividad — Proyecto Mano a Mano. Formato según consigna. Septiembre 2026.*
