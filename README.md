# mano-a-mano

## Descripción del proyecto

Mano a Mano es una plataforma web que conecta voluntarios con organizaciones que necesitan ayuda. Permite encontrar oportunidades de voluntariado según ubicación, intereses y disponibilidad.

Problema que resuelve: muchas personas quieren ayudar, pero no saben dónde ni cómo hacerlo.

Propuesta de valor: mostrar oportunidades cercanas y facilitar la participación social.

---

## Instrucciones de instalación

1. Clonar repositorio

git clone https://github.com/devcordoba/mano-a-mano.git

2. Ejecutar proyecto

docker compose up --build

3. Frontend

cd Frontend
npm install
ng serve

4. Backend

cd Backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

---

## Uso básico

- Registrarse como voluntario u organización.
- Buscar oportunidades de voluntariado.
- Publicar oportunidades.
- Postularse a actividades.
- Contactar usuarios mediante mensajería.

---

## Lista de requerimientos

### Funcionales

- Registro de usuarios.
- Búsqueda con filtros.
- Publicación de oportunidades.
- Postulación a voluntariados.
- Mensajería interna.

### No funcionales

- Buen rendimiento.
- Seguridad con JWT.
- Diseño responsive.
