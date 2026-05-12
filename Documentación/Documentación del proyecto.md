# Documentación inicial de proyecto de software

El proyecto Mano a mano es una aplicación web comunitaria que busca que las personas o organizaciones con voluntad de participar en acciones solidarias puedan ofrecer o reclutar personas que quieran o esten dispuestas a ofrecerse como voluntarios.
La información sobre oportunidades de voluntariado se encuentra fragmentada en redes sociales, grupos de mensajería y contactos informales, lo que genera baja visibilidad.

La solución propuesta es una plataforma web para la publicación y exploración de oportunidades de voluntariado, la postulación a convocatorias y la coordinación mediante mensajería contextual.

### Nombre del proyecto

**Mano a mano** - Plataforma web para conectar voluntarios con organizaciones y viceversa que publican oportunidades de voluntariado.

### Problema u oportunidad que resuelve

En Córdoba y alrededores, personas con voluntad de participar en acciones solidarias (estudiantes, trabajadores, vecinos) y organizaciones sociales/comunitarias que necesitan voluntarios para sostener sus actividades se encuentran con información fragmentada en canales dispersos.

**Consecuencias:**

La desconexión entre quienes quieren ayudar y quienes necesitan voluntarios. No es "falta de voluntad", sino falta de articulación y acceso organizado a oportunidades confiables:

- Baja participación social en actividades solidarias por falta de información clara y accesible.
- Pérdida de tiempo en búsquedas manuales y no estructuradas.
- Dificultad de las organizaciones para cubrir cupos de voluntariado.
- Menor impacto de proyectos comunitarios por falta de articulación entre oferta y demanda de ayuda.

> *"Las personas quieren ayudar, pero no saben dónde ni cómo hacerlo."*

**Oportunidad:** centralizar oportunidades reduciendo el tiempo e incertidumbre para encontrar dónde colaborar y mejorar la coordinación.

### Descripción

**Mano a mano** es una aplicación web que permite registrar usuarios, iniciar sesión de forma segura y explorar oportunidades de voluntariado activas. Las organizaciones pueden dar de alta sus datos, publicar y administrar convocatorias, y revisar postulaciones. Los voluntarios pueden postularse de manera simple y mantener conversaciones enlazadas a esas convocatorias.

### A quién esta destinado


  - **Voluntarios:** personas que desean colaborar en causas sociales.
  - **Organizaciones:** fundaciones, asociaciones civiles, grupos comunitarios e instituciones que requieren voluntarios.

### Justificación del proyecto

El proyecto "Mano a Mano" surge a partir de la identificación de una problemática vinculada a la participación social y al acceso a oportunidades de voluntariado en Córdoba y alrededores. Actualmente, las personas interesadas en colaborar con causas solidarias encuentran dificultades para acceder a información clara, centralizada y confiable sobre actividades de voluntariado, mientras que las organizaciones sociales y comunitarias enfrentan limitaciones para difundir sus convocatorias y cubrir cupos necesarios para el desarrollo de sus actividades.

La información sobre oportunidades de voluntariado suele encontrarse fragmentada en redes sociales, grupos de mensajería y contactos informales, generando desorganización, pérdida de tiempo en búsquedas manuales y baja articulación entre quienes desean ayudar y quienes necesitan apoyo. Como consecuencia, muchas iniciativas comunitarias reducen su impacto por falta de participación y visibilidad.

En respuesta a esta situación, se propone el desarrollo de una aplicación web denominada “Mano a Mano”, orientada a conectar voluntarios con organizaciones mediante un sistema centralizado de búsqueda, publicación y postulación a oportunidades solidarias. La plataforma permitirá filtrar actividades según ubicación, intereses y disponibilidad, facilitando el acceso a oportunidades pertinentes y mejorando la coordinación entre las partes involucradas.

El proyecto busca generar valor mediante:

Incremento de la participación ciudadana en actividades solidarias.
Mayor visibilidad para organizaciones y proyectos comunitarios.
Reducción del tiempo y la incertidumbre en la búsqueda de oportunidades de voluntariado.
Mejora de la articulación entre oferta y demanda de ayuda social.
Optimización de la comunicación y coordinación entre organizaciones y voluntarios.

Asimismo, la iniciativa se encuentra relacionada con la transformación digital, la innovación tecnológica y el desarrollo de soluciones con impacto social y comunitario.


## 2. Viabilidad técnica y económica

### 2.1 Viabilidad técnica

#### Stack tecnológico

| Capa | Tecnología | Versión | Justificación |
|------|-----------|---------|---------------|
| **Frontend** | Angular | 21 | Framework SPA robusto, amplia documentación. |
| **Estilos** | Bootstrap | 5 | Grid componentes visuales predefinidos y baja curva de aprendizaje. |
| **Backend** | Django |  | Framework Python con ORM, migraciones y panel admin incluido. |
| **API REST** | Django REST Framework  |  | Serialización, viewsets, autenticación por token integrada. |
| **Autenticación** | Token DRF | | `rest_framework.authtoken`|
| **Base de datos** | MySQL || Motor relacional robusto, compatible con el DER del proyecto, habitual en entornos académico-productivos. |

#### Infraestructura requerida

- **Desarrollo local:** Frontend en puerto 4200 (`ng serve`), Backend en puerto 8000 (`runserver`), MySQL local o contenedor Docker.
- **Endpoint de verificación:** `GET /api/health/` para comprobar estado del servicio.

#### Conocimientos del equipo

- TypeScript, HTML/CSS.
- Python, modelo relacional, SQL.
- Git, control de versiones, trabajo colaborativo.
- Metodologías ágiles (Scrum), documentación técnica.

#### Dependencias externas

- No se registraron apis o servicios externos.

#### Riesgos técnicos iniciales identificados

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Diferencias de entorno de desarrollo entre integrantes (versiones de Angular, Django, MySQL, Sistema operativo) | Alta | Media | Utilizar contenedores Docker para unificar el entorno de desarrollo y asegurar consistencia entre configuraciones, versiones y servicios utilizados por todo el equipo. |

### 2.2 Viabilidad económica

#### Estimación de esfuerzo (horas/persona)

| Actividad | Horas estimadas |
|-----------|----------------|
| Análisis, requisitos y documentación | 2-4 h |
| Diseño de modelo de datos y arquitectura | 3-4 h |
| Desarrollo backend (API, modelos, auth) | 5-8 h |
| Desarrollo frontend (SPA, componentes, servicios) | 5-8 h |
| Testing manual y corrección de bugs | 4-5 h |
| Reuniones de equipo y ceremonias ágiles | 2-3 h |
| **Total estimado equipo** | **22–32 h-persona** |

#### Costos principales

| Concepto | Estimación | Nota |
|----------|-----------|------|
| **Licencias de software** | USD 0 | Stack Open source (Angular, Django, MySQL Community, Bootstrap). |
| **Herramientas de gestión** | USD 0 | GitHub (repositorio público, Issues, Projects / Kanban). |
| **Hardware** | Sin costo adicional | Equipos personales de los integrantes. |

#### Beneficio esperado

El proyecto "Mano a Mano" busca generar beneficios principalmente sociales, más que un retorno económico. La implementación de la plataforma permitirá mejorar la articulación entre personas interesadas en participar en actividades solidarias y organizaciones que requieren voluntarios para sostener sus iniciativas y viceversa.

Los beneficios esperados es
incrementar la visibilidad de oportunidades de voluntariado en Córdoba y alrededores.
Facilitar el acceso organizado a actividades solidarias mediante una plataforma centralizada.
Reducir el tiempo y esfuerzo invertido en búsquedas manuales de oportunidades.
Mejorar la capacidad de las organizaciones para difundir convocatorias y cubrir cupos de voluntariado.
Potenciar la participación ciudadana y el impacto de proyectos comunitarios.
Generar una experiencia más accesible y ordenada para voluntarios y organizaciones.
Beneficio institucional y académico

Desde el enfoque académico el proyecto también aporta valor mediante la aplicación práctica de metodologías ágiles, desarrollo web full stack, trabajo colaborativo y resolución de problemáticas reales utilizando herramientas tecnológicas actuales.

**Indicadores cualitativos de éxito**:
- Cantidad de oportunidades publicadas.
- Cantidad de postulaciones realizadas.
- Nivel de participación de usuarios registrados.
- Mejora percibida en la facilidad para encontrar oportunidades de voluntariado.
- Satisfacción de organizaciones y voluntarios respecto al uso de la plataforma.

---

### 3.2 Qué no incluye

#### Funcionalidades explícitamente excluidas

- Pasarelas de pago, donaciones en línea, facturación.
- Notificaciones push o email transaccional automático.
- Búsqueda y filtros dinámicos.
- App móvil.
- Nivel seguridad avanzada.

#### Versiones o fases futuras (señaladas, no desarrolladas)

- Filtros de búsqueda.
- Notificaciones
- Sistema de valoración/reputación de voluntarios y organizaciones.
- Dashboard para administradores.

# Responsabilidades del cliente vs. equipo

| Cliente / Stakeholders | Equipo de proyecto |
|---|---|
| Validar la problemática y necesidades principales del sistema. | Analizar requerimientos y traducirlos a soluciones técnicas. |
| Proporcionar feedback sobre funcionalidades y usabilidad. | Diseñar, desarrollar e integrar la aplicación web. |
| Priorizar necesidades funcionales según valor esperado. | Implementar backend, frontend y modelo de datos. |
| Revisar prototipos y validar avances funcionales. | Gestionar el backlog y planificación de tareas. |
| Comunicar cambios o nuevas necesidades relevantes. | Realizar pruebas, corrección de errores y documentación técnica. |
| Evaluar si la solución cumple el objetivo esperado. | Garantizar seguridad, rendimiento y funcionamiento general del sistema. |

## Responsabilidades del cliente

- Validar la necesidad y problemática abordada.
- Aportar retroalimentación sobre experiencia de usuario y funcionalidades.
- Priorizar requerimientos según impacto y utilidad.
- Aprobar entregables funcionales parciales.

## Responsabilidades del equipo

- Diseñar y desarrollar la solución tecnológica propuesta.
- Administrar tareas, cronograma y documentación del proyecto.
- Implementar funcionalidades definidas en el alcance del MVP.
- Realizar pruebas funcionales y corrección de errores.
- Mantener comunicación y seguimiento continuo del avance del proyecto.

---

## 4. Objetivos SMART del proyecto

### Objetivo 1 — Funcionalidades core navegables y documentadas

| SMART | Formulación |
|-------|-------------|
| **Específico** | Completar registro de usuario, login con token, panel funcional con feed de oportunidades, CRUD de organizaciones y convocatorias, postulaciones y mensajería básica. |
| **Medible** | 100 % de los flujos Must (registro, login, visualizar feed, CRUD. |
| **Alcanzable** | Alcanzable con el stack establecido (Angular 21 + Django + DRF + MySQL). |
| **Relevante** | Entrega valor al conectar voluntarios con organizaciones. |
| **Temporal** | Según cronograma ISPC. |

### Objetivo 2 — Especificación de requisitos rastreable

| SMART | Formulación |
|-------|-------------|
| **Específico** | Mantener historias de usuario con criterios de aceptación y priorizados con MoSCoW. |
| **Medible** | Mínimo 5 HU Must con criterios de aceptación; backlog referenciado en Issues de GitHub. |
| **Alcanzable** | Alcance contenido en el cronograma de la materia + documentación ya presente en `docs/requisitos.md`. |
| **Relevante** | Habilita evaluación transparente. |
| **Temporal** | Actualizado en la misma ventana de entrega que esta Actividad 3. |

### Objetivo 3 — Calidad técnica mínima reproducible

| SMART | Formulación |
|-------|-------------|
| **Específico** | Lograr que frontend compile sin errores, el backend ejecute migraciones correctamente y esté alineado al README y DER documentados. |
| **Medible** | `npm run build` finaliza con código de salida 0; `python manage.py migrate` sin errores; DER coherente con tablas físicas Django. |
| **Alcanzable** | Con hardware estándar y la guía de instalación documentada en README. |
| **Relevante** | Garantiza que otro desarrollador o evaluador pueda **clonar y ejecutar** el proyecto. |
| **Temporal** | Verificado antes de cada entrega mayor acordada en el calendario |

### Objetivo 4 — Gestión de proyecto ágil documentada

| SMART | Formulación |
|-------|-------------|
| **Específico** | Implementar ceremonias Scrum adaptadas: planificación, seguimiento en tablero, actas de reunión y retrospectiva mínima. |
| **Medible** | Al menos 2 actas de reunión registradas, tablero Kanban con tareas asignadas y estados actualizados, e Issues cargadas con historias de usuario. |
| **Alcanzable** | Con las herramientas disponibles (GitHub Projects, Issues) y reuniones virtuales semanales del equipo. |
| **Relevante** | Refleja prácticas profesionales reales de gestión de proyectos de software. |
| **Temporal** | Evidenciado desde el inicio del proyecto hasta la entrega final. |

---

## 5. Requisitos funcionales y no funcionales

**Leyenda MoSCoW:** **M** = Must, **S** = Should, **C** = Could, **W** = Won't (esta iteración).

### 5.1 Requisitos funcionales

| ID | Actor | Prioridad | Descripción | Criterio de aceptación breve |
|----|-------|-----------|-------------|-------------------------------|
| **RF01** | Visitante | **M** | **Registro de usuario** con username, email, contraseña (y opcional nombre/apellido) con validación en cliente y servidor. | Tras alta válida, mensaje de confirmación visible y usuario creado vía `POST /api/usuarios/`; errores muestran detalle del servidor. |
| **RF02** | Usuario registrado | **M** | **Inicio y cierre de sesión** con usuario/contraseña; servidor emite/revoca token DRF. | Login establece cabecera `Authorization: Token`; logout elimina token en servidor y limpia estado en cliente. |
| **RF03** | Visitante/usuario | **M** | **Explorar oportunidades de voluntariado** desde el panel: listado de convocatorias activas mostrando ubicación, causa, tipo de actividad y disponibilidad. | Si no hay datos, se muestra mensaje de lista vacía. |
| **RF04** | Usuario organización | **M** | **Gestionar organizaciones** propias: alta, edición y eliminación con campos obligatorios y validación. | CRUD vía REST coherente; cambios reflejados en UI tras refresco de datos. |
| **RF05** | Usuario organización | **M** | **Gestionar oportunidades** (CRUD + alternar activa/inactiva) vinculadas a organización propia. | Crear/editar/borrar/pausar se refleja en listados; campos: título, descripción, ubicación, causa, tipo actividad, disponibilidad, requisitos, cupos, fecha. |
| **RF06** | Voluntario / Org. | **M** | **Postulación:** voluntario se postula a oportunidad activa; organización gestiona estado (pendiente/aceptada/rechazada). | Alta postulación sin duplicados. |
| **RF07** | Usuario autenticado | **S** | **Mensajería contextual** entre partes: envío de mensajes y bandeja por usuario con mensajes recibidos y enviados. | `POST /api/mensajes/` y `GET /api/mensajes/bandeja/` integrados en panel. |
| **RF08** | Visitante | **S** | **Páginas informativas** (inicio, quiénes somos) y navegación consistente. | Rutas SPA `/inicio`, `/nosotros`, `/login`, `/panel` cargan sin error. |

### 5.2 Requisitos no funcionales (6 requisitos)

| ID | Categoría | Prioridad | Descripción | Métrica / verificación |
|----|-----------|-----------|-------------|------------------------|
| **RNF01** | Seguridad | **M** | Contraseña nunca en texto plano; autenticación mediante token DRF (`rest_framework.authtoken`). | Hash en BD; logout elimina Token en servidor; no se expone token en logs del repositorio. |
| **RNF02** | Seguridad / acceso | **M** | Control de acceso basado en roles (voluntario/organización) mediante perfil de usuario y permisos. | Flujos protegidos requieren token válido; guard Angular impide acceso a login con sesión activa. |
| **RNF05** | Usabilidad / responsive | **S** | Interfaz intuitiva con Bootstrap 5; usuario nuevo puede registrarse y postularse en menos de 5 minutos en práctica guiada. | Componentes `container`, `navbar` en plantillas principales. |
| **RNF06** | Mantenibilidad | **S** | Código cliente organizado en carpetas estándar Angular (`pages/`, `services/`, `core/`, `shared/`, `models/`); código servidor organizado en app Django con modelos, serializers, views, urls. | Estructura de carpetas documentada en README coincide con repositorio físico. |

---

## 6. Identificación de stakeholders y roles del equipo

### 6.1 Mapa de stakeholders

| Nombre / Stakeholder | Rol / Tipo | Interés | Influencia | Expectativas principales | Canal de comunicación |
|-----------------------|-----------|---------|------------|--------------------------|----------------------|
| **Equipo Mano a mano** (5 integrantes) | Desarrolladores (interno) | Alto | Alta | Alcance viable, trabajo coordinado, trazabilidad en tableros y repositorio | Reuniones virtuales, GitHub Projects / Kanban, chat de equipo |
| **Usuario meta: voluntario** | Beneficiario (externo) | Alto | Media | Registrarse, explorar convocatorias y postularse sin fricción excesiva | Pruebas con usuarios, feedback en demo |
| **Usuario meta: organización** | Beneficiario (externo) | Alto | Media | Publicar necesidades de voluntariado y coordinar voluntarios desde el panel | Pruebas y validación incremental |

### 6.2 Roles del equipo Scrum (adaptación académica)

| Rol Scrum | Integrante | Responsabilidades principales |
|-----------|-----------|-------------------------------|
| **Product Owner** | Lanfranco Darel Caballero | Priorización del backlog, levantamiento de pain points, requisitos funcionales/no funcionales, historias de usuario y criterios de aceptación. |
| **Scrum Master** | Gonzalo Quiroga | Facilitador del proceso: cronograma, actas de reunión, remoción de impedimentos, coordinación general con docente. Rotación por sprint. |
| **Developer** | Lucas Monzón | Repositorio, Backend Django, Frontend Angular|
| **Developer** | Lanfranco Darel Caballero | Repositorio, Backend Django, Frontend Angular |
| **Developer** | Ivo Konstantinow | Repositorio, Backend Django, Frontend Angular |
| **Developer** | Pilar Molina | Repositorio, Backend Django, Frontend Angular |



| Rol formal Scrum | Asignación en el equipo |
|--------------------------------------|------------------------|
| Product Owner | Lanfranco Darel Caballero |
| Scrum Master | Gonzalo Quiroga |
| Developers | Lucas Monzón, Lanfranco Darel Caballero, Ivo Konstantinow, Gonzalo Quiroga, Pilar Molina |

---

## 7. Historias de usuario


### US-01 — Registro de usuario

**ID:** US-01
**Título:** Registro de usuario público
**Prioridad:** Must · **MoSCoW:** M
**Estimación:** 5 SP

**Historia:** Como **visitante sin cuenta**, **quiero** registrarme con usuario, correo electrónico y contraseña válidos desde la página de inicio, **para** poder después iniciar sesión y acceder a las funcionalidades de la plataforma.

**Criterios de aceptación:**

| # | Dado que | Cuando | Entonces |
|---|----------|--------|----------|
| 1 | Ingreso desde la página de inicio sin sesión iniciada | Completo el formulario de registro con datos válidos y envío | El sistema confirma el alta exitosa con un mensaje visible; el usuario queda creado en la base de datos sin crear sesión automática. |
| 2 | El servidor rechaza el alta (username duplicado, email inválido, contraseña débil) | Envío el formulario | Veo un mensaje describiendo el error del servidor sin inconsistencia en la interfaz. |
| 3 | Dejo campos obligatorios vacíos o con formato incorrecto | Intento enviar | El formulario muestra validaciones por campo y no realiza la petición al servidor. |

---

### US-02 — Inicio de sesión (Login)

**ID:** US-02
**Título:** Inicio y cierre de sesión
**Prioridad:** Must · **MoSCoW:** M
**Estimación:** 5 SP

**Historia:** Como **usuario registrado**, **quiero** iniciar sesión con mi nombre de usuario y contraseña, **para** acceder a las funciones protegidas del panel (postular, publicar, mensajería).

**Criterios de aceptación:**

| # | Dado que | Cuando | Entonces |
|---|----------|--------|----------|
| 1 | Tengo credenciales válidas | Envío login en `/login` | El sistema almacena el token DRF, establece cabecera `Authorization: Token` y me redirige a `/panel`. |
| 2 | Usuario o contraseña son incorrectos | Envío el formulario | Veo mensaje de error ("Credenciales inválidas") y permanezco en login. |
| 3 | Tengo sesión activa | Pulso "Salir" en la barra de navegación | El token se invalida en servidor, el estado local se limpia y vuelvo a estado visitante en la página de inicio. |

---

### US-03 — Gestión de perfil / organización

**ID:** US-03
**Título:** Gestión de mi organización (perfil organizador)
**Prioridad:** Must · **MoSCoW:** M
**Estimación:** 8 SP

**Historia:** Como **usuario autenticado con rol de organización**, **quiero** crear, editar y eliminar los datos de mi organización (nombre, descripción, email, teléfono, sitio web), **para** identificarme frente a los voluntarios al publicar oportunidades.

**Criterios de aceptación:**

| # | Dado que | Cuando | Entonces |
|---|----------|--------|----------|
| 1 | Tengo sesión iniciada y datos válidos | Completo el formulario de alta de organización y guardo | La organización aparece en mi listado de organizaciones tras refresco de datos del panel. |
| 2 | Existe una organización de mi propiedad | Modifico campos y guardo | Los cambios se reflejan contra `PATCH` API correctamente. |
| 3 | Confirmo la eliminación de una organización | Ejecuto eliminar | La organización desaparece del listado y las oportunidades asociadas se gestionan según cascada del modelo. |

---

### US-04 — Listado principal de oportunidades

**ID:** US-04
**Título:** Exploración de convocatorias (feed principal)
**Prioridad:** Must · **MoSCoW:** M
**Estimación:** 5 SP

**Historia:** Como **visitante o usuario autenticado**, **quiero** ver un listado de oportunidades de voluntariado **activas** con datos de ubicación, causa, tipo de actividad y disponibilidad en cada tarjeta, **para** evaluar rápidamente dónde puedo colaborar.

**Criterios de aceptación:**

| # | Dado que | Cuando | Entonces |
|---|----------|--------|----------|
| 1 | El backend tiene oportunidades con `activa=true` | Abro el panel | Se muestran tarjetas con título, organización, ubicación, causa, tipo de actividad y disponibilidad. |
| 2 | No hay oportunidades activas | Abro el panel | Se muestra un mensaje de lista vacía sin error de aplicación. |
| 3 | Una organización pausa/desactiva una oportunidad | Recargo el feed | La oportunidad pausada ya no aparece en el listado público. |

---

### US-05 — Publicación de oportunidades

**ID:** US-05
**Título:** Publicar y administrar convocatorias
**Prioridad:** Must · **MoSCoW:** M
**Estimación:** 8 SP

**Historia:** Como **organización**, **quiero** crear, editar, pausar y eliminar convocatorias de voluntariado con todos sus datos (título, descripción, ubicación, causa, tipo de actividad, disponibilidad, requisitos, cupos, fecha), **para** atraer postulaciones a mis necesidades.

**Criterios de aceptación:**

| # | Dado que | Cuando | Entonces |
|---|----------|--------|----------|
| 1 | Tengo al menos una organización creada | Publico una convocatoria con datos válidos | Aparece en "Mis publicaciones" y en el feed público si `activa=true`. |
| 2 | Existe una oportunidad mía | Alterno el estado activa/inactiva | El cambio se persiste vía PATCH y se refleja en el feed público. |
| 3 | Quiero eliminar una convocatoria | Confirmo la eliminación | La oportunidad se elimina y desaparece de todos los listados. |

---

### US-06 — Postulación a voluntariados

**ID:** US-06
**Título:** Postularme y gestionar postulaciones
**Prioridad:** Must · **MoSCoW:** M
**Estimación:** 8 SP

**Historia:** Como **voluntario autenticado**, **quiero** postularme a una convocatoria activa, **para** que la organización pueda evaluar mi participación. Como **organización**, **quiero** ver los postulantes y actualizar el estado de las postulaciones (pendiente/aceptada/rechazada), **para** coordinar mi equipo de voluntarios.

**Criterios de aceptación:**

| # | Dado que | Cuando | Entonces |
|---|----------|--------|----------|
| 1 | Hay una convocatoria activa y no tengo postulación previa a ella | Pulso "Postularme" | Se registra la postulación y la interfaz muestra estado coherente (pendiente). |
| 2 | Ya existe una postulación mía para la misma oportunidad | Intento postular nuevamente | El servidor responde HTTP 400 con mensaje de duplicado interpretable por el cliente. |
| 3 | Soy organización con postulantes en mi convocatoria | Cambio el estado de una postulación y guardo | El nuevo estado (aceptada/rechazada) se persiste vía PATCH y se refleja en el listado. |

---

### US-07 — Mensajería con bandeja

**ID:** US-07
**Título:** Mensajería entre organización y voluntario
**Prioridad:** Should · **MoSCoW:** S
**Estimación:** 8 SP

**Historia:** Como **usuario autenticado** (voluntario u organización), **quiero** enviar y leer mensajes en contexto de una oportunidad/postulación, **para** coordinar detalles de la actividad sin depender exclusivamente de WhatsApp o email externo.

**Criterios de aceptación:**

| # | Dado que | Cuando | Entonces |
|---|----------|--------|----------|
| 1 | Tengo sesión activa y un contexto válido (oportunidad/destinatario) | Envío un mensaje con texto válido | El mensaje aparece en el historial tras la operación de guardado; se registra fecha/hora de envío. |
| 2 | Existen mensajes dirigidos a mi cuenta | Abro la sección de mensajes del panel | Puedo revisar mensajes recibidos y enviados vía endpoint `bandeja` del API. |

---

### Resumen de historias y alineación con requisitos

| ID | Título | RF alineado | MoSCoW | SP |
|----|--------|-------------|--------|-----|
| US-01 | Registro de usuario | RF01 | **Must** | 5 |
| US-02 | Login / Logout | RF02 | **Must** | 5 |
| US-03 | Gestión de organización | RF04 | **Must** | 8 |
| US-04 | Listado principal (feed) | RF03 | **Must** | 5 |
| US-05 | Publicar oportunidades | RF05 | **Must** | 8 |
| US-06 | Postulación | RF06 | **Must** | 8 |
| US-07 | Mensajería | RF07 | **Should** | 8 |
| **Total** | | | **6 Must + 1 Should** | **47 SP** |

---

## 8. Entregables, Issues en GitHub y anexos

### Documento principal

Este archivo: .

### Gestión ágil — GitHub Projects (Kanban)

El equipo adoptó **GitHub Projects** como tablero Kanban de trabajo con columnas por estado (Backlog, To Do, In Progress, Done), etiquetas y responsables por tarea, según reuniones registradas en actas. El tablero se mantiene integrado al repositorio como historial de proceso.

### Anexos

| Documento | Ubicación |
|-----------|-----------|
| Documentación del proyecto | [`Documentación/Documentación del proyecto.md`](Documentación/Documentación del proyecto.md) |
| DER y modelo relacional | [`Documentacion/DER_Y_MODELO_RELACIONAL.md`](Documentación/DER_Y_MODELO_RELACIONAL) |
| Esquema SQL | [Link](Documentación/mano-a-mano-esquemaDB) |
| Wiki | [Link](https://github.com/devcordoba/mano-a-mano/wiki/Registro-de-ceremonias)
| Registro de ceremonias Scrum | [Link](https://github.com/devcordoba/mano-a-mano/wiki/Registro-de-ceremonias) |

---

## 9. Bibliografía

- Documentación facilitada por la matería de programacion web, programacion, desarrollo de software y trabajador integrador de la tecnicatura TSDWAD - https://ispc.edu.ar
---