# Actividad Nro 3 — Documentación inicial de proyecto de software
## (Programador Web EV2 / Proyecto Integrador II — ISPC)

| Campo | Detalle |
|--------|---------|
| **Proyecto** | **Mano a mano** — Red de voluntarios |
| **Tipo de proyecto** | Aplicación web educativa / comunitaria: oportunidades de voluntariado, postulación y coordinación |
| **Institución** | Instituto Superior Politécnico Córdoba (ISPC) |
| **Carrera** | Tecnicatura Superior en Desarrollo Web y Aplicaciones Digitales |
| **Espacio curricular** | Proyecto Integrador II — 2.° año — 2026 |
| **Docente** | Ing. y Prof. Dianela Accietto |
| **Integrantes del equipo** | Gonzalo Quiroga · Lanfranco Darel Caballero · Lucas Monzón · Pilar Molina · Ivo Konstantinow |
| **Evidencia relacionada** | Evidencia de Aprendizaje N.° 1 — Definición del proyecto (*entrega 26/04/2026*) |
| **Tipo de entrega** | Documento Markdown en repositorio (`docs/`); exportable a Google Docs según consigna |
| **Repositorio** | *(completar URL pública del equipo, p. ej. GitHub)* |
| **Versión del documento** | 1.1 — Mayo 2026 |

---

## Índice

1. [Definición y contexto del proyecto](#1-definición-y-contexto-del-proyecto)  
2. [Viabilidad técnica y económica](#2-viabilidad-técnica-y-económica)  
3. [Alcance del proyecto](#3-alcance-del-proyecto)  
4. [Objetivos SMART](#4-objetivos-smart-del-proyecto)  
5. [Requisitos funcionales y no funcionales](#5-requisitos-funcionales-y-no-funcionales)  
6. [Stakeholders y roles del equipo](#6-identificación-de-stakeholders-y-roles-del-equipo)  
7. [Historias de usuario](#7-historias-de-usuario)  
8. [Entregables, Issues en GitHub y anexos](#8-entregables-issues-en-github-y-anexos)  
9. [Bibliografía](#9-bibliografía)

---

## 1. Definición y contexto del proyecto

### 1.1 Nombre del proyecto

**Mano a mano** — Plataforma web para conectar **voluntarios** con **organizaciones** que publican oportunidades de voluntariado (convocatorias, ubicación, causas y coordinación mediante postulaciones y mensajes).

### 1.2 Problema u oportunidad que resuelve

**Situación relevada (Evidencia N.° 1):** En Córdoba y alrededores, personas con voluntad de participar y organizaciones que necesitan voluntarios suelen encontrar la información en **canales dispersos** (redes sociales, grupos de mensajería, contactos informales). Eso genera baja visibilidad de convocatorias, búsqueda manual poco estructurada, cupos difíciles de cubrir y articulación informal entre oferta y demanda de voluntariado.

El **pain point acordado por el equipo** es la desconexión entre quienes quieren ayudar y quienes necesitan voluntarios: no es primero “falta de voluntad”, sino **falta de articulación y acceso organizado** a oportunidades confiables.

**Oportunidad:** centralizar publicación, exploración, postulaciones y mensajes en **una plataforma web** con API REST y cliente SPA, reduciendo tiempo e incertidumbre para encontrar dónde colaborar y mejorando la coordinación entre actores.

### 1.3 Descripción breve (elevator pitch, máximo 5 oraciones)

**Mano a mano** es una aplicación web que permite registrar usuarios, iniciar sesión de forma segura y explorar oportunidades de voluntariado activas. Las organizaciones pueden dar de alta sus datos, publicar y administrar convocatorias, y revisar postulaciones. Los voluntarios pueden postular y mantener conversaciones enlazadas a esas convocatorias. El sistema está implementado como **SPA Angular** contra una **API REST Django**, pensada para despliegues educativos o comunitarios. El valor central es **acercar oferta y demanda de voluntariado** con trazabilidad básica y roles claros.

### 1.4 Organización o cliente destinatario

- **Cliente institucional:** ISPC — espacio **Proyecto Integrador II** (evaluación según consignas y cronograma 2026); criterios de aceptación coordinados con la docencia.  
- **Usuarios meta (comunidad):** **voluntarios** (personas que desean colaborar en causas sociales); **organizaciones** (fundaciones, asociaciones, grupos comunitarios que requieren voluntarios); **administración técnica / staff** para supervisión en entornos de demo (p. ej. `is_staff` en Django).  
- **Operación del producto:** equipo de cinco integrantes (ver §6) como responsable conjunto de backlog, implementación y documentación en el marco académico.

### 1.5 Justificación del proyecto

- **Pedagógica:** aplica análisis de problema, requisitos, trabajo ágil y stack full-stack (**Angular + Django REST**) alineado al plan de estudios.  
- **Propuesta de valor (EV1):** conecta en forma simple a quien quiere ayudar con quien necesita ayuda, **reduciendo barreras** y **mejorando visibilidad** de iniciativas solidarias en la zona.  
- **Portfolio y extensión:** el MVP es reproducible desde el repositorio documentado y puede evolucionar con nuevas historias (filtros de búsqueda avanzados, notificaciones, etc.).

### 1.6 Referencias PMI — Acta de constitución del proyecto (Project Charter) — Principio del PMBOK 7

**Referencia PMI / PMBOK 7:** el trabajo se alinea al **Principio 2 — Entrega de valor** (*Focus on delivering value to the organization and stakeholders*): el esfuerzo no se centra solo en “tener código”, sino en **habilitar objetivos** (mayor visibilidad de convocatorias, menos fricción al postular, comunicación ordenada entre actores).

| Elemento típico de Charter | Contenido (Mano a mano) |
|----------------------------|-------------------------|
| **Propósito** | Disponibilizar una plataforma web funcional MVP que conecte voluntarios con organizaciones. |
| **Objetivos de alto nivel** | Registro/login, exploración de oportunidades, gestión de organizaciones y convocatorias, postulaciones, mensajería básica, documentación y repositorio presentable. |
| **Stakeholders principales** | Equipo de 5 integrantes; docente PI II / referentes de cátedra; usuarios piloto (voluntarios/organizaciones); institución ISPC. |
| **Supuestos** | Backend Django accesible; base de datos migrada; CORS configurado para el origen del front; equipo con tiempo de cursada. |
| **Restricciones** | Plazos del cuatrimestre; presupuesto de hosting limitado (MVP demo); seguridad nivel **educativo** (no nivel bancario en esta fase sin análisis adicional). |

**Identificar el “por qué” antes del “qué”:** antes de especificar tecnologías, el **valor** es *reducir la brecha información–acción* en voluntariado; el “qué” técnico (Angular, Django, REST) es el medio.

---

## 2. Viabilidad técnica y económica

### 2.1 Viabilidad técnica

| Aspecto | Decisión propuesta | Justificación breve |
|---------|---------------------|---------------------|
| **Stack** | Frontend **Angular 21**, Bootstrap 5 · Backend **Django 6**, **Django REST Framework 3**, autenticación **Token DRF**, **django-cors-headers** | Angular y Django son muy documentados para contexto formativo y separación clara API/SPA. |
| **Base de datos** | **MySQL** (via `mysqlclient`) según proyecto Backend | Robustez habitual en entornos académico–productivos; compatible con DER del repo. |
| **Infraestructura** | Desarrollo **local** (puertos 4200 / 8000); despliegue futuro opcional (**VPS**, **Railway**, **Render**, cloud institucional) | MVP no exige cluster; el DER y README ya contemplan `health` para verificación de servicio. |
| **Conocimientos del equipo** | TS/HTML, patrones SPA, REST, modelo relacional, Git | Coincide con módulo Programador Web; refuerzos vía materiales Scrum/IEEE si hiciera falta. |
| **Dependencias externas** | NPM (Angular), pip (Python), sin APIs de pago obligatorias en MVP | Reduce riesgos de disponibilidad y costo. |
| **Riesgos técnicos** | CORS mal configurado; credenciales en `.env` filtradas; sesión/token inconsistente entre pestañas; deuda si se escope demasiado UX | Mitigaciones: revisar README, usar `.env` ignorado por Git, pruebas manuales sistemáticas, priorizar backlog Must. |

### 2.2 Viabilidad económica

| Concepto | Estimación | Nota |
|----------|-------------|------|
| **Esfuerzo** | Del orden de **150–350 h-persona** en conjunto hasta MVP documentado *(estimación académica; a replanificar en refinamiento Scrum)* | Incluye análisis, código, docs, reuniones de equipo. |
| **Costos** | **Hosting** demo: USD 0–15/mes según proveedor estudiantil gratuito vs VPS mínimo; **licencias**: stack principal **$0** (OSS). | Presupuesto **estimado** salvo cotización formal de hosting institucional. |
| **ROI / beneficio** | **Cualitativo:** reducción percibida de tiempo para publicar/leer una convocatoria vs canales dispersos (WhatsApp, PDF); **capital humano:** portfolio y prácticas profesionales. |

*Indique en la versión PDF/Google Docs si el presupuesto presentado fue **cotizado**, **subsidiado por la institución** o **solo estimación académica**.*

---

## 3. Alcance del proyecto

### 3.1 Qué incluye (in scope)

- **Registro de usuario** desde la página de inicio (validación cliente + alta vía API).  
- **Inicio/cierre de sesión** con **token DRF** e interceptor en el cliente Angular.  
- **Panel único** con feed de **oportunidades activas**, secciones de **postulaciones**, **mis publicaciones**, **postulantes**, **organizaciones**, **publicación de convocatorias** y **mensajes** según estado de sesión y datos del backend.  
- **Gestión REST** coherente con el cliente actual: usuarios (**lista + alta**), organizaciones (**CRUD**), oportunidades (**CRUD** + filtros de listado `activa` y `organizacion`), postulaciones (**lista + crear + actualizar**), mensajes (**POST** y **bandeja** por usuario consultado).  
- **Rutas** `/inicio`, `/nosotros`, `/login`, `/panel`; **guard** para evitar uso de login con sesión ya iniciada.  
- **Healthcheck API** (`GET /api/health/`) para operación.  
- **Documentación** en repo: README, DER, especificación IEEE-style en `docs/requisitos.md`.

**Tipos de usuarios:** visitante, usuario autenticado (voluntario u organizador según perfil/back), usuario **staff demo** (`is_staff`) con selector de usuario en panel.

**Plataformas:** **navegadores modernos** (Chrome, Firefox, Edge) en escritorio y visualización adaptable vía Bootstrap; sin app nativa móvil dedicada.

**Integraciones:** **ninguna** API comercial obligatoria; integración cliente↔servidor REST propia únicamente.

### 3.2 Alineación Evidencia N.° 1 ↔ implementación actual

La **Evidencia de Aprendizaje N.° 1** plantea búsqueda con filtros por **ubicación, causa, tipo de actividad y disponibilidad** y registro distinguiendo voluntario u organización **a nivel de narrativa de negocio**. En el **MVP documentado en el repositorio**:

- Los campos **ubicación, causa, tipo de actividad y disponibilidad** forman parte del **modelo y de las tarjetas/listados**, de modo que el usuario **identifica** convocatorias pertinentes al leer la lista; sin embargo, el **filtro por query string** sobre el listado público en API está, en esta iteración, limitado a **`activa`** y **`organizacion`** (ver [`requisitos.md`](./requisitos.md), RF-04 y nota final). Una ampliación con filtros dinámicos en API y UI queda como **mejora futura** explícita.

- El **alta de usuario** desde el sitio crea la cuenta vía `POST /api/usuarios/`; el **rol** Voluntario / Organización se modela en **`PerfilUsuario`** (Django Admin / datos de seeded); el formulario público de registro no solicita hoy el rol en un único paso — comportamiento acotado del MVP, documentado también en `requisitos.md`.

- **Autenticación:** la implementación usa **token opaco de Django REST Framework** (`Authorization: Token …`), no JWT. Cualquier mención a “JWT” en documentos previos de trabajo se considera **superada** por esta versión.

### 3.3 Qué no incluye (out of scope)

- **Pasarelas de pago**, donaciones en línea, facturación.  
- **Notificaciones push**, email transaccional automático desde el MVP *(excepto configuración Django por admin si fuera opcional).*  
- **Búsqueda full-text por API** sobre ubicación/causa/tipo de actividad como filtros GET *(los campos existen como **datos** de la convocatoria, pero el listado filtrado en API en esta iteración está acotado a `activa` y `organizacion`).*  
- Endpoint REST público **`/api/perfiles/`** (los perfiles permanecen solo en modelo y **admin**; el SPA no lo consume).  
- **App móvil nativa**, **PWAs** avanzadas, **CI/CD obligatorio**.  
- **Nivel seguridad tipo OWASP ASVS máximo**: el alcance actual es MVP académico con buenas prácticas básicas (token, CORS, validación servidor).

### 3.4 Cliente vs. equipo (responsabilidades)

| Área | Cliente institucional / negocio | Equipo desarrollo |
|------|-------------------------------|-------------------|
| Aprobación alcance inicial y criterios de aceptación | Valida HU Must | Propone HU y backlog |
| Infra institucional (si aplica) | Proveer DB/host cuando corresponda | Desplegar y documentar comandos |
| Datos demo y cumplimiento legal (datos personales) | Orientar uso académico | No tratar datos reales sin consentimiento |
| Diseño contenido institucional (textos “Nosotros”) | Opcional revisión copy | Implementa vistas estáticas |

---

## 4. Objetivos SMART del proyecto

### O1 — Funcionalidades core navegables y documentadas

| Letra SMART | Formulación |
|-------------|-------------|
| **S** | Completar registro de usuario, login con token y panel funcional contra API en entorno documentado README. |
| **M** | **100 %** de flujos Must (registro, login, visualizar feed, CRUD organización u oportunidad según usuario, al menos una postulación y un mensaje) ejecutables manualmente sin error bloqueante. |
| **A** | Alcanzable con stack establecido y tiempo de cursada previo revisión backlog. |
| **R** | Relevante para evaluación PI II / Programador Web y demostración competencia full-stack (ISPC). |
| **T** | Antes de **cierre de mesa / entrega correspondiente al 2.° cuatrimestre 2026** según cronograma ISPC publicado en el espacio curricular. |

### O2 — Especificación de requisitos rastreable

| Letra SMART | Formulación |
|-------------|-------------|
| **S** | Mantener artefactos de RF/RNF e historias con criterios de aceptación Gherkin. |
| **M** | Mínimo **6 RF** Must/Should cubiertos por **≥5 HU** Must con CA; backlog referenciado en Issues GitHub *(ver §8).* |
| **A** | Alcance contenido en el cronograma de la materia + doc ya presente (`docs/requisitos.md`). |
| **R** | Habilitar evaluación transparente tipo industria (**trazabilidad**). |
| **T** | Actualizado en la **misma ventana de entrega** que esta Actividad 3 (documentación inicial + referencia a Issues/tablero del equipo). |

### O3 — Calidad técnica mínima reproducible

| Letra SMART | Formulación |
|-------------|-------------|
| **S** | Build frontend sin errores; backend con `migrate` y contrato API alineado a README/DER. |
| **M** | `npm run build` código **0** en entrega; documentación DER coherente con tablas físicas Django. |
| **A** | Con hardware estándar y guía instalación README. |
| **R** | Otro desarrollador puede **clonar y ejecutar** según checklist README. |
| **T** | Verificado con `ng build` y comprobación manual de flujos antes de la **presentación** acordada en el calendario PI II. |

---

## 5. Requisitos funcionales y no funcionales

*Numeración tipo **RF01** solicitada por la actividad. Detalle IEEE extendido disponible como anexo operativo en [`requisitos.md`](./requisitos.md).*  

**Leyenda MoSCoW:** **M** = Must, **S** = Should, **C** = Could, **W** = Won't (esta iteración).

### 5.1 Requisitos funcionales (≥6)

| ID | Actor | Prioridad | Descripción | Criterio de aceptación breve |
|----|-------|-----------|-------------|-------------------------------|
| **RF01** | Visitante | **M** | Registrar usuario con username, email, contraseña (y opcional nombre/apellido) con validación en cliente | Tras alta válida, mensaje confirmación visible y usuario creado vía API; errores muestran detalle servidor. |
| **RF02** | Usuario | **M** | Iniciar y cerrar sesión con usuario/contraseña; servidor emite/revoca **token DRF** | Sesión establece cabecera `Authorization: Token` en llamadas siguientes y logout elimina uso práctico del token en cliente/servidor. |
| **RF03** | Visitante/usuario | **M** | Explorar **oportunidades de voluntariado** desde el panel: listado centrado en convocatorias **activas**, mostrando en cada ítem ubicación, causa, tipo de actividad y disponibilidad (datos del modelo) | El cliente obtiene el feed con `activa=true`; la **búsqueda filtrada por API** adicional (ubicación/causa/etc.) queda fuera del MVP actual (ver §3.2). |
| **RF04** | Usuario org. | **M** | Gestionar **organizaciones** propias (alta/edición/eliminación) | CRUD vía REST coherente y reflejo en UI sin inconsistencia bloqueante. |
| **RF05** | Usuario org. | **M** | Gestionar **oportunidades** (CRUD + alternar visible activa/inactiva) | Crear/editar/borrar o pausar refleja en listados después de refresco de datos definido por la aplicación. |
| **RF06** | Voluntario / Org. | **M** | **Postular** a oportunidad y cambiar estado de postulaciones como organizador | Alta postulación; duplicados devuelven error entendido; PATCH estado persiste desde panel. |
| **RF07** | Usuario autenticado | **S** | **Mensajería contextual** entre partes usando bandeja por usuario | Enviar mensaje y reconstruir hilos mostrados con datos bandeja. |
| **RF08** | Visitante | **S** | Páginas informativas (inicio, quienes somos) | Rutas SPA cargan contenido definido sin error. |

### 5.2 Requisitos no funcionales (≥4)

| ID | Categoría | Prioridad | Descripción | Métrica / verificación breve |
|----|-----------|-----------|-------------|------------------------------|
| **RNF01** | Seguridad / autenticación | **M** | Contraseña nunca persistida texto plano; token en servidor (DRF Token) | Revisión `User.set_password`; flujo logout elimina Token en backend. |
| **RNF02** | Portabilidad / compatibilidad | **M** | Stack corre en desarrollo estándar (Windows/Linux) según README | Checklist instalación ejecutada por par docente/compañero otro equipo. |
| **RNF03** | Interoperabilidad | **M** | API JSON UTF-8, CORS origen SPA documentado | Llamadas `ng serve` → `localhost:4200` aceptadas en settings CORS ejemplo. |
| **RNF04** | Mantenibilidad | **S** | Código cliente alineado a carpetas (`pages`, `services`, `core`, `shared`, `models`) | Revisión estructura en README coincide con carpeta física repo. |
| **RNF05** | Rendimiento MVP | **C** | `ng build` completa sin fallo en equipo de desarrollo | Exit code **0** en build entrega *(no garantiza SLA prod sin medición).* |
| **RNF06** | Usabilidad / responsive | **S** | Interfaz comprensible para usuario nuevo; layout adaptable (Bootstrap) en vistas clave | Meta qualitative EV1: completar registro y flujo hasta postular en **≤ 5 min** en condiciones de práctica guiada *(medición en sprint de usability, no garantía contractual).* |

**Normas WCAG:** objetivo MVP: no bloquear teclado básico y aprovechar contraste/grid de Bootstrap; **no se certifica** WCAG 2.x AA hasta análisis explícito (**Could** sprint futuro).

---

## 6. Identificación de stakeholders y roles del equipo

### 6.1 Mapa de stakeholders

| Stakeholder | Rol/tipo | Interés | Influencia | Expectativas principales | Canal comunicación |
|-------------|-----------|---------|-------------|---------------------------|---------------------|
| **Ing. y Prof. Dianela Accietto** | Docente PI II | Alto | Alta | Documentación profesional, criterios de evaluación, avances acordes al cronograma | Aula institucional / LMS / correo institucional |
| **Integrantes equipo Mano a mano** | Internos | Alto | Alta | Alcance viable, trabajo coordinado y trazabilidad en tableros y repo | Reuniones virtuales registradas en actas, Trello, chat de equipo |
| **ISPC — coordinación carrera / secretaría** | Institución | Medio | Medio | Cumplimiento normativas cursada, prácticas, fechas institucionales | Canales institucionales habituales |
| **Usuario meta voluntario** | Beneficiario proyecto | Alto | Media | Registrar, explorar convocatorias y postular sin fricción excesiva | Pruebas con usuarios, feedback en demo |
| **Usuario meta organización** | Beneficiario proyecto | Alto | Media | Publicar necesidades y coordinar voluntarios desde el panel | Pruebas y validación incremental |

### 6.2 Roles del equipo Scrum (adaptación académica — según distribución EV1)

| Rol / función | Integrante | Responsabilidades principales |
|---------------|------------|------------------------------|
| **Coordinación y seguimiento (PM)** — *facilita agenda y comunicación con docente* | Gonzalo Quiroga | Cronograma, actas de reunión, coherencia de entregables documentales |
| **Levantamiento de negocio (BA) — cercano a Product Owner** | Pilar Molina | Pain points, requisitos funcionales/no funcionales, historias de usuario y criterios de aceptación |
| **Desarrollo full stack / arquitectura base** | Lucas Monzón | Repositorio, API Django, SPA Angular, alineación README–código–DER |
| **UX/UI y consistencia de interfaz** | Lanfranco Darel Caballero | Flujos de navegación, usabilidad, coherencia visual (Bootstrap/layout) |
| **QA / calidad y revisión funcional-documental** | Ivo Konstantinow | Validación contra CA, pruebas manuales, coherencia doc–producto |

*En clase se puede nombrar formalmente **Scrum Master** a quien facilita las ceremonias recurrentes — rol compatible con Gonzalo Quiroga o rotación corta entre integrantes, según decisión registrada en acta.*

| Rol Scrum (literatura oficial) | Asignación sugerida en el equipo |
|--------------------------------|----------------------------------|
| **Product Owner** | Pilar Molina (prioriza HU con validación conjunta del PM y equipo) |
| **Scrum Master** | Gonzalo Quiroga (impediments, orden en ceremonias cortas; rotación opcional por sprint) |
| **Developers** | Lucas Monzón, Lanfranco Darel Caballero, Gonzalo Quiroga, Pilar Molina, Ivo Konstantinow *(según disponibilidad y tareas por sprint)* |

---

## 7. Historias de usuario

**Formato:** *Como [usuario], quiero [acción], para [valor].*

**Prioridad Must** alineadas a RF01–RF06. **Story Points (SP)** orientativos.*

---

### US-01 — Registro de usuario público  
**Prioridad:** Must · **MoSCoW:** M · **Estimación:** 5 SP  
**Historia:** Como **visitante sin cuenta**, **quiero** registrarme con usuario, correo y contraseña válidos, **para** poder después iniciar sesión y usar el panel.  

**Criterios de aceptación**  
- **Dado que** ingreso desde la página de inicio sin sesión iniciada  
- **Cuando** completo el formulario de registro con datos válidos y envío  
- **Entonces** el sistema confirma el alta exitosa y muestra mensaje definido sin crear sesión automática.  
- **Dado que** el servidor rechaza el alta (dato duplicado o inválido)  
- **Cuando** envío  
- **Entonces** veo mensaje describiendo el rechazo sin dejar inconsistencia en cliente.

---

### US-02 — Inicio de sesión  
**Prioridad:** Must · **MoSCoW:** M · **Estimación:** 5 SP  
**Historia:** Como **usuario registrado**, **quiero** iniciar sesión con usuario y contraseña, **para** acceder a funciones protegidas del panel.  

**Criterios de aceptación**  
- **Dado que** tengo credenciales válidas  
- **Cuando** envío login  
- **Entonces** el sistema almacena el token conforme estrategia implementada y me redirecciona a `/panel` o `returnUrl` seguro definido por la aplicación.  
- **Dado que** usuario o contraseña son incorrectos  
- **Cuando** envío  
- **Entonces** veo error de login y permanezco en login.

---

### US-03 — Exploración de convocatorias  
**Prioridad:** Must · **MoSCoW:** M · **Estimación:** 3 SP  
**Historia:** Como **visitante o usuario**, **quiero** ver un listado de oportunidades **activas** con datos de ubicación, causa, tipo de actividad y disponibilidad, **para** evaluar rápidamente dónde puedo colaborar *(alineado a HU02 EV1 — la versión actual del MVP muestra estos datos por ítem; no aplica todavía filtrado por API en cada dimensión, ver §3.2).*  

**Criterios de aceptación**  
- **Dado que** el backend devuelve oportunidades con `activa=true` para el feed  
- **Cuando** abro el panel  
- **Entonces** se muestran tarjetas con título, organización, ubicación, causa y demás campos configurados por el equipo.  
- **Dado que** no hay oportunidades  
- **Cuando** abro el panel  
- **Entonces** se muestra mensaje de lista vacía sin error bloqueante de aplicación.

---

### US-04 — Gestión de mi organización  
**Prioridad:** Must · **MoSCoW:** M · **Estimación:** 8 SP  
**Historia:** Como **usuario organizador**, **quiero** crear y editar datos de organización donde publico voluntariados, **para** identificarme frente voluntarios en la plataforma.  

**Criterios de aceptación**  
- **Dado que** inicio sesión  
- **Cuando** completo alta de organización con campos obligatorios  
- **Entonces** la organización aparece en listado después del refresco de datos del panel.  
- **Cuando** edito datos y guardo  
- **Entonces** el cambio se refleja respecto información retornada por API.

---

### US-05 — Publicar voluntariados  
**Prioridad:** Must · **MoSCoW:** M · **Estimación:** 8 SP  
**Historia:** Como **organización**, **quiero** crear y mantener convocatorias (incluir pausas o edición/borrado), **para** atraer postulaciones a mis necesidades.  

**Criterios de aceptación**  
- **Dado que** tengo al menos una organización  
- **Cuando** publico convocatoria válida por formulario  
- **Entonces** aparece en “mis publicaciones” y en feed público si cumple `activa=true`.  
- **Cuando** pauso/actividado o borro desde acciones disponibles UI  
- **Entonces** el comportamiento debe ser coherente con respuesta PATCH/DELETE del backend MVP.

---

### US-06 — Postularme y gestionar postulaciones  
**Prioridad:** Must · **MoSCoW:** M · **Estimación:** 8 SP  
**Historia:** Como **voluntario autenticado**, **quiero** postularme a una convocatoria activa, **para** que la organización pueda valorar mi participación (**HU04 EV1**). Como **usuario organización**, **quiero** actualizar el estado de las postulaciones (pendiente/aceptada/rechazada, etc.), **para** ordenar mi equipo (**RF06**).

**Criterios de aceptación**  
- **Dado que** la convocatoria está visible y disponible para postular según las reglas de la aplicación  
- **Cuando** pulso **Postularme** desde el voluntario sin postulación previa equivalente  
- **Entonces** se registra la postulación y la interfaz muestra estado coherente.  
- **Dado que** ya existe una postulación para el mismo par voluntario–oportunidad  
- **Cuando** intento postular nuevamente  
- **Entonces** el servidor responde con error interpretable por el cliente.  
- **Dado que** actúo como organización ante postulaciones de mi convocatoria  
- **Cuando** cambio el estado y persisto desde el panel  
- **Entonces** el nuevo estado se refleja tras actualización de datos.

---

### US-07 — Mensajería con bandeja  
**Prioridad:** Should *(media en backlog EV1; implementada en alcance MVP documentado)* · **MoSCoW:** S · **Estimación:** 8 SP  
**Historia:** Como **usuario autenticado** (voluntario u organización), **quiero** enviar y leer mensajes en contexto de una postulación/convocatoria, **para** coordinar la actividad sin depender solo de WhatsApp/email externo (**HU05 EV1**).

**Criterios de aceptación**  
- **Dado que** tengo sesión y contexto válido para el hilo actual  
- **Cuando** envío un texto de mensaje de longitud válida según UX  
- **Entonces** el mensaje aparece en el historial después de la operación de guardado esperada por el cliente.  
- **Dado que** existen mensajes para mi cuenta  
- **Cuando** abro la sección de mensajes del panel  
- **Entonces** puedo revisar elementos recibidos y enviados vía recurso **`bandeja`** del API.

---

## 8. Entregables, Issues en GitHub y anexos

### Documento principal (esta actividad)

- Este archivo: **`docs/actividad-3-documentacion-inicial-proyecto.md`**. *(Exportación sugerida: copiar contenido a **Google Docs** con carátula institucional, fuente tamaño estándar, **5–15 páginas** cuerpo salvo bibliografía/anexos largos).*  

### Gestión ágil complementaria — Trello *(Evidencia N.° 1)*

El equipo adoptó **Trello** como tablero de trabajo (columnas por estado, etiquetas y responsables por tarea según reuniones registradas — actas mar/abr 2026). Mantener vivo el tablero académico sirve como **historial de proceso** paralelo al repositorio. **Para la consigna de Actividad 3:** pegar también el link de GitHub Issues exigido abajo si la cátedra pide artefactos en ambas herramientas.

### Issues en GitHub (obligatorio actividad / consigna)

Carga el backlog inicial creando Issues con el **título**: `HU-XY — [breve]` y cuerpo con Historia + **Dado/Cuando/Entonces**.

**Enlaces a incluir en la versión entregada al docente (completar con URLs reales):**  
`* [ ] Link al repositorio Git: _____________________`  
`* [ ] Link a tablero Trello (opcional práctica equipo): _____________________`  
`* [ ] Link a Projects/GitHub Issues (etiqueta `hu`): _____________________`  

**Ejemplo de primera Issue (copiar/pegar):**

```
Título: US-01 — Registro público usuario
Historia: Como visitante...

Criterios de aceptación:
1. Dado... Cuando... Entonces...
Etiquetas: hu, Must, Frontend, Backend
SP: 5
```

### Anexos

| Anexo | Ubicación en repo / nota |
|-------|--------------------------|
| Especificación RF/RNF detallada (IEEE 830) | [`docs/requisitos.md`](./requisitos.md) |
| DER relacional | [`Backend/docs/DER_Y_MODELO_RELACIONAL.md`](../Backend/docs/DER_Y_MODELO_RELACIONAL.md) |
| Instalación y endpoints | [`README.md`](../README.md) |
| Evidencia de Aprendizaje N.° 1 (PDF/capturas/actas) | Entregar según carpeta de cursada o pegar en Google Docs de entrega oficial |

---

## 9. Bibliografía

1. Project Management Institute. *A Guide to the Project Management Body of Knowledge (PMBOK® Guide).* **Séptima edición.** PMI, 2021. *(Principios, incluyendo **entrega de valor**).*  
2. Schwaber, K. & Sutherland, J. *The Scrum Guide.* **2020.** scrumguides.org *(roles, artefactos, definición trabajo incremental).*  
3. IEEE Computer Society. *IEEE Recommended Practice for Software Requirements Specifications.* **IEEE Std 830-1998** *(o materiales actualizados de ingeniería de requisitos que cite la cátedra).*  
4. ISO/IEC 25010:2011 *Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE).* *(Calidad uso para RNF).*  
5. Django Software Foundation — documentación oficial **Django** y **Django REST framework**. Angular team — documentación **Angular.**  

---

## Checklist rápido de entrega (Actividad 3)

- [ ] Índice y numeración coherentes §1–§9  
- [ ] ≥3 objetivos SMART  
- [ ] ≥6 RF con MoSCoW y actor  
- [ ] ≥4 RNF mesurables/testables en lo posible  
- [ ] Tabla stakeholders + roles Scrum *(nombres reales cumplidos)*  
- [ ] ≥5 HU Must (este documento incluye **US-01 a US-06** Must + **US-07** Should mensajería / EV1) formato estándar + CA + SP  
- [ ] Bibliografía con **PMBOK 7** y **Scrum Guide 2020**  
- [ ] Link repos/Issues en versión Docs/PDF oficial  
- [ ] Anexo `requisitos.md` referenciado

---

*Documento revisado para ISPC · Proyecto Integrador II / Actividad 3 documentación inicial — **Mano a mano** (v. 1.1).*  
