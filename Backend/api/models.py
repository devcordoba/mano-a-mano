from django.conf import settings
from django.db import models


class Rol(models.TextChoices):
    
    VOLUNTARIO = "VOL", "Voluntario"
    ORGANIZACION = "ORG", "Organización"


class PerfilUsuario(models.Model):

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="perfil",
    )
    rol = models.CharField(max_length=3, choices=Rol.choices, default=Rol.VOLUNTARIO)
    telefono = models.CharField(max_length=40, blank=True)
    intereses_causas = models.CharField(
        max_length=255,
        blank=True,
        help_text="Causas o temas de interés",
    )
    disponibilidad_resumen = models.CharField(
        max_length=255,
        blank=True,
        help_text="Resumen de disponibilidad (ej. fines de semana, mañanas).",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "perfil_usuario"
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.user.get_username()} ({self.get_rol_display()})"


class Organizacion(models.Model):

    propietario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="organizaciones",
    )
    nombre_publico = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    email_contacto = models.EmailField()
    telefono = models.CharField(max_length=40, blank=True)
    sitio_web = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "organizacion"
        ordering = ("nombre_publico",)

    def __str__(self):
        return self.nombre_publico


class OportunidadVoluntariado(models.Model):
    
    organizacion = models.ForeignKey(
        Organizacion,
        on_delete=models.CASCADE,
        related_name="oportunidades",
    )
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField()
    ubicacion = models.CharField(max_length=200)
    causa = models.CharField(max_length=120)
    tipo_actividad = models.CharField(max_length=120)
    disponibilidad = models.CharField(
        max_length=200,
        help_text="Franja o modalidad requerida para el voluntariado.",
    )
    requisitos = models.TextField(blank=True)
    cupos = models.PositiveIntegerField(default=1)
    fecha_actividad = models.DateField(null=True, blank=True)
    activa = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "oportunidad_voluntariado"
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.titulo} — {self.organizacion.nombre_publico}"


class EstadoPostulacion(models.TextChoices):
    PENDIENTE = "PEN", "Pendiente"
    ACEPTADA = "ACE", "Aceptada"
    RECHAZADA = "REC", "Rechazada"
    CANCELADA = "CAN", "Cancelada"


class Postulacion(models.Model):

    voluntario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="postulaciones",
    )
    oportunidad = models.ForeignKey(
        OportunidadVoluntariado,
        on_delete=models.CASCADE,
        related_name="postulaciones",
    )
    estado = models.CharField(
        max_length=3,
        choices=EstadoPostulacion.choices,
        default=EstadoPostulacion.PENDIENTE,
    )
    comentario = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "postulacion"
        ordering = ("-created_at",)
        constraints = [
            models.UniqueConstraint(
                fields=("voluntario", "oportunidad"),
                name="uniq_postulacion_voluntario_oportunidad",
            ),
        ]

    def __str__(self):
        return f"Postulación {self.voluntario_id} → {self.oportunidad_id}"


class Mensaje(models.Model):
    
    remitente = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="mensajes_enviados",
    )
    destinatario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="mensajes_recibidos",
    )
    oportunidad = models.ForeignKey(
        OportunidadVoluntariado,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="mensajes",
    )
    cuerpo = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "mensaje"
        ordering = ("-created_at",)

    def __str__(self):
        return f"Mensaje {self.remitente_id} → {self.destinatario_id}"
