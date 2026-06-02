
from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from api.models import (
    CausaVoluntariado,
    EstadoPostulacion,
    Mensaje,
    OportunidadVoluntariado,
    Organizacion,
    PerfilUsuario,
    Postulacion,
    Rol,
    TipoActividad,
)
from api.opportunity_images import generate_opportunity_image
from api.utilidades import texto_opcional, valor_dict

User = get_user_model()

DEMO_PASSWORD = "demo12345"

ORGANIZACIONES = [
    {
        "username": "fundacion_manos",
        "email": "contacto@fundacionmanos.org.ar",
        "first_name": "María",
        "last_name": "González",
        "telefono": "+54 11 4000-1001",
        "org": {
            "nombre_publico": "Fundación Manos Unidas",
            "email_contacto": "voluntariado@fundacionmanos.org.ar",
            "descripcion": (
                "Promovemos educación complementaria en barrios vulnerables de CABA y GBA. "
                "Trabajamos con escuelas públicas y centros comunitarios."
            ),
            "telefono": "+54 11 4000-1001",
            "sitio_web": "https://fundacionmanos.org.ar",
        },
        "oportunidades": [
            {
                "titulo": "Apoyo escolar en merendero de Flores",
                "descripcion": (
                    "Buscamos voluntarios para acompañar a niños de primaria con tareas escolares "
                    "y lectura. Se brinda capacitación inicial de 2 horas."
                ),
                "ubicacion": "Flores, CABA",
                "causa": "Educación y alfabetización",
                "tipo": "Apoyo escolar y tareas dirigidas",
                "disponibilidad": "Martes y jueves 17:00–19:00",
                "requisitos": "Paciencia, buena comunicación. No se requiere título docente.",
                "cupos": 4,
                "dias_fecha": 21,
            },
            {
                "titulo": "Taller de alfabetización digital para adultos mayores",
                "descripcion": (
                    "Enseñanza básica de smartphone, correo y trámites en Mi Argentina. "
                    "Grupos reducidos de hasta 8 personas."
                ),
                "ubicacion": "Caballito, CABA",
                "causa": "Educación y alfabetización",
                "tipo": "Informática y alfabetización digital",
                "disponibilidad": "Sábados 10:00–12:00",
                "requisitos": "Conocimientos de uso de celular y paciencia.",
                "cupos": 2,
                "dias_fecha": 35,
            },
        ],
    },
    {
        "username": "verde_urbano",
        "email": "hola@verdeurbano.org",
        "first_name": "Julián",
        "last_name": "Pérez",
        "telefono": "+54 11 4000-2002",
        "org": {
            "nombre_publico": "Verde Urbano ONG",
            "email_contacto": "equipo@verdeurbano.org",
            "descripcion": (
                "Recuperamos espacios verdes, huertas comunitarias y campañas de reciclaje "
                "en la región metropolitana."
            ),
            "telefono": "+54 11 4000-2002",
            "sitio_web": "https://verdeurbano.org",
        },
        "oportunidades": [
            {
                "titulo": "Jornada de limpieza del arroyo Maldonado",
                "descripcion": (
                    "Operativo de limpieza y clasificación de residuos. "
                    "Entrega de elementos de protección y refrigerio."
                ),
                "ubicacion": "Villa Crespo / Chacarita, CABA",
                "causa": "Medio ambiente",
                "tipo": "Medio ambiente y limpieza de espacios públicos",
                "disponibilidad": "Sábado 9:00–13:00 (una jornada)",
                "requisitos": "Mayor de 16 años. Ropa cómoda y botella de agua.",
                "cupos": 15,
                "dias_fecha": 14,
            },
            {
                "titulo": "Huerta comunitaria en Parque Patricios",
                "descripcion": (
                    "Mantenimiento semanal: riego, compost y siembra estacional. "
                    "Ideal para quienes quieren aprender agricultura urbana."
                ),
                "ubicacion": "Parque Patricios, CABA",
                "causa": "Medio ambiente",
                "tipo": "Huertas urbanas y agricultura social",
                "disponibilidad": "Miércoles 18:00–20:00",
                "requisitos": "Ninguno. Guantes provistos.",
                "cupos": 6,
                "dias_fecha": 28,
            },
        ],
    },
    {
        "username": "hospital_norte",
        "email": "voluntarios@hospitalnorte.gob.ar",
        "first_name": "Carolina",
        "last_name": "Ruiz",
        "telefono": "+54 11 4000-3003",
        "org": {
            "nombre_publico": "Hospital Comunitario Norte",
            "email_contacto": "voluntarios@hospitalnorte.gob.ar",
            "descripcion": (
                "Hospital público de referencia. Programa de acompañamiento a pacientes "
                "y apoyo logístico en áreas de baja complejidad."
            ),
            "telefono": "+54 11 4000-3003",
            "sitio_web": "",
        },
        "oportunidades": [
            {
                "titulo": "Acompañamiento a pacientes en sala de espera",
                "descripcion": (
                    "Orientación a familias, entrega de información y contención en guardia. "
                    "Turnos de 3 horas con supervisión del equipo de trabajo social."
                ),
                "ubicacion": "Saavedra, CABA",
                "causa": "Salud y bienestar",
                "tipo": "Voluntariado en hospitales y centros de salud",
                "disponibilidad": "Lunes a viernes, turnos mañana o tarde",
                "requisitos": "Mayor de 18. Certificado de buena conducta (se indica cómo tramitarlo).",
                "cupos": 5,
                "dias_fecha": 10,
            },
        ],
    },
    {
        "username": "red_inclusion",
        "email": "info@redinclusion.org.ar",
        "first_name": "Pablo",
        "last_name": "Fernández",
        "telefono": "+54 11 4000-4004",
        "org": {
            "nombre_publico": "Red Inclusión Buenos Aires",
            "email_contacto": "info@redinclusion.org.ar",
            "descripcion": (
                "Trabajamos por la inclusión laboral y social de personas con discapacidad "
                "y migrantes en situación de vulnerabilidad."
            ),
            "telefono": "+54 11 4000-4004",
            "sitio_web": "https://redinclusion.org.ar",
        },
        "oportunidades": [
            {
                "titulo": "Mentoría para búsqueda de primer empleo",
                "descripcion": (
                    "Acompañamiento en armado de CV, simulacros de entrevista y uso de portales laborales. "
                    "Un encuentro semanal por persona referida."
                ),
                "ubicacion": "San Telmo, CABA (híbrido)",
                "causa": "Inclusión social",
                "tipo": "Campañas de concientización",
                "disponibilidad": "Viernes 15:00–18:00",
                "requisitos": "Experiencia en RRHH o recursos humanos deseable, no excluyente.",
                "cupos": 3,
                "dias_fecha": 45,
            },
            {
                "titulo": "Comedor comunitario - turno de cocina y servicio",
                "descripcion": (
                    "Apoyo en preparación de viandas y servicio de mesa. "
                    "Cocina industrial con protocolo de higiene."
                ),
                "ubicacion": "La Boca, CABA",
                "causa": "Inclusión social",
                "tipo": "Atención en merenderos y comedores comunitarios",
                "disponibilidad": "Domingos 11:00–14:00",
                "requisitos": "Carnet de manipulación de alimentos valorado, no obligatorio.",
                "cupos": 8,
                "dias_fecha": 7,
            },
        ],
    },
    {
        "username": "refugio_patitas",
        "email": "adopciones@refugiopatitas.org",
        "first_name": "Laura",
        "last_name": "Martínez",
        "telefono": "+54 11 4000-5005",
        "org": {
            "nombre_publico": "Refugio Patitas",
            "email_contacto": "adopciones@refugiopatitas.org",
            "descripcion": (
                "Refugio de perros y gatos en tránsito. Buscamos voluntarios para paseos, "
                "socialización y eventos de adopción."
            ),
            "telefono": "+54 11 4000-5005",
            "sitio_web": "https://refugiopatitas.org",
        },
        "oportunidades": [
            {
                "titulo": "Paseo y socialización de perros en adopción",
                "descripcion": (
                    "Salidas de 40 minutos por perro mediano. Inducción obligatoria el primer día."
                ),
                "ubicacion": "Vicente López, GBA Norte",
                "causa": "Animales",
                "tipo": "Voluntariado con animales y refugios",
                "disponibilidad": "Fines de semana, turnos flexibles",
                "requisitos": "Amor por los animales. No apto alérgicos severos.",
                "cupos": 10,
                "dias_fecha": 20,
            },
        ],
    },
    {
        "username": "cultura_barrio",
        "email": "proyectos@culturabarrio.art",
        "first_name": "Nicolás",
        "last_name": "Acosta",
        "telefono": "+54 11 4000-6006",
        "org": {
            "nombre_publico": "Cultura en Barrio",
            "email_contacto": "proyectos@culturabarrio.art",
            "descripcion": (
                "Producción cultural barrial: murales, talleres de arte y festivales "
                "con participación de vecinos."
            ),
            "telefono": "+54 11 4000-6006",
            "sitio_web": "https://culturabarrio.art",
        },
        "oportunidades": [
            {
                "titulo": "Taller de muralismo con jóvenes",
                "descripcion": (
                    "Coordinación de diseño y pintura en muro de escuela secundaria. "
                    "Materiales provistos."
                ),
                "ubicacion": "Barracas, CABA",
                "causa": "Cultura y arte",
                "tipo": "Arte, cultura y talleres creativos",
                "disponibilidad": "Sábados 14:00–18:00 por 4 semanas",
                "requisitos": "Experiencia en arte visual o educación artística.",
                "cupos": 4,
                "dias_fecha": 30,
            },
            {
                "titulo": "Festival barrial - equipo de producción",
                "descripcion": (
                    "Ayuda en montaje, acreditaciones y comunicación el día del evento."
                ),
                "ubicacion": "Boedo, CABA",
                "causa": "Cultura y arte",
                "tipo": "Música, teatro y eventos comunitarios",
                "disponibilidad": "Viernes y sábado (fin de semana del evento)",
                "requisitos": "Proactividad y buena comunicación.",
                "cupos": 12,
                "dias_fecha": 18,
                "activa": True,
            },
        ],
    },
]

VOLUNTARIOS = [
    {
        "username": "ana_voluntaria",
        "email": "ana.mendez@email.com",
        "first_name": "Ana",
        "last_name": "Méndez",
        "intereses": "Educación, niños",
        "disponibilidad": "Tardes entre semana",
    },
    {
        "username": "lucas_ayuda",
        "email": "lucas.rivera@email.com",
        "first_name": "Lucas",
        "last_name": "Rivera",
        "intereses": "Medio ambiente, huertas",
        "disponibilidad": "Fines de semana",
    },
    {
        "username": "sofia_solidaria",
        "email": "sofia.lopez@email.com",
        "first_name": "Sofía",
        "last_name": "López",
        "intereses": "Salud, acompañamiento",
        "disponibilidad": "Mañanas lun–vie",
    },
    {
        "username": "diego_mananas",
        "email": "diego.sosa@email.com",
        "first_name": "Diego",
        "last_name": "Sosa",
        "intereses": "Inclusión, derechos",
        "disponibilidad": "Viernes y algunos sábados",
    },
    {
        "username": "valentina_findes",
        "email": "valentina.torres@email.com",
        "first_name": "Valentina",
        "last_name": "Torres",
        "intereses": "Animales, cultura",
        "disponibilidad": "Sábados y domingos",
    },
    {
        "username": "marcos_tec",
        "email": "marcos.vega@email.com",
        "first_name": "Marcos",
        "last_name": "Vega",
        "intereses": "Tecnología, educación digital",
        "disponibilidad": "Sábados por la mañana",
    },
]

POSTULACIONES = [
    (
        "ana_voluntaria",
        "Apoyo escolar en merendero",
        EstadoPostulacion.PENDIENTE,
        "Tengo experiencia dando clases de apoyo en primaria. Me gustaría sumarme los martes.",
    ),
    (
        "marcos_tec",
        "alfabetización digital",
        EstadoPostulacion.PENDIENTE,
        "Trabajo en soporte informático y puedo ayudar con paciencia a adultos mayores.",
    ),
    (
        "lucas_ayuda",
        "Jornada de limpieza del arroyo",
        EstadoPostulacion.ACEPTADA,
        "Participé en jornadas similares en el Riachuelo. Cuento con equipo básico.",
    ),
    (
        "lucas_ayuda",
        "Huerta comunitaria",
        EstadoPostulacion.PENDIENTE,
        "Quiero aprender agricultura urbana y puedo los miércoles.",
    ),
    (
        "sofia_solidaria",
        "Acompañamiento a pacientes",
        EstadoPostulacion.PENDIENTE,
        "Estudiante de Trabajo Social, tercer año. Disponibilidad mañanas.",
    ),
    (
        "diego_mananas",
        "Mentoría para búsqueda",
        EstadoPostulacion.ACEPTADA,
        "10 años en selección de personal. Me interesa mentoría uno a uno.",
    ),
    (
        "diego_mananas",
        "Taller de muralismo",
        EstadoPostulacion.RECHAZADA,
        "Pintor amateur, portfolio disponible si lo necesitan.",
    ),
    (
        "valentina_findes",
        "Paseo y socialización",
        EstadoPostulacion.ACEPTADA,
        "Tengo dos perros adoptados y experiencia en paseos grupales.",
    ),
    (
        "valentina_findes",
        "Festival barrial",
        EstadoPostulacion.PENDIENTE,
        "Puedo ayudar en producción y redes el fin de semana del evento.",
    ),
]

class Command(BaseCommand):
    help = "Carga usuarios, organizaciones, oportunidades y postulaciones de demostración."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Elimina datos de la app (mensajes, postulaciones, oportunidades, orgs, perfiles demo) antes de cargar.",
        )
        parser.add_argument(
            "--regenerar-imagenes",
            action="store_true",
            help="Regenera las portadas de todas las oportunidades (solo formas, sin texto).",
        )

    def handle(self, *args, **options):
        if options["reset"]:
            self._reset_demo_data()

        with transaction.atomic():
            causas = {c.nombre: c for c in CausaVoluntariado.objects.all()}
            tipos = {t.nombre: t for t in TipoActividad.objects.all()}
            if len(causas) == 0:
                self.stderr.write(
                    self.style.ERROR(
                        "Faltan catálogos de causa/tipo. Ejecutá: python manage.py migrate"
                    )
                )
                return
            if len(tipos) == 0:
                self.stderr.write(
                    self.style.ERROR(
                        "Faltan catálogos de causa/tipo. Ejecutá: python manage.py migrate"
                    )
                )
                return

            usuarios_organizacion = {}
            oportunidades_por_titulo = {}

            for datos_org in ORGANIZACIONES:
                usuario = self._ensure_user(
                    datos_org["username"],
                    datos_org["email"],
                    datos_org["first_name"],
                    datos_org["last_name"],
                    Rol.ORGANIZACION,
                    datos_org["telefono"],
                )
                usuarios_organizacion[datos_org["username"]] = usuario
                telefono_perfil = valor_dict(datos_org, "telefono", "")
                self._ensure_perfil(usuario, Rol.ORGANIZACION, "", "", telefono_perfil)

                datos_entidad_organizacion = datos_org["org"]
                organizacion, _ = Organizacion.objects.update_or_create(
                    propietario=usuario,
                    defaults={
                        "nombre_publico": datos_entidad_organizacion["nombre_publico"],
                        "email_contacto": datos_entidad_organizacion["email_contacto"],
                        "descripcion": datos_entidad_organizacion["descripcion"],
                        "telefono": datos_entidad_organizacion["telefono"],
                        "sitio_web": texto_opcional(datos_entidad_organizacion.get("sitio_web")),
                    },
                )

                for datos_oportunidad in datos_org["oportunidades"]:
                    causa = self._resolve_catalogo(
                        causas, datos_oportunidad["causa"], CausaVoluntariado
                    )
                    tipo = self._resolve_catalogo(
                        tipos, datos_oportunidad["tipo"], TipoActividad
                    )
                    dias_fecha = valor_dict(datos_oportunidad, "dias_fecha", 30)
                    fecha = date.today() + timedelta(days=dias_fecha)
                    oportunidad, _ = OportunidadVoluntariado.objects.update_or_create(
                        organizacion=organizacion,
                        titulo=datos_oportunidad["titulo"],
                        defaults={
                            "descripcion": datos_oportunidad["descripcion"],
                            "ubicacion": datos_oportunidad["ubicacion"],
                            "causa": causa,
                            "tipo_actividad": tipo,
                            "disponibilidad": datos_oportunidad["disponibilidad"],
                            "requisitos": valor_dict(datos_oportunidad, "requisitos", ""),
                            "cupos": valor_dict(datos_oportunidad, "cupos", 1),
                            "fecha_actividad": fecha,
                            "activa": valor_dict(datos_oportunidad, "activa", True),
                        },
                    )
                    self._asignar_imagen_generada(
                        oportunidad,
                        causa.nombre,
                        organizacion.nombre_publico,
                        force=options.get("reset", False),
                    )
                    oportunidades_por_titulo[oportunidad.titulo] = oportunidad

            for oportunidad in OportunidadVoluntariado.objects.select_related("causa", "organizacion"):
                if not oportunidad.tiene_imagen:
                    self._asignar_imagen_generada(
                        oportunidad,
                        oportunidad.causa.nombre,
                        oportunidad.organizacion.nombre_publico,
                    )

            voluntarios = {}
            for datos_voluntario in VOLUNTARIOS:
                usuario = self._ensure_user(
                    datos_voluntario["username"],
                    datos_voluntario["email"],
                    datos_voluntario["first_name"],
                    datos_voluntario["last_name"],
                    Rol.VOLUNTARIO,
                    "",
                )
                voluntarios[datos_voluntario["username"]] = usuario
                self._ensure_perfil(
                    usuario,
                    Rol.VOLUNTARIO,
                    valor_dict(datos_voluntario, "intereses", ""),
                    valor_dict(datos_voluntario, "disponibilidad", ""),
                )

            for clave_voluntario, titulo_parcial, estado, comentario in POSTULACIONES:
                voluntario = voluntarios.get(clave_voluntario)
                if voluntario is None:
                    continue
                oportunidad = self._find_oportunidad(oportunidades_por_titulo, titulo_parcial)
                if oportunidad is None:
                    self.stdout.write(
                        self.style.WARNING(f"Oportunidad no encontrada: {titulo_parcial}")
                    )
                    continue
                Postulacion.objects.update_or_create(
                    voluntario=voluntario,
                    oportunidad=oportunidad,
                    defaults={"estado": estado, "comentario": comentario},
                )

            self._seed_mensajes_ejemplo(voluntarios, usuarios_organizacion, oportunidades_por_titulo)

            if options.get("regenerar_imagenes"):
                for oportunidad in OportunidadVoluntariado.objects.select_related(
                    "causa", "organizacion"
                ):
                    self._asignar_imagen_generada(
                        oportunidad,
                        oportunidad.causa.nombre,
                        oportunidad.organizacion.nombre_publico,
                        force=True,
                    )

        self.stdout.write(self.style.SUCCESS("Seed demo completado."))
        self.stdout.write(f"Contraseña de todos los usuarios demo: {DEMO_PASSWORD}")
        self.stdout.write("")
        self.stdout.write("Organizaciones (login):")
        for datos_org in ORGANIZACIONES:
            self.stdout.write(f"  - {datos_org['username']} → {datos_org['org']['nombre_publico']}")
        self.stdout.write("")
        self.stdout.write("Voluntarios (login):")
        for datos_voluntario in VOLUNTARIOS:
            self.stdout.write(f"  - {datos_voluntario['username']}")
        self.stdout.write("")
        self.stdout.write(
            f"Oportunidades activas: {OportunidadVoluntariado.objects.filter(activa=True).count()}"
        )
        self.stdout.write(
            f"Postulaciones: {Postulacion.objects.count()} | Mensajes: {Mensaje.objects.count()}"
        )

    def _reset_demo_data(self):
        self.stdout.write("Eliminando datos de demostración…")
        demo_usernames = {entrada["username"] for entrada in ORGANIZACIONES} | {
            entrada["username"] for entrada in VOLUNTARIOS
        }
        Mensaje.objects.filter(
            remitente__username__in=demo_usernames,
        ).delete()
        Mensaje.objects.filter(
            destinatario__username__in=demo_usernames,
        ).delete()
        Postulacion.objects.filter(voluntario__username__in=demo_usernames).delete()
        OportunidadVoluntariado.objects.filter(
            organizacion__propietario__username__in=demo_usernames
        ).delete()
        Organizacion.objects.filter(propietario__username__in=demo_usernames).delete()
        PerfilUsuario.objects.filter(user__username__in=demo_usernames).delete()
        User.objects.filter(username__in=demo_usernames).delete()

    def _ensure_user(self, username, email, first_name, last_name, rol, telefono_hint):
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
            },
        )
        if created:
            user.set_password(DEMO_PASSWORD)
            user.save()
        else:
            user.email = email
            user.first_name = first_name
            user.last_name = last_name
            if not user.has_usable_password():
                user.set_password(DEMO_PASSWORD)
            user.save()
        return user

    def _ensure_perfil(self, user, rol, intereses, disponibilidad, telefono=""):
        PerfilUsuario.objects.update_or_create(
            user=user,
            defaults={
                "rol": rol,
                "telefono": telefono,
                "intereses_causas": intereses,
                "disponibilidad_resumen": disponibilidad,
            },
        )

    def _resolve_catalogo(self, cache, nombre, model_cls):
        if nombre in cache:
            return cache[nombre]
        obj = model_cls.objects.filter(nombre__icontains=nombre[:20]).first()
        if obj:
            cache[obj.nombre] = obj
            return obj
        obj, _ = model_cls.objects.get_or_create(
            codigo=nombre.lower().replace(" ", "_")[:32],
            defaults={"nombre": nombre[:120]},
        )
        cache[obj.nombre] = obj
        return obj

    def _asignar_imagen_generada(self, oportunidad, causa_nombre, nombre_organizacion, force=False):
        if oportunidad.tiene_imagen and not force:
            return

        nombre_causa = texto_opcional(causa_nombre)
        nombre_org = texto_opcional(nombre_organizacion)
        png = generate_opportunity_image(
            oportunidad.titulo,
            nombre_causa,
            nombre_org,
        )

        if oportunidad.pk is None:
            sufijo_id = "nueva"
        else:
            sufijo_id = str(oportunidad.pk)
        nombre_archivo = f"oportunidad_{sufijo_id}.png"
        oportunidad.set_imagen_bytes(
            png,
            content_type="image/png",
            nombre=nombre_archivo,
        )
        oportunidad.save(update_fields=["imagen_data", "imagen_tipo", "imagen_nombre"])

    def _find_oportunidad(self, mapping, parcial):
        parcial_minuscula = parcial.lower()
        for titulo, oportunidad in mapping.items():
            if parcial_minuscula in titulo.lower():
                return oportunidad
        return None

    def _seed_mensajes_ejemplo(self, voluntarios, usuarios_organizacion, oportunidades):
        hilos = [
            (
                "lucas_ayuda",
                "verde_urbano",
                "Jornada de limpieza",
                [
                    (
                        "verde_urbano",
                        "lucas_ayuda",
                        "¡Hola Lucas! Tu postulación fue aceptada. Te esperamos el sábado 9:00 en Av. Corrientes y Dorrego.",
                    ),
                    (
                        "lucas_ayuda",
                        "verde_urbano",
                        "Perfecto, ahí estaré. ¿Debo llevar guantes propios o entregan en el lugar?",
                    ),
                    (
                        "verde_urbano",
                        "lucas_ayuda",
                        "Entregamos guantes y bolsas. Traé botella de agua y ropa que pueda mancharse.",
                    ),
                ],
            ),
            (
                "diego_mananas",
                "red_inclusion",
                "Mentoría para búsqueda",
                [
                    (
                        "red_inclusion",
                        "diego_mananas",
                        "Diego, gracias por sumarte al programa de mentoría. ¿Podés el viernes 16:00 para la primera reunión?",
                    ),
                    (
                        "diego_mananas",
                        "red_inclusion",
                        "Sí, confirmado. ¿La reunión es presencial en San Telmo o por videollamada?",
                    ),
                ],
            ),
            (
                "valentina_findes",
                "refugio_patitas",
                "Paseo y socialización",
                [
                    (
                        "refugio_patitas",
                        "valentina_findes",
                        "Valentina, te asignamos turno de paseo los sábados 10:30. La inducción es el primer día 30 min antes.",
                    ),
                ],
            ),
        ]
        for clave_voluntario, clave_organizacion, titulo_oportunidad_parcial, mensajes in hilos:
            voluntario = voluntarios.get(clave_voluntario)
            usuario_organizacion = usuarios_organizacion.get(clave_organizacion)
            oportunidad = self._find_oportunidad(oportunidades, titulo_oportunidad_parcial)
            if voluntario is None:
                continue
            if usuario_organizacion is None:
                continue
            if oportunidad is None:
                continue

            usuarios_por_clave = {**voluntarios, **usuarios_organizacion}
            for clave_remitente, clave_destinatario, cuerpo in mensajes:
                remitente = usuarios_por_clave.get(clave_remitente)
                destinatario = usuarios_por_clave.get(clave_destinatario)
                if remitente is None:
                    continue
                if destinatario is None:
                    continue
                if Mensaje.objects.filter(
                    remitente=remitente,
                    destinatario=destinatario,
                    oportunidad=oportunidad,
                    cuerpo=cuerpo,
                ).exists():
                    continue
                Mensaje.objects.create(
                    remitente=remitente,
                    destinatario=destinatario,
                    oportunidad=oportunidad,
                    cuerpo=cuerpo,
                )
