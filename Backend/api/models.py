from django.db import models


class OportunidadVoluntariado(models.Model):
    titulo = models.CharField(max_length=150)
    organizacion = models.CharField(max_length=120)
    ubicacion = models.CharField(max_length=120)
    activa = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.titulo} - {self.organizacion}"
