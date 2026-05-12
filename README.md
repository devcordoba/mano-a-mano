# Mano a mano — Red de voluntarios

Mano a mano es una plataforma web que conecta **voluntarios** con **organizaciones sociales** que necesitan ayuda. Permite publicar oportunidades de voluntariado, explorar convocatorias activas, postularse y coordinar actividades mediante mensajería contextual.

**Problema que resuelve:** las personas quieren ayudar, pero no saben dónde ni cómo hacerlo. La información sobre voluntariados está fragmentada en redes sociales, grupos de mensajería y contactos informales.

**Propuesta de valor:** centralizar la publicación y búsqueda de oportunidades de voluntariado en una plataforma única, reduciendo barreras de participación y mejorando la visibilidad de iniciativas solidarias.

---

## Instrucciones de instalación

### Prerrequisitos

- **Git**
- **Node.js** 22+ y **npm**
- **Python** 3.12+
- **MySQL** 8.0 (o Docker)

### 1. Clonar el repositorio

```bash
git clone https://github.com/devcordoba/mano-a-mano.git
cd mano-a-mano
```

### 2. Backend
```bash
cd Backend

# Crear y activar entorno virtual
python3 -m venv .venv
#source .venv/bin/activate        # Linux/macOS
.venv\Scripts\activate         # Windows

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env_modelo .env
# Editar .env con los datos de tu base de datos MySQL

# Ejecutar migraciones
python manage.py migrate

# Iniciar el servidor
python manage.py runserver
```

El backend queda disponible en **http://localhost:8000**.

### 3. Frontend (Angular)

```bash
cd Frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
ng serve
```

El frontend queda disponible en **http://localhost:4200**.

### 4. Alternativa con Docker

```bash
# O usar los scripts interactivos:
#./setup.linux.sh        # Linux
setup.windows.bat     # Windows
```
---

## Integrantes del equipo y roles

| Nombre | Rol | Usuario de Github |
|--------|-----|-------------------|
| Pilar Molina | Developer | https://github.com/LindaInfinita10 |
| Lucas Monzón | Developer | https://github.com/lcmonzon |
| Ivo Konstantinow | Developer | https://github.com/konstantinowivo |
| Gonzalo Nicolás Quiroga | Scrum Master/Developer | https://github.com/Gonzalo-Quiroga |
| Lanfranco Darel Caballero | Product Owner/Developer | https://github.com/dbm4x |

---

## Stack tecnológico

|  | Tecnología | Versión |
|------|-----------|---------|
| Frontend | Angular/Bootstrap| 21/5
| Backend | Django/Django REST Framework |
| Base de datos | MySQL | 8.0 |

---

## Uso básico

### Visitante
1. Abrir http://localhost:4200 para ver la página de inicio.
2. Registrarse con usuario, email y contraseña desde el formulario de la página de inicio.

### Voluntario
1. Iniciar sesión en `/login`.
2. Explorar oportunidades activas en el panel.
3. Postularse a una convocatoria con el botón "Postularme".
4. Ver el estado de postulaciones en la pestaña "Mis postulaciones".
5. Enviar y recibir mensajes desde la pestaña "Mensajes".

### Organización
1. Iniciar sesión.
2. Crear una organización desde "Mis organizaciones".
3. Publicar oportunidades de voluntariado desde "Publicar oferta".
4. Revisar postulantes y cambiar estados (aceptar/rechazar) en "Postulantes".
5. Coordinar con voluntarios mediante mensajería.

---


## Documentación

| Documento | Ubicaación |
|-----------|------------|
| Documentación del proyecto | [Documentación completa](https://github.com/devcordoba/mano-a-mano/blob/main/Documentaci%C3%B3n/Documentaci%C3%B3n%20del%20proyecto.md) |
| DER y modelo relacional | [`Documentación/DER_Y_MODELO_RELACIONAL.md`](https://github.com/devcordoba/mano-a-mano/blob/main/Documentación/DER_Y_MODELO_RELACIONAL.md) |
| Esquema SQL | [`Documentación/mano-a-mano-esquemaDB.sql`](https://github.com/devcordoba/mano-a-mano/blob/main/Documentación/mano-a-mano-esquemaDB.sql) |
| Wiki | [Link](https://github.com/devcordoba/mano-a-mano/wiki) |
| Registro de ceremonias Scrum | [Link](https://github.com/devcordoba/mano-a-mano/wiki/Registro-de-ceremonias) |
---