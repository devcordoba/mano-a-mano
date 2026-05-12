import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="PerfilUsuario",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "rol",
                    models.CharField(
                        choices=[
                            ("VOL", "Voluntario"),
                            ("ORG", "Organización"),
                        ],
                        default="VOL",
                        max_length=3,
                    ),
                ),
                ("telefono", models.CharField(blank=True, max_length=40)),
                (
                    "intereses_causas",
                    models.CharField(
                        blank=True,
                        help_text="Causas o temas de interés",
                        max_length=255,
                    ),
                ),
                (
                    "disponibilidad_resumen",
                    models.CharField(
                        blank=True,
                        help_text="Resumen de disponibilidad (ej. fines de semana, mañanas).",
                        max_length=255,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "user",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="perfil",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "db_table": "perfil_usuario",
                "ordering": ("-created_at",),
            },
        ),
        migrations.CreateModel(
            name="Organizacion",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("nombre_publico", models.CharField(max_length=200)),
                ("descripcion", models.TextField(blank=True)),
                ("email_contacto", models.EmailField(max_length=254)),
                ("telefono", models.CharField(blank=True, max_length=40)),
                ("sitio_web", models.URLField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "propietario",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="organizaciones",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "db_table": "organizacion",
                "ordering": ("nombre_publico",),
            },
        ),
        migrations.CreateModel(
            name="OportunidadVoluntariado",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("titulo", models.CharField(max_length=200)),
                ("descripcion", models.TextField()),
                ("ubicacion", models.CharField(max_length=200)),
                ("causa", models.CharField(max_length=120)),
                ("tipo_actividad", models.CharField(max_length=120)),
                (
                    "disponibilidad",
                    models.CharField(
                        help_text="Franja o modalidad requerida para el voluntariado.",
                        max_length=200,
                    ),
                ),
                ("requisitos", models.TextField(blank=True)),
                ("cupos", models.PositiveIntegerField(default=1)),
                ("fecha_actividad", models.DateField(blank=True, null=True)),
                ("activa", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "organizacion",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="oportunidades",
                        to="api.organizacion",
                    ),
                ),
            ],
            options={
                "db_table": "oportunidad_voluntariado",
                "ordering": ("-created_at",),
            },
        ),
        migrations.CreateModel(
            name="Postulacion",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "estado",
                    models.CharField(
                        choices=[
                            ("PEN", "Pendiente"),
                            ("ACE", "Aceptada"),
                            ("REC", "Rechazada"),
                            ("CAN", "Cancelada"),
                        ],
                        default="PEN",
                        max_length=3,
                    ),
                ),
                ("comentario", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "oportunidad",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="postulaciones",
                        to="api.oportunidadvoluntariado",
                    ),
                ),
                (
                    "voluntario",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="postulaciones",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "db_table": "postulacion",
                "ordering": ("-created_at",),
            },
        ),
        migrations.AddConstraint(
            model_name="postulacion",
            constraint=models.UniqueConstraint(
                fields=("voluntario", "oportunidad"),
                name="uniq_postulacion_voluntario_oportunidad",
            ),
        ),
        migrations.CreateModel(
            name="Mensaje",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("cuerpo", models.TextField()),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "destinatario",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="mensajes_recibidos",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "oportunidad",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="mensajes",
                        to="api.oportunidadvoluntariado",
                    ),
                ),
                (
                    "remitente",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="mensajes_enviados",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "db_table": "mensaje",
                "ordering": ("-created_at",),
            },
        ),
    ]
