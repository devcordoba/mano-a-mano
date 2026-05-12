# Especificación de requisitos — Mano a mano

Documento elaborado conforme a **IEEE 830** (requisitos de software), calidad según **ISO/IEC 25010** para requisitos no funcionales, y expresión de trabajo ágil mediante **historias de usuario (Scrum)** con criterios de aceptación en estilo **Gherkin**.

**Institución:** Instituto Superior Politécnico Córdoba (ISPC)  
**Carrera:** Tecnicatura Superior en Desarrollo Web y Aplicaciones Digitales  
**Espacio curricular:** Proyecto Integrador II — 2.° año — 2026  
**Docente referente:** Ing. y Prof. Dianela Accietto  
**Integrantes:** Gonzalo Quiroga, Lanfranco Darel Caballero, Lucas Monzón, Pilar Molina, Ivo Konstantinow  

**Versión:** 2026 · **Ámbito:** stack Django REST Framework + Angular documentado en el repositorio (`Backend/`, `Frontend/`).

### Alineacion evidencia EV1 y RF institucional *(resumen)*

Tabla puente entre el **listado de requerimientos** de la *Evidencia de Aprendizaje N.° 1* y los identificadores **RF-NN** detallados en este documento (IEEE).

| RF (EV1, listado académico) | Enfoque | Cubierto en este documento (IEEE) |
|----------------------------|---------|-------------------------------------|
| RF01 — Registro de usuarios por rol | Alta vía web + perfil VOL/ORG en modelo | **RF-02** (alta), **RF-14**; rol en `PerfilUsuario` (admin/seeding) — ver nota debajo |
| RF02 — Búsqueda con filtros (ubicación, tipo, disponibilidad, causas) | **Narrativa de producto** vs **MVP API** | Datos en modelo y UI; filtros GET en listado limitados a **`activa`** y **`organizacion`** en **RF-04** |
| RF03 — Publicación de oportunidades | Convocatorias y datos asociados | **RF-05** (organización), **RF-06** (oportunidades) |
| RF04 — Postulación | Estado y duplicados | **RF-07** |
| RF05 — Mensajería | Bandeja contextual | **RF-08** |
| RNF (EV1) seguridad “JWT” | Obsoleto frente a código | **Token DRF** — **RNF-02** y nota §7 |

**Nota RF01 (registro por rol):** el formulario público del sitio da de alta el usuario vía API; el rol **VOL/ORG** corresponde al modelo **`PerfilUsuario`** y hoy se gestiona en **administración Django** o datos de prueba, no como campo obligatorio del formulario de registro del visitante. Una HU futura puede unificar “elegir rol al registrarse” si la cátedra lo pide como CA explícita.

---

## Tabla de contenidos

- [Contexto ISPC / trazabilidad EV1](#alineacion-evidencia-ev1-y-rf-institucional-resumen)
- [Alcance y actores](#1-alcance-y-actores)
- [Trazabilidad RF → Historia de usuario](#2-trazabilidad-rf--historia-de-usuario)
- [Requisitos funcionales (RF)](#3-requisitos-funcionales-rf)
- [Requisitos no funcionales (RNF)](#4-requisitos-no-funcionales-rnf)
- [Historias de usuario y criterios de aceptación](#5-historias-de-usuario-y-criterios-de-aceptación)
- [Sprint backlog (MoSCoW)](#6-sprint-backlog-moscow)
- [Notas sobre cambios recientes](#7-notas-sobre-cambios-recientes)

---

## 1. Alcance y actores

| Actor | Descripción |
|-------|--------------|
| **Visitante** | Usuario sin sesión iniciada. |
| **Voluntario** | Usuario autenticado con rol orientado a postular (perfil VOL en la app). |
| **Organización (propietario)** | Usuario autenticado que crea/edita organizaciones y publica oportunidades (perfil ORG). |
| **Staff (vista demo)** | Usuario con `is_staff` en Django que en el front puede elegir “usuario activo” para inspección (solo lectura en la vista actual). |
| **Sistema externo** | API REST consumida por el cliente Angular. |

**Fuente de verificación funcional:** pruebas manuales sobre `Frontend` (`ng serve`) contra `Backend` (`runserver`), más `ng build` y rutas documentadas en README.

---

## 2. Trazabilidad RF → Historia de usuario

| RF | Resumen | HU |
|----|---------|-----|
| RF-01 | Healthcheck API | HU-01 |
| RF-02 | Registro de usuario vía API + formulario inicio | HU-02 |
| RF-03 | Autenticación con token DRF + sesión cliente | HU-03 |
| RF-04 | Listar oportunidades (activas; por organización en panel) | HU-04 |
| RF-05 | CRUD organizaciones vinculadas al propietario | HU-05 |
| RF-06 | CRUD oportunidades; activar/pausar | HU-06 |
| RF-07 | Postulación y gestión de estado | HU-07 |
| RF-08 | Mensajería y bandeja | HU-08 |
| RF-09 | Páginas informativas y enrutado | HU-09 |
| RF-10 | Layout con navegación y pie | HU-10 |
| RF-11 | Protección de rutas (invitado autenticado → panel en login) | HU-11 |
| RF-12 | Interceptor HTTP con `Authorization: Token` | HU-12 |
| RF-13 | Panel unificado (feed, postulaciones, orgs, publicar, mensajes) | HU-13 |
| RF-14 | Listado de usuarios y alta (API; perfiles solo en modelo/admin) | HU-14 |

---

## 3. Requisitos funcionales (RF)

### RF-01 | Healthcheck del servicio API

**Descripción:** El sistema debe exponer un endpoint `GET` que informe el estado operativo del servicio API para verificación de despliegue y monitoreo básico.

**Prioridad:** Alta  
**Fuente:** Equipo de desarrollo / operaciones  
**Criterio de verificación:** Una petición `GET /api/health/` devuelve código HTTP 200 y un cuerpo JSON con indicación de estado del servicio sin autenticación.

---

### RF-02 | Alta de usuario desde la aplicación web

**Descripción:** El sistema debe permitir al visitante solicitar la creación de un usuario Django enviando nombre de usuario (patrón alfanumérico acotado), correo electrónico válido, contraseña (mínimo 8, máximo 128 caracteres) y opcionalmente nombre y apellido, validando en cliente antes del envío y mostrando el mensaje de error devuelto por la API si la creación falla.

**Prioridad:** Alta  
**Fuente:** Visitante / negocio  
**Criterio de verificación:** Con backend disponible, el formulario de inicio envía `POST /api/usuarios/` con datos válidos y muestra confirmación; con error 4xx del servidor se muestra el detalle sin crear sesión automática.

---

### RF-03 | Autenticación basada en token (DRF)

**Descripción:** El sistema debe permitir al usuario registrado iniciar sesión con nombre de usuario y contraseña; ante éxito el backend debe emitir o reutilizar un token de autenticación DRF y el cliente debe almacenarlo y enviarlo en cabecera `Authorization: Token <valor>` en peticiones subsiguientes; el sistema debe permitir cerrar sesión invalidando el token en servidor y limpiando el estado en cliente.

**Prioridad:** Alta  
**Fuente:** Usuario autenticado  
**Criterio de verificación:** `POST /api/auth/login/` devuelve token y usuario; `GET /api/auth/me/` con cabecera correcta devuelve el usuario actual; `POST /api/auth/logout/` con token elimina el token; el front redirige tras login al `returnUrl` seguro o a `/panel`.

---

### RF-04 | Consulta de oportunidades de voluntariado vía API y uso en cliente

**Descripción:** El sistema debe permitir obtener el listado de oportunidades mediante `GET /api/oportunidades/` aplicando como máximo los filtros de consulta soportados por la implementación actual: `activa` (valores interpretados como verdadero/falso) e `organizacion` (identificador numérico de organización). El cliente Angular debe construir únicamente esos parámetros cuando invoca el servicio de listado.

**Prioridad:** Alta  
**Fuente:** Visitante (feed) / organización (mis publicaciones)  
**Criterio de verificación:** El feed público del panel solicita oportunidades con `activa=true`; la carga de publicaciones por organización usa `organizacion=<id>`; no se documentan ni implementan en esta versión filtros GET por texto de ubicación, causa, tipo de actividad o disponibilidad.

---

### RF-05 | Gestión de organizaciones

**Descripción:** El sistema debe permitir al usuario autenticado crear, listar (filtrando por `propietario` cuando corresponde), leer, actualizar y eliminar organizaciones de las que es propietario según reglas del backend; el cliente debe ofrecer formulario de alta/edición con validación de campos obligatorios y URL de sitio web opcional validada cuando no está vacía.

**Prioridad:** Alta  
**Fuente:** Usuario organización  
**Criterio de verificación:** CRUD coherentes contra `/api/organizaciones/`; eliminación confirma con el usuario y refresca datos del panel.

---

### RF-06 | Gestión de oportunidades vinculadas a organización

**Descripción:** El sistema debe permitir al usuario autenticado con organización crear, editar y eliminar oportunidades asociadas a una organización propia, incluyendo campos de título, descripción, ubicación, causa, tipo de actividad, disponibilidad, requisitos, cupos, fecha opcional y bandera activa; el sistema debe permitir alternar la bandera activa sin eliminar el registro.

**Prioridad:** Alta  
**Fuente:** Usuario organización  
**Criterio de verificación:** Operaciones PATCH/POST/DELETE contra `/api/oportunidades/` con datos válidos actualizan el listado del panel sin inconsistencias obvious en la UI.

---

### RF-07 | Postulaciones de voluntarios

**Descripción:** El sistema debe permitir al usuario autenticado como voluntario registrar una postulación a una oportunidad activa no duplicada (misma combinación voluntario-oportunidad); el sistema debe rechazar duplicados con respuesta HTTP 400 y mensaje interpretable por el cliente. El usuario con organización debe poder actualizar el estado de postulaciones de sus convocatorias.

**Prioridad:** Alta  
**Fuente:** Voluntario / organización  
**Criterio de verificación:** Postulación creada vía API; segundo intento duplicado muestra mensaje acotado en UI; cambio de estado PEN/ACE/REC persiste vía PATCH.

---

### RF-08 | Mensajería entre usuarios

**Descripción:** El sistema debe permitir enviar mensajes entre usuarios autenticados, opcionalmente asociados a una oportunidad, y consultar bandeja por usuario mediante endpoint dedicado que devuelva mensajes recibidos y enviados.

**Prioridad:** Alta  
**Fuente:** Voluntario / organización  
**Criterio de verificación:** `POST /api/mensajes/` y `GET /api/mensajes/bandeja/?usuario=<id>` integrados en el panel con hilos por postulación/oportunidad según la lógica actual del cliente.

---

### RF-09 | Contenido estático y rutas SPA

**Descripción:** El sistema debe permitir al visitante acceder a páginas de inicio, “quienes somos”, login y panel mediante rutas del enrutador Angular con títulos de documento definidos donde aplique.

**Prioridad:** Media  
**Fuente:** Visitante  
**Criterio de verificación:** Navegación por URL `/inicio`, `/nosotros`, `/login`, `/panel` carga los componentes correspondientes sin error de compilación.

---

### RF-10 | Shell de aplicación con encabezado y pie

**Descripción:** El sistema debe presentar barra de navegación global con enlaces a secciones principales e indicación de sesión (nombre visible o botón ingresar/salir) y pie de sitio consistente en todas las vistas principales.

**Prioridad:** Media  
**Fuente:** Visitante / usuario autenticado  
**Criterio de verificación:** `AppComponent` incluye navbar y footer; estado de sesión refleja login/logout correctamente tras operaciones exitosas.

---

### RF-11 | Reglas de activación para ruta de inicio de sesión

**Descripción:** El sistema debe impedir que un usuario ya autenticado acceda a la ruta de login salvo redirección al panel cuando corresponda, mediante guarda de rutas.

**Prioridad:** Media  
**Fuente:** Producto  
**Criterio de verificación:** Con sesión válida, navegar a `/login` redirige a `/panel`.

---

### RF-12 | Inclusión automática del token en peticiones HTTP salientes

**Descripción:** El sistema cliente debe anteponer el token de sesión en las solicitudes HTTP al API exceptuando rutas explicitadas (p. ej. login) donde no aplique.

**Prioridad:** Alta  
**Fuente:** Arquitectura  
**Criterio de verificación:** Peticiones autenticadas llevan cabecera `Authorization: Token`; login no debe buclear por reescritura del token en la misma petición.

---

### RF-13 | Panel único integrado para flujos de voluntario y organización

**Descripción:** El sistema debe proporcionar una vista de panel que muestre oportunidades activas para exploración; si el usuario inicia sesión, debe integrar pestañas o secciones para postulaciones propias, publicaciones, postulantes, mensajes, organizaciones y formulario de publicación conforme al diseño actual.

**Prioridad:** Alta  
**Fuente:** Usuarios finales  
**Criterio de verificación:** Flujos principales ejecutables desde `/panel` con datos del backend configurado según README.

---

### RF-14 | Listado y alta de usuarios para el panel

**Descripción:** El sistema debe exponer mediante API el listado de usuarios (`GET /api/usuarios/`) y el alta (`POST /api/usuarios/`) utilizados por el cliente. La tabla `perfil_usuario` permanece en el modelo de datos y es gestionable desde Django Admin; no se expone recurso REST `/api/perfiles/` en esta versión al no ser usado por el SPA.

**Prioridad:** Media  
**Fuente:** Staff técnico / demo  
**Criterio de verificación:** `GET /api/usuarios/` alimenta selector cuando el usuario tiene `is_staff`; el registro público usa `POST /api/usuarios/`.

---

## 4. Requisitos no funcionales (RNF)

### RNF-01 | Separación cliente-servidor e interoperabilidad API

**Categoría ISO 25010:** Compatibilidad / interoperabilidad  

**Descripción:** El sistema debe intercambiar datos con el backend únicamente mediante HTTP/JSON sobre la API REST documentada en README y DER, usando codificación UTF-8.

**Métrica:** 100% de llamadas del cliente Angular documentadas utilizan rutas bajo prefijo configurado (`__API_BASE_URL__` o valor por defecto `http://127.0.0.1:8000/api`).  

**Prioridad:** Alta  

**Método de verificación:** Revisión de `ManoApiService` y tabla de rutas DER; compilación sin rutas relativas inconsistentes.

---

### RNF-02 | Seguridad de sesión mediante token opaco (DRF)

**Categoría ISO 25010:** Seguridad  

**Descripción:** El sistema backend debe emitir tokens opacos gestionados por `rest_framework.authtoken` y no debe exponer tokens en registros públicos obligatorios del repositorio; el cliente debe persistir token solo en `localStorage` en el modelo actual MVP.

**Métrica:** Autenticación satisfactoria mediante cabecera `Authorization: Token` en todas las rutas protegidas del modelo actual.  

**Prioridad:** Alta  

**Método de verificación:** Prueba manual login + llamada autenticada; revisión de `settings.py` (TokenAuthentication).

---

### RNF-03 | Rendimiento del build frontend

**Categoría ISO 25010:** Eficiencia respecto del tiempo  

**Descripción:** El proyecto frontend debe producir artefactos de producción mediante `ng build` en máquina de desarrollo típica sin errores bloqueantes.

**Métrica:** Ejecución de `npm run build` finaliza con código de salida 0 en el entorno de integración definido por el equipo.  

**Prioridad:** Media  

**Método de verificación:** Comando ejecutado en CI o local antes de cada entrega mayor.

---

### RNF-04 | Contrato de filtros GET en oportunidades

**Categoría ISO 25010:** Mantenibilidad / consistencia  

**Descripción:** El sistema backend y el cliente compartidas deben alinearse únicamente con los filtros `activa` y `organizacion` para listados de oportunidades hasta nueva especificación documentada.

**Métrica:** Código del `ViewSet` y del método `listOportunidades` no referencian filtros deprecated en la misma versión de documentación.  

**Prioridad:** Media  

**Método de verificación:** Revisión cruzada `views.py`, `mano-api.service.ts`, DER sección 4.

---

### RNF-05 | CORS para entorno local

**Categoría ISO 25010:** Compatibilidad  

**Descripción:** El sistema backend debe permitir orígenes de desarrollo configurables para SPA Angular en localhost/127.0.0.1 según configuración Django CORS documentada.

**Métrica:** Peticiones OPTIONS/GET desde `http://localhost:4200` al API no rechazadas por CORS en configuración README.  

**Prioridad:** Media  

**Método de verificación:** Prueba manual `ng serve` + `runserver`; revisión `.env`/settings.

---

### RNF-06 | Responsive con Bootstrap

**Categoría ISO 25010:** Usabilidad  

**Descripción:** El cliente debe usar componentes Bootstrap 5 grid/utilities para comportamiento adaptable en tamaños típicos (móvil, tablet, escritorio).

**Métrica:** Claves `container`, `navbar`, `grid` presentes en plantillas HTML principales (`app`, `dashboard`, páginas).  

**Prioridad:** Media  

**Método de verificación:** Revisión de plantillas; prueba manual en dos anchos en navegador.

**Contexto pedagógico Evidencia N.° 1:** objetivo cualitativo de que un usuario **nuevo pueda registrar y postular en ≤ 5 minutos** en **prueba guiada** durante la clase o demo coordinada por el equipo; no constituye un compromiso SLA medido en producción.

---

## 5. Historias de usuario y criterios de aceptación

### HU-01 | Healthcheck

**Historia:** Como operador del sistema, quiero consultar un endpoint de salud, para verificar que el backend está arriba sin credenciales.

**Prioridad MoSCoW:** Must  
**Estimación:** 1 SP  

| ID | Escenario | Dado que | Cuando | Entonces |
|----|-----------|----------|--------|----------|
| CA-01 | Respuesta OK | El servidor está ejecutándose | Se realiza `GET /api/health/` | El código HTTP es 200 y el cuerpo indica estado del servicio en JSON. |

---

### HU-02 | Registro desde la web

**Historia:** Como visitante, quiero registrarme con usuario, email y contraseña desde la página de inicio, para luego poder iniciar sesión en el login.

**Prioridad MoSCoW:** Must  
**Estimación:** 5 SP  

| ID | Escenario | Dado que | Cuando | Entonces |
|----|-----------|----------|--------|----------|
| CA-01 | Validación cliente | Estoy en inicio | Envío el formulario con campos inválidos | El formulario muestra errores por control y no completa el flujo exitoso. |
| CA-02 | Registro API OK | El backend acepta el POST | Envío datos válidos | Veo mensaje de éxito y el formulario se limpia. |
| CA-03 | Error API | El backend responde error | Envío datos que el servidor rechaza | Veo el detalle del error sin crear sesión automática. |

---

### HU-03 | Inicio y cierre de sesión

**Historia:** Como usuario registrado, quiero iniciar y cerrar sesión con nombre de usuario y contraseña, para acceder al panel con mi identidad.

**Prioridad MoSCoW:** Must  
**Estimación:** 5 SP  

| ID | Escenario | Dado que | Cuando | Entonces |
|----|-----------|----------|--------|----------|
| CA-01 | Login exitoso | Existe usuario válido | Envío credenciales correctas en `/login` | Soy redirigido a `/panel` o a `returnUrl` interno seguro. |
| CA-02 | Login fallido | Las credenciales son incorrectas | Envío el formulario | Veo mensaje de error y permanezco en login. |
| CA-03 | Logout | Tengo sesión activa | Pulso “Salir” en la barra | El token se invalida en servidor (si aplica) y vuelvo a estado visitante; navego a inicio. |

---

### HU-04 | Ver oportunidades activas

**Historia:** Como visitante o usuario, quiero ver un listado de oportunidades activas, para conocer convocatorias publicadas.

**Prioridad MoSCoW:** Must  
**Estimación:** 3 SP  

| ID | Escenario | Dado que | Cuando | Entonces |
|----|-----------|----------|--------|----------|
| CA-01 | Feed | El API responde | Abro `/panel` | Se solicita `GET /api/oportunidades/?activa=true` y se listan tarjetas con datos mínimos (título, causa, organización, ubicación). |
| CA-02 | Sin datos | No hay oportunidades | Cargo el feed | Veo mensaje de lista vacía sin error de aplicación. |

---

### HU-05 | Administrar mis organizaciones

**Historia:** Como usuario autenticado, quiero crear y editar mis organizaciones, para publicar oportunidades a su nombre.

**Prioridad MoSCoW:** Must  
**Estimación:** 8 SP  

| ID | Escenario | Dado que | Cuando | Entonces |
|----|-----------|----------|--------|----------|
| CA-01 | Crear | Tengo sesión y datos válidos | Completo el formulario y guardo | La organización aparece en el listado tras refresco de datos. |
| CA-02 | Editar | Existe organización mía | Modifico campos y guardo | Los cambios se reflejan contra `PATCH` API. |
| CA-03 | Eliminar | Confirmo borrado | Ejecuto eliminar | La organización desaparece del listado y actualiza dependencias visibles. |

---

### HU-06 | Publicar y administrar convocatorias

**Historia:** Como propietario de organización, quiero publicar, editar, pausar y eliminar oportunidades, para gestionar mis convocatorias.

**Prioridad MoSCoW:** Must  
**Estimación:** 8 SP  

| ID | Escenario | Dado que | Cuando | Entonces |
|----|-----------|----------|--------|----------|
| CA-01 | Publicar | Tengo organización seleccionada | Completo formulario válido | Se crea vía `POST` y aparece en “Mis publicaciones”. |
| CA-02 | Pausar/activar | Existe oportunidad mía | Alterno estado | El estado visual y `activa` en API son coherentes. |
| CA-03 | Validación sitio web | El campo sitio web tiene texto inválido | Intento guardar organización | Aparece error de URL según validador del formulario. |

---

### HU-07 | Postularme y gestionar postulantes

**Historia:** Como voluntario quiero postularme; como organización quiero ver postulantes y cambiar estados, para coordinar participación.

**Prioridad MoSCoW:** Must  
**Estimación:** 8 SP  

| ID | Escenario | Dado que | Cuando | Entonces |
|----|-----------|----------|--------|----------|
| CA-01 | Postular | No estoy ya postulado | Pulso postular en feed | Se crea postulación y actualiza la vista. |
| CA-02 | Duplicado | Ya estoy postulado | Repito acción | Veo mensaje explícito de duplicado (400). |
| CA-03 | Estado postulación | Soy organización | Cambio estado y guardo | Persiste vía API y refleja en listados. |

---

### HU-08 | Mensajes

**Historia:** Como usuario autenticado, quiero enviar y leer mensajes en contexto de postulación, para coordinar con la otra parte.

**Prioridad MoSCoW:** Should  
**Estimación:** 8 SP  

| ID | Escenario | Dado que | Cuando | Entonces |
|----|-----------|----------|--------|----------|
| CA-01 | Enviar | Tengo hilo abierto | Envío texto válido | El mensaje aparece en el hilo tras refresco. |
| CA-02 | Bandeja | Existen mensajes | Cargo panel | Recibidos y enviados se obtienen de bandeja por usuario. |

---

### HU-09 | Información institucional

**Historia:** Como visitante, quiero leer “Quiénes somos”, para entender el propósito del proyecto.

**Prioridad MoSCoW:** Could  
**Estimación:** 2 SP  

| ID | Escenario | Dado que | Cuando | Entonces |
|----|-----------|----------|--------|----------|
| CA-01 | Navegación | Estoy en el sitio | Voy a `/nosotros` | Se muestra el contenido estático sin error. |

---

### HU-10 | Navegación global

**Historia:** Como usuario, quiero una barra y pie coherentes, para moverme por el sitio.

**Prioridad MoSCoW:** Must  
**Estimación:** 3 SP  

| ID | Escenario | Dado que | Cuando | Entonces |
|----|-----------|----------|--------|----------|
| CA-01 | Enlaces | Cualquier página shell | Uso enlaces navbar | Navego a inicio, nosotros, panel o login según corresponda. |

---

### HU-11 | Guard de invitado en login

**Historia:** Como usuario ya autenticado, no quiero ver el formulario de login, para no duplicar sesión.

**Prioridad MoSCoW:** Should  
**Estimación:** 2 SP  

| ID | Escenario | Dado que | Cuando | Entonces |
|----|-----------|----------|--------|----------|
| CA-01 | Redirección | Tengo token válido | Navego a `/login` | Soy redirigido a `/panel`. |

---

### HU-12 | Token en peticiones HTTP

**Historia:** Como desarrollador del cliente, quiero que el token se envíe automáticamente, para no repetir lógica en cada servicio.

**Prioridad MoSCoW:** Must  
**Estimación:** 3 SP  

| ID | Escenario | Dado que | Cuando | Entonces |
|----|-----------|----------|--------|----------|
| CA-01 | Interceptor | Tengo token y llamo API autenticada | Se dispara `HttpClient` | La petición incluye `Authorization: Token`. |

---

### HU-13 | Panel integrado

**Historia:** Como usuario del ecosistema, quiero un panel que concentre feed y funciones autenticadas, para operar en un solo lugar.

**Prioridad MoSCoW:** Must  
**Estimación:** 13 SP  

| ID | Escenario | Dado que | Cuando | Entonces |
|----|-----------|----------|--------|----------|
| CA-01 | Sesión y datos | Cambio sesión o usuario demo | El panel recarga datos dependientes (feed, postulaciones, orgs) sin error de consola bloqueante atribuible al cliente. |

---

### HU-14 | Selector staff (demo)

**Historia:** Como usuario staff, quiero elegir un usuario de vista, para inspeccionar datos de demostración.

**Prioridad MoSCoW:** Could  
**Estimación:** 3 SP  

| ID | Escenario | Dado que | Cuando | Entonces |
|----|-----------|----------|--------|----------|
| CA-01 | Visible solo staff | `is_staff` es verdadero | Abro panel | Veo selector de usuarios alimentado por `GET /api/usuarios/`. |

---

## 6. Sprint backlog (MoSCoW)

| ID HU | Historia | CA (rango) | SP | MoSCoW | Sprint sugerido |
|-------|----------|------------|----|--------|-----------------|
| HU-01 | Healthcheck | CA-01 | 1 | M | 1 |
| HU-02 | Registro web | CA-01–03 | 5 | M | 1 |
| HU-03 | Login / logout | CA-01–03 | 5 | M | 1 |
| HU-12 | Interceptor token | CA-01 | 3 | M | 1 |
| HU-10 | Navegación global | CA-01 | 3 | M | 1 |
| HU-11 | Guard login | CA-01 | 2 | S | 1 |
| HU-04 | Oportunidades activas | CA-01–02 | 3 | M | 2 |
| HU-05 | Organizaciones | CA-01–03 | 8 | M | 2 |
| HU-06 | Oportunidades CRUD | CA-01–03 | 8 | M | 2 |
| HU-13 | Panel integrado | CA-01 | 13 | M | 2–3 |
| HU-07 | Postulaciones | CA-01–03 | 8 | M | 3 |
| HU-08 | Mensajes | CA-01–02 | 8 | S | 3 |
| HU-09 | Quiénes somos | CA-01 | 2 | C | 3 |
| HU-14 | Selector staff | CA-01 | 3 | C | 3 |

*Las estimaciones en Story Points son orientativas para planificación académica; el equipo debe re-estimar en refinamiento.*

---

## 7. Notas sobre cambios recientes

1. **Filtros de listado en `/api/oportunidades/`:** En la versión documentada aquí, el backend solo aplica filtros de consulta `activa` y `organizacion`. Los atributos `ubicacion`, `causa`, `tipo_actividad` y `disponibilidad` permanecen como **campos del modelo** en base de datos y en formularios, pero **no** como parámetros GET de búsqueda hasta que exista HU y RF que lo especifiquen con criterios verificables en front y back.

2. **Estructura del cliente Angular (alineación con carpetas):** `pages/` (rutas), `shared/` (componentes y constantes compartidos), `services/` (API, auth, sesión), `core/` (guards, interceptors, tokens), `models/` (tipos TypeScript). Documentado también en README.

3. **Superficie REST alineada al SPA:** Sin `/api/perfiles/`; usuarios solo **GET** lista y **POST** alta; postulaciones sin **DELETE**; mensajes solo **POST** y **bandeja** (sin listado GET genérico ni **DELETE**). Se conserva **`GET /api/health/`** para operación y scripts aunque el Angular no lo llame.

4. **Token DRF vs JWT:** El requisito de seguridad describe **token opaco DRF**; cualquier mención histórica a “JWT” en documentación previa debe considerarse obsoleta frente a esta versión.

---

*Documento generado para el repositorio **mano-a-mano** — Red de voluntarios.*
