# API completa — Endpoints JSON Mano a Mano

Documentación de **todos** los endpoints del Backend Django (`Backend/api/urls.py`), en el mismo formato de la Clase 03.

Para cada endpoint:

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
**Usuarios demo (password `Mano2026!`):** `ana_voluntaria`, `fundacion_manos`, `lucas_ayuda`

---

## Tabla resumen

| Endpoint | Método | Función | Token | HTTP |
|----------|--------|---------|-------|------|
| `/api/auth/login/` | POST | Login | No | 200, 400, 401, 403 |
| `/api/auth/logout/` | POST | Logout | Sí | 200, 401, 403 |
| `/api/auth/me/` | GET | Sesión mínima | Sí | 200, 401, 403 |
| `/api/auth/perfil/` | GET | Perfil extendido | Sí | 200, 401, 403 |
| `/api/usuarios/` | POST | Registro | No | 201, 400 |
| `/api/organizaciones/?propietario={id}` | GET | Listar org por propietario | No | 200, 400 |
| `/api/organizaciones/` | POST | Crear organización | Sí | 201, 400, 401, 403 |
| `/api/organizaciones/{id}/` | PATCH | Editar organización | Sí | 200, 400, 403, 404 |
| `/api/organizaciones/{id}/` | DELETE | Eliminar organización | Sí | 204, 403, 404 |
| `/api/causas/` | GET | Catálogo de causas | No | 200 |
| `/api/tipos-actividad/` | GET | Catálogo de tipos | No | 200 |
| `/api/oportunidades/?activa=true` | GET | Listado público resumido | No | 200 |
| `/api/oportunidades/?propietario={id}` | GET | Mis publicaciones (CRUD) | Sí | 200, 403 |
| `/api/oportunidades/{id}/` | GET | Detalle | No | 200, 404 |
| `/api/oportunidades/` | POST | Publicar oportunidad | Sí | 201, 400, 401, 403 |
| `/api/oportunidades/{id}/` | PATCH | Editar oportunidad | Sí | 200, 400, 403, 404 |
| `/api/oportunidades/{id}/` | DELETE | Eliminar oportunidad | Sí | 204, 403, 404 |
| `/api/oportunidades/{id}/imagen/` | GET | Imagen binaria | No | 200, 404 |
| `/api/postulaciones/?voluntario={id}` | GET | Listar postulaciones | Sí | 200, 400, 403 |
| `/api/postulaciones/` | POST | Crear postulación | Sí | 201, 400, 403 |
| `/api/postulaciones/{id}/` | PATCH | Cambiar estado | Sí | 200, 400, 403, 404 |
| `/api/postulaciones/bloques-organizador/` | GET | Bloques por oportunidad | Sí | 200, 403 |
| `/api/mensajes/` | POST | Enviar mensaje | Sí | 201, 400, 403 |
| `/api/mensajes/bandeja/?usuario={id}` | GET | Bandeja recibidos/enviados | Sí | 200, 400, 403 |

---

## Autenticación

### 1. Login

| Función | Respuesta |
|---------|-----------|
| **Endpoint** | `/api/auth/login/` |
| **Método HTTP** | POST |
| **Qué función cumple** | Autenticar usuario y obtener token JWT |
| **JSON enviado** | `{ "username": "ana_voluntaria", "password": "Mano2026!" }` |
| **JSON recibido** | `{ "user": { "id": 7, "username": "ana_voluntaria", "first_name": "Ana", "last_name": "Méndez", "perfil": { "rol": "VOL" } }, "token": "eyJ..." }` |
| **Código HTTP** | 200, 400, 401, 403 |

---

### 2. Logout

| Función | Respuesta |
|---------|-----------|
| **Endpoint** | `/api/auth/logout/` |
| **Método HTTP** | POST |
| **Qué función cumple** | Invalidar el JWT en el servidor (blacklist) y cerrar sesión |
| **JSON enviado** | `{}` |
| **JSON recibido** | `{ "detail": "Sesión cerrada correctamente." }` |
| **Código HTTP** | 200, 401, 403 |

---

### 3. Validar sesión (`me`)

| Función | Respuesta |
|---------|-----------|
| **Endpoint** | `/api/auth/me/` |
| **Método HTTP** | GET |
| **Qué función cumple** | Comprobar si el JWT sigue válido y devolver datos mínimos del usuario |
| **JSON enviado** | Ninguno |
| **JSON recibido** | `{ "user": { "id": 7, "username": "ana_voluntaria", "first_name": "Ana", "last_name": "Méndez", "perfil": { "rol": "VOL" } } }` |
| **Código HTTP** | 200, 401, 403 |

---

### 4. Perfil extendido

| Función | Respuesta |
|---------|-----------|
| **Endpoint** | `/api/auth/perfil/` |
| **Método HTTP** | GET |
| **Qué función cumple** | Devolver perfil completo (email, teléfono, intereses, disponibilidad y organización si aplica) |
| **JSON enviado** | Ninguno |
| **JSON recibido** | `{ "user": { "id": 7, "username": "ana_voluntaria", "first_name": "Ana", "last_name": "Méndez", "email": "ana.mendez@email.com", "perfil": { "rol": "VOL", "telefono": "", "intereses_causas": "Educación, niños", "disponibilidad_resumen": "Tardes entre semana" }, "organizacion": null } }` |
| **Código HTTP** | 200, 401, 403 |

---

## Usuarios

### 5. Registro

| Función | Respuesta |
|---------|-----------|
| **Endpoint** | `/api/usuarios/` |
| **Método HTTP** | POST |
| **Qué función cumple** | Alta de un usuario nuevo |
| **JSON enviado** | `{ "username": "juan_perez", "email": "juan.perez@email.com", "password": "Demo1234", "first_name": "Juan", "last_name": "Pérez" }` |
| **JSON recibido** | `{ "username": "juan_perez", "email": "juan.perez@email.com", "first_name": "Juan", "last_name": "Pérez" }` |
| **Código HTTP** | 201, 400 |

---

## Organizaciones

### 6. Listar por propietario

| Función | Respuesta |
|---------|-----------|
| **Endpoint** | `/api/organizaciones/?propietario={id}` |
| **Método HTTP** | GET |
| **Qué función cumple** | Listar organizaciones del usuario indicado (`propietario` obligatorio) |
| **JSON enviado** | Ninguno |
| **JSON recibido** | `[ { "id": 6, "nombre_publico": "Cultura en Barrio", "descripcion": "Red cultural barrial.", "email_contacto": "contacto@culturaenbarrio.org", "telefono": "11-5555-0100", "sitio_web": "https://culturaenbarrio.org" } ]` |
| **Código HTTP** | 200, 400 |

---

### 7. Crear organización

| Función | Respuesta |
|---------|-----------|
| **Endpoint** | `/api/organizaciones/` |
| **Método HTTP** | POST |
| **Qué función cumple** | Crear organización (propietario = usuario autenticado) |
| **JSON enviado** | `{ "nombre_publico": "Mi org de prueba", "descripcion": "Descripción breve", "email_contacto": "org@email.com", "telefono": "351-0000000", "sitio_web": "" }` |
| **JSON recibido** | `{ "id": 8, "nombre_publico": "Mi org de prueba", "descripcion": "Descripción breve", "email_contacto": "org@email.com", "telefono": "351-0000000", "sitio_web": "" }` |
| **Código HTTP** | 201, 400, 401, 403 |

---

### 8. Editar organización

| Función | Respuesta |
|---------|-----------|
| **Endpoint** | `/api/organizaciones/{id}/` |
| **Método HTTP** | PATCH |
| **Qué función cumple** | Editar organización (solo el dueño) |
| **JSON enviado** | `{ "descripcion": "Nueva descripción actualizada", "telefono": "351-1111111" }` |
| **JSON recibido** | `{ "id": 8, "nombre_publico": "Mi org de prueba", "descripcion": "Nueva descripción actualizada", "email_contacto": "org@email.com", "telefono": "351-1111111", "sitio_web": "" }` |
| **Código HTTP** | 200, 400, 403, 404 |

---

### 9. Eliminar organización

| Función | Respuesta |
|---------|-----------|
| **Endpoint** | `/api/organizaciones/{id}/` |
| **Método HTTP** | DELETE |
| **Qué función cumple** | Eliminar organización (solo el dueño) |
| **JSON enviado** | Ninguno |
| **JSON recibido** | Sin cuerpo (`204 No Content`) |
| **Código HTTP** | 204, 403, 404 |

---

## Catálogos

### 10. Causas

| Función | Respuesta |
|---------|-----------|
| **Endpoint** | `/api/causas/` |
| **Método HTTP** | GET |
| **Qué función cumple** | Listar catálogo de causas de voluntariado |
| **JSON enviado** | Ninguno |
| **JSON recibido** | `[ { "id": 1, "nombre": "Educación y alfabetización" }, { "id": 2, "nombre": "Medio ambiente" } ]` |
| **Código HTTP** | 200 |

---

### 11. Tipos de actividad

| Función | Respuesta |
|---------|-----------|
| **Endpoint** | `/api/tipos-actividad/` |
| **Método HTTP** | GET |
| **Qué función cumple** | Listar catálogo de tipos de actividad |
| **JSON enviado** | Ninguno |
| **JSON recibido** | `[ { "id": 1, "nombre": "Accompañamiento a personas mayores" }, { "id": 10, "nombre": "Deporte, recreación y actividades al aire libre" } ]` |
| **Código HTTP** | 200 |

---

## Oportunidades

### 12. Listado público (feed)

| Función | Respuesta |
|---------|-----------|
| **Endpoint** | `/api/oportunidades/?activa=true` |
| **Método HTTP** | GET |
| **Qué función cumple** | Listar convocatorias activas en formato resumido |
| **JSON enviado** | Ninguno |
| **JSON recibido** | `[ { "id": 11, "titulo": "Búsqueda de personal", "ubicacion": "Córdoba", "organizacion": { "id": 7, "nombre": "Mi org de prueba" }, "causa": { "id": 3, "nombre": "..." }, "tipo_actividad": { "id": 10, "nombre": "..." }, "disponibilidad": "24 hs", "cupos": 1, "fecha_actividad": null, "activa": true, "imagen_url": "http://localhost:8000/api/oportunidades/11/imagen/?v=...", "resumen": "..." } ]` |
| **Código HTTP** | 200 |

Query opcionales: `q` (búsqueda), `activa`, `propietario`.

---

### 13. Mis publicaciones

| Función | Respuesta |
|---------|-----------|
| **Endpoint** | `/api/oportunidades/?propietario={id}` |
| **Método HTTP** | GET |
| **Qué función cumple** | Listar publicaciones del propietario autenticado (formato CRUD) |
| **JSON enviado** | Ninguno |
| **JSON recibido** | `[ { "id": 11, "organizacion": 7, "organizacion_nombre": "Mi org de prueba", "titulo": "...", "descripcion": "...", "ubicacion": "...", "causa": 3, "tipo_actividad": 10, "tipo_actividad_nombre": "...", "disponibilidad": "...", "requisitos": "...", "cupos": 1, "fecha_actividad": null, "activa": true, "tiene_imagen": true, "updated_at": "..." } ]` |
| **Código HTTP** | 200, 403 |

---

### 14. Detalle

| Función | Respuesta |
|---------|-----------|
| **Endpoint** | `/api/oportunidades/{id}/` |
| **Método HTTP** | GET |
| **Qué función cumple** | Obtener detalle completo de una convocatoria |
| **JSON enviado** | Ninguno |
| **JSON recibido** | `{ "id": 11, "titulo": "...", "descripcion": "...", "ubicacion": "...", "disponibilidad": "...", "requisitos": "...", "cupos": 1, "fecha_actividad": null, "activa": true, "causa": { "id": 3, "nombre": "..." }, "tipo_actividad": { "id": 10, "nombre": "..." }, "organizacion": { "id": 7, "nombre_publico": "...", "descripcion": "...", "email_contacto": "...", "telefono": "...", "sitio_web": "..." }, "imagen_url": "http://localhost:8000/api/oportunidades/11/imagen/?v=...", "updated_at": "..." }` |
| **Código HTTP** | 200, 404 |

---

### 15. Publicar

| Función | Respuesta |
|---------|-----------|
| **Endpoint** | `/api/oportunidades/` |
| **Método HTTP** | POST |
| **Qué función cumple** | Crear una oportunidad (propietario de la organización) |
| **JSON enviado** | `{ "organizacion": 6, "titulo": "Apoyo escolar vespertino", "descripcion": "Acompañamiento en tareas.", "ubicacion": "Córdoba Capital", "causa": 1, "tipo_actividad": 3, "disponibilidad": "Lunes a jueves 17–19 h", "requisitos": "Paciencia", "cupos": 8, "fecha_actividad": "2026-10-15", "activa": true }` |
| **JSON recibido** | `{ "id": 12, "organizacion": 6, "organizacion_nombre": "Cultura en Barrio", "titulo": "Apoyo escolar vespertino", "descripcion": "Acompañamiento en tareas.", "ubicacion": "Córdoba Capital", "causa": 1, "tipo_actividad": 3, "tipo_actividad_nombre": "Apoyo escolar y tareas dirigidas", "disponibilidad": "Lunes a jueves 17–19 h", "requisitos": "Paciencia", "cupos": 8, "fecha_actividad": "2026-10-15", "activa": true, "tiene_imagen": true, "updated_at": "..." }` |
| **Código HTTP** | 201, 400, 401, 403 |

También acepta `multipart/form-data` con campo opcional `imagen`.

---

### 16. Editar oportunidad

| Función | Respuesta |
|---------|-----------|
| **Endpoint** | `/api/oportunidades/{id}/` |
| **Método HTTP** | PATCH |
| **Qué función cumple** | Editar oportunidad (solo dueño de la organización) |
| **JSON enviado** | `{ "titulo": "Título actualizado", "cupos": 10, "activa": true }` |
| **JSON recibido** | Mismo formato CRUD que al crear (objeto actualizado) |
| **Código HTTP** | 200, 400, 403, 404 |

---

### 17. Eliminar oportunidad

| Función | Respuesta |
|---------|-----------|
| **Endpoint** | `/api/oportunidades/{id}/` |
| **Método HTTP** | DELETE |
| **Qué función cumple** | Eliminar oportunidad (solo dueño) |
| **JSON enviado** | Ninguno |
| **JSON recibido** | Sin cuerpo (`204 No Content`) |
| **Código HTTP** | 204, 403, 404 |

---

### 18. Imagen de portada

| Función | Respuesta |
|---------|-----------|
| **Endpoint** | `/api/oportunidades/{id}/imagen/` |
| **Método HTTP** | GET |
| **Qué función cumple** | Devolver la imagen binaria de la oportunidad |
| **JSON enviado** | Ninguno |
| **JSON recibido** | Binario (`image/png` o `image/jpeg`) — no JSON |
| **Código HTTP** | 200, 404 |

---

## Postulaciones

### 19. Listar

| Función | Respuesta |
|---------|-----------|
| **Endpoint** | `/api/postulaciones/?voluntario={id}` |
| **Método HTTP** | GET |
| **Qué función cumple** | Listar postulaciones del voluntario indicado (`voluntario` obligatorio) |
| **JSON enviado** | Ninguno |
| **JSON recibido** | `[ { "id": 3, "voluntario": 7, "voluntario_username": "ana_voluntaria", "oportunidad": 11, "oportunidad_titulo": "Búsqueda de personal", "organizacion_propietario": 5, "estado": "PEN", "created_at": "..." } ]` |
| **Código HTTP** | 200, 400, 403 |

---

### 20. Crear

| Función | Respuesta |
|---------|-----------|
| **Endpoint** | `/api/postulaciones/` |
| **Método HTTP** | POST |
| **Qué función cumple** | Postularse a una oportunidad (voluntario = usuario autenticado; estado inicial `PEN`) |
| **JSON enviado** | `{ "oportunidad": 11 }` |
| **JSON recibido** | `{ "id": 3, "voluntario": 7, "voluntario_username": "ana_voluntaria", "oportunidad": 11, "oportunidad_titulo": "Búsqueda de personal", "organizacion_propietario": 5, "estado": "PEN", "created_at": "..." }` |
| **Código HTTP** | 201, 400, 403 |

---

### 21. Cambiar estado

| Función | Respuesta |
|---------|-----------|
| **Endpoint** | `/api/postulaciones/{id}/` |
| **Método HTTP** | PATCH |
| **Qué función cumple** | Actualizar estado: organización `PEN`/`ACE`/`REC`; voluntario solo `CAN` |
| **JSON enviado** | `{ "estado": "ACE" }` |
| **JSON recibido** | `{ "id": 3, "voluntario": 7, "voluntario_username": "ana_voluntaria", "oportunidad": 11, "oportunidad_titulo": "Búsqueda de personal", "organizacion_propietario": 5, "estado": "ACE", "created_at": "..." }` |
| **Código HTTP** | 200, 400, 403, 404 |

---

### 22. Bloques organizador

| Función | Respuesta |
|---------|-----------|
| **Endpoint** | `/api/postulaciones/bloques-organizador/` |
| **Método HTTP** | GET |
| **Qué función cumple** | Listar postulaciones agrupadas por oportunidad del organizador autenticado |
| **JSON enviado** | Ninguno |
| **JSON recibido** | `[ { "titulo": "Apoyo escolar vespertino", "oportunidad_id": 12, "items": [ { "id": 3, "voluntario": 7, "voluntario_username": "ana_voluntaria", "oportunidad": 12, "oportunidad_titulo": "Apoyo escolar vespertino", "organizacion_propietario": 6, "estado": "PEN", "created_at": "..." } ] } ]` |
| **Código HTTP** | 200, 403 |

---

## Mensajes

### 23. Enviar

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

### 24. Bandeja

| Función | Respuesta |
|---------|-----------|
| **Endpoint** | `/api/mensajes/bandeja/?usuario={id}` |
| **Método HTTP** | GET |
| **Qué función cumple** | Consultar mensajes recibidos y enviados del usuario autenticado (`usuario` obligatorio y propio) |
| **JSON enviado** | Ninguno |
| **JSON recibido** | `{ "recibidos": [ { "id": 9, "remitente": 7, "remitente_username": "ana_voluntaria", "destinatario": 5, "destinatario_username": "fundacion_manos", "oportunidad": 11, "cuerpo": "...", "created_at": "..." } ], "enviados": [] }` |
| **Código HTTP** | 200, 400, 403 |

---

## Fuentes

| Fuente | Ubicación |
|--------|-----------|
| Rutas | `Backend/api/urls.py` |
| Vistas | `Backend/api/views.py` |
| Serializers | `Backend/api/serializers.py` |

---

*API completa Mano a Mano — solo endpoints existentes. Septiembre 2026.*
