# mano-a-mano

## Descripción del proyecto

Mano a Mano es una plataforma web que conecta voluntarios con organizaciones que necesitan ayuda. Permite encontrar oportunidades de voluntariado según ubicación, intereses y disponibilidad.

Problema que resuelve: muchas personas quieren ayudar, pero no saben dónde ni cómo hacerlo.

Propuesta de valor: mostrar oportunidades cercanas y facilitar la participación social.

---

## Instrucciones de instalación

1. Clonar repositorio

git clone https://github.com/devcordoba/mano-a-mano.git

2. Frontend

```bash
cd Frontend
npm install
ng serve
```

3. Backend

```bash
cd Backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
copy .env_modelo .env
python manage.py migrate
python manage.py runserver
```

---

## Uso básico

### Usuarios voluntarios

- Registrarse en la plataforma.
- Buscar oportunidades disponibles.
- Filtrar por ubicación o actividad.
- Postularse a voluntariados.
- Recibir mensajes de organizaciones.

### Organizaciones

- Registrarse como organización.
- Publicar oportunidades.
- Editar publicaciones.
- Revisar postulaciones.
- Contactar voluntarios.

---

## Lista de requerimientos

### Funcionales

- RF1: Registro de usuarios como voluntarios u organizaciones.
- RF2: Búsqueda de oportunidades con filtros.
- RF3: Publicación, edición y eliminación de oportunidades.
- RF4: Postulación a voluntariados activos.
- RF5: Mensajería entre organizaciones y voluntarios.


### No funcionales

- RNF1: Buen rendimiento y navegación fluida.
- RNF2: Seguridad mediante autenticación con **token opaco de Django REST Framework** (`Authorization: Token …`), no JWT.
- RNF3: Control de acceso por roles.
- RNF4: Diseño responsive para dispositivos móviles.
- RNF5: Uso intuitivo y accesible.

## Endpoints base

- Frontend: http://localhost:4200
- Backend: http://localhost:8000
- API Healthcheck: http://localhost:8000/api/health/
- API Oportunidades: http://localhost:8000/api/oportunidades/

---
## Estado del proyecto

En desarrollo.

---

## Equipo

PLIGAT Devs  
DevCordoba