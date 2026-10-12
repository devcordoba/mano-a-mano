from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0004_drop_authtoken_table"),
    ]

    operations = [
        migrations.CreateModel(
            name="FormularioContacto",
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
                ("nombre", models.CharField(max_length=120)),
                ("email", models.EmailField(max_length=254)),
                ("asunto", models.CharField(max_length=160)),
                ("mensaje", models.TextField()),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "verbose_name": "Formulario de contacto",
                "verbose_name_plural": "Formularios de contacto",
                "db_table": "formulario_contacto",
                "ordering": ("-created_at",),
            },
        ),
    ]
