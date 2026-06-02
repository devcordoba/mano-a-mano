from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0003_oportunidad_imagen_db"),
    ]

    operations = [
        migrations.RunSQL(
            sql="DROP TABLE IF EXISTS `authtoken_token`;",
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
