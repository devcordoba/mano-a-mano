import re

import django.db.models.deletion
from django.db import migrations, models


def _slug(text: str) -> str:
    s = re.sub(r"[^a-zA-Z0-9]+", "_", text.strip().lower())[:28]
    return s or "item"


CAUSAS_INICIALES = [
    "Educación y alfabetización",
    "Medio ambiente",
    "Salud y bienestar",
    "Inclusión social",
    "Derechos humanos",
    "Animales",
    "Emergencias y desastres",
    "Cultura y arte",
    "Deporte y recreación",
    "Otra",
]

TIPOS_INICIALES = [
    "Accompañamiento a personas mayores",
    "Alfabetización y educación popular",
    "Apoyo escolar y tareas dirigidas",
    "Arte, cultura y talleres creativos",
    "Atención en merenderos y comedores comunitarios",
    "Campañas de concientización",
    "Cocina / logística",
    "Comunicación, diseño y redes sociales",
    "Cuidado de niños, niñas y adolescentes",
    "Deporte, recreación y actividades al aire libre",
    "Defensa de derechos y acompañamiento legal básico",
    "Emergencias y operativos solidarios",
    "Huertas urbanas y agricultura social",
    "Informática y alfabetización digital",
    "Interpretación y traducción",
    "Logística, depósito y distribución",
    "Mantenimiento, pintura y refacción",
    "Medio ambiente y limpieza de espacios públicos",
    "Música, teatro y eventos comunitarios",
    "Recaudación de fondos y voluntariado administrativo",
    "Reforestación y trabajo al aire libre",
    "Salud comunitaria y primeros auxilios",
    "Trabajo al aire libre",
    "Visitas domiciliarias y contención social",
    "Voluntariado en hospitales y centros de salud",
    "Voluntariado con animales y refugios",
    "Otra (detallar en descripción o requisitos)",
]


def seed_catalogs(apps, schema_editor):
    Causa = apps.get_model("api", "CausaVoluntariado")
    Tipo = apps.get_model("api", "TipoActividad")
    for nombre in CAUSAS_INICIALES:
        Causa.objects.get_or_create(codigo=_slug(nombre), defaults={"nombre": nombre})
    for nombre in TIPOS_INICIALES:
        Tipo.objects.get_or_create(codigo=_slug(nombre), defaults={"nombre": nombre})


def migrate_oportunidad_fks(apps, schema_editor):
    Causa = apps.get_model("api", "CausaVoluntariado")
    Tipo = apps.get_model("api", "TipoActividad")
    Oportunidad = apps.get_model("api", "OportunidadVoluntariado")
    causa_default = Causa.objects.first()
    tipo_default = Tipo.objects.first()
    for opp in Oportunidad.objects.all():
        causa_txt = getattr(opp, "causa_legacy", None) or "Otra"
        tipo_txt = getattr(opp, "tipo_actividad_legacy", None) or "Otra (detallar en descripción o requisitos)"
        causa, _ = Causa.objects.get_or_create(
            codigo=_slug(causa_txt), defaults={"nombre": causa_txt[:120]}
        )
        tipo, _ = Tipo.objects.get_or_create(
            codigo=_slug(tipo_txt), defaults={"nombre": tipo_txt[:120]}
        )
        opp.causa_id = causa.pk
        opp.tipo_actividad_id = tipo.pk
        opp.save(update_fields=["causa_id", "tipo_actividad_id"])


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="CausaVoluntariado",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("codigo", models.CharField(max_length=32, unique=True)),
                ("nombre", models.CharField(max_length=120, unique=True)),
            ],
            options={
                "db_table": "causa_voluntariado",
                "ordering": ("nombre",),
                "verbose_name": "Causa de voluntariado",
                "verbose_name_plural": "Causas de voluntariado",
            },
        ),
        migrations.CreateModel(
            name="TipoActividad",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("codigo", models.CharField(max_length=32, unique=True)),
                ("nombre", models.CharField(max_length=120, unique=True)),
            ],
            options={
                "db_table": "tipo_actividad",
                "ordering": ("nombre",),
                "verbose_name": "Tipo de actividad",
                "verbose_name_plural": "Tipos de actividad",
            },
        ),
        migrations.RunPython(seed_catalogs, migrations.RunPython.noop),
        migrations.RenameField(
            model_name="oportunidadvoluntariado",
            old_name="causa",
            new_name="causa_legacy",
        ),
        migrations.RenameField(
            model_name="oportunidadvoluntariado",
            old_name="tipo_actividad",
            new_name="tipo_actividad_legacy",
        ),
        migrations.AddField(
            model_name="oportunidadvoluntariado",
            name="causa",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="oportunidades",
                to="api.causavoluntariado",
            ),
        ),
        migrations.AddField(
            model_name="oportunidadvoluntariado",
            name="tipo_actividad",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="oportunidades",
                to="api.tipoactividad",
            ),
        ),
        migrations.RunPython(migrate_oportunidad_fks, migrations.RunPython.noop),
        migrations.RemoveField(model_name="oportunidadvoluntariado", name="causa_legacy"),
        migrations.RemoveField(model_name="oportunidadvoluntariado", name="tipo_actividad_legacy"),
        migrations.AlterField(
            model_name="oportunidadvoluntariado",
            name="causa",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name="oportunidades",
                to="api.causavoluntariado",
            ),
        ),
        migrations.AlterField(
            model_name="oportunidadvoluntariado",
            name="tipo_actividad",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name="oportunidades",
                to="api.tipoactividad",
            ),
        ),
        migrations.AddConstraint(
            model_name="organizacion",
            constraint=models.UniqueConstraint(
                fields=("propietario",),
                name="uniq_organizacion_propietario",
            ),
        ),
        migrations.AlterField(
            model_name="perfilusuario",
            name="rol",
            field=models.CharField(
                choices=[("VOL", "Voluntario"), ("ORG", "Organización")],
                default="VOL",
                help_text="Código de rol: VOL (voluntario) u ORG (organización).",
                max_length=3,
            ),
        ),
        migrations.AlterField(
            model_name="perfilusuario",
            name="telefono",
            field=models.CharField(blank=True, default="", max_length=40),
        ),
        migrations.AlterField(
            model_name="perfilusuario",
            name="intereses_causas",
            field=models.CharField(
                blank=True,
                default="",
                help_text="Causas o temas de interés",
                max_length=255,
            ),
        ),
        migrations.AlterField(
            model_name="perfilusuario",
            name="disponibilidad_resumen",
            field=models.CharField(
                blank=True,
                default="",
                help_text="Resumen de disponibilidad (ej. fines de semana, mañanas).",
                max_length=255,
            ),
        ),
        migrations.AlterField(
            model_name="organizacion",
            name="descripcion",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AlterField(
            model_name="organizacion",
            name="telefono",
            field=models.CharField(blank=True, default="", max_length=40),
        ),
        migrations.AlterField(
            model_name="organizacion",
            name="sitio_web",
            field=models.URLField(blank=True, default=""),
        ),
        migrations.AlterField(
            model_name="oportunidadvoluntariado",
            name="requisitos",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AlterField(
            model_name="postulacion",
            name="estado",
            field=models.CharField(
                choices=[
                    ("PEN", "Pendiente"),
                    ("ACE", "Aceptada"),
                    ("REC", "Rechazada"),
                    ("CAN", "Cancelada"),
                ],
                default="PEN",
                help_text="Código: PEN, ACE, REC, CAN.",
                max_length=3,
            ),
        ),
        migrations.AlterField(
            model_name="postulacion",
            name="comentario",
            field=models.TextField(blank=True, default=""),
        ),
    ]
