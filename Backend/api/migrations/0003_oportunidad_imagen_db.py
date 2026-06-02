from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0002_schema_catalog_and_constraints"),
    ]

    operations = [
        migrations.AddField(
            model_name="oportunidadvoluntariado",
            name="imagen_data",
            field=models.BinaryField(
                blank=True,
                help_text="Bytes de la imagen almacenados en la base de datos.",
                null=True,
            ),
        ),
        migrations.AddField(
            model_name="oportunidadvoluntariado",
            name="imagen_tipo",
            field=models.CharField(
                blank=True,
                default="",
                help_text="MIME type, p. ej. image/png o image/jpeg.",
                max_length=64,
            ),
        ),
        migrations.AddField(
            model_name="oportunidadvoluntariado",
            name="imagen_nombre",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
    ]
