from django.conf import settings
from django.db import models

class Rol(models.TextChoices):
    
    VOLUNTARIO = "VOL", "Voluntario"
    ORGANIZACION = "ORG", "Organización"

class EstadoPostulacion(models.TextChoices):

    PENDIENTE = "PEN", "Pendiente"
    ACEPTADA = "ACE", "Aceptada"
    RECHAZADA = "REC", "Rechazada"
    CANCELADA = "CAN", "Cancelada"

class CausaVoluntariado(models.Model):
    codigo = models.CharField(max_length=32, unique=True)
    nombre = models.CharField(max_length=120, unique=True)

    class Meta:
        db_table = "causa_voluntariado"
        ordering = ("nombre",)
        verbose_name = "Causa de voluntariado"
        verbose_name_plural = "Causas de voluntariado"

    def __str__(self):
        return self.nombre

class TipoActividad(models.Model):
    codigo = models.CharField(max_length=32, unique=True)
    nombre = models.CharField(max_length=120, unique=True)

    class Meta:
        db_table = "tipo_actividad"
        ordering = ("nombre",)
        verbose_name = "Tipo de actividad"
        verbose_name_plural = "Tipos de actividad"

    def __str__(self):
        return self.nombre

class PerfilUsuario(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="perfil",
    )
    rol = models.CharField(
        max_length=3,
        choices=Rol.choices,
        default=Rol.VOLUNTARIO,
    )
    telefono = models.CharField(max_length=40, blank=True, default="")
    intereses_causas = models.CharField(
        max_length=255,
        blank=True,
        default="",
    )
    disponibilidad_resumen = models.CharField(
        max_length=255,
        blank=True,
        default="",
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
    descripcion = models.TextField(blank=True, default="")
    email_contacto = models.EmailField()
    telefono = models.CharField(max_length=40, blank=True, default="")
    sitio_web = models.URLField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "organizacion"
        ordering = ("nombre_publico",)
        constraints = [
            models.UniqueConstraint(
                fields=("propietario",),
                name="uniq_organizacion_propietario",
            ),
        ]

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
    causa = models.ForeignKey(
        CausaVoluntariado,
        on_delete=models.PROTECT,
        related_name="oportunidades",
    )
    tipo_actividad = models.ForeignKey(
        TipoActividad,
        on_delete=models.PROTECT,
        related_name="oportunidades",
    )
    disponibilidad = models.CharField(max_length=200)
    requisitos = models.TextField(blank=True, default="")
    cupos = models.PositiveIntegerField(default=1)
    fecha_actividad = models.DateField(null=True, blank=True)
    activa = models.BooleanField(default=True)
    imagen_data = models.BinaryField(
        null=True,
        blank=True,
    )
    imagen_tipo = models.CharField(
        max_length=64,
        blank=True,
        default="",
    )
    imagen_nombre = models.CharField(max_length=255, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "oportunidad_voluntariado"
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.titulo} - {self.organizacion.nombre_publico}"

    @property
    def tiene_imagen(self) -> bool:
        return bool(self.imagen_data)

    def set_imagen_bytes(
        self,
        data: bytes,
        *,
        content_type: str = "image/png",
        nombre: str = "oportunidad.png",
    ) -> None:
        self.imagen_data = data

        tipo = content_type
        if not tipo:
            tipo = "image/png"
        self.imagen_tipo = tipo[:64]

        nombre_archivo = nombre
        if not nombre_archivo:
            nombre_archivo = "oportunidad.png"
        self.imagen_nombre = nombre_archivo[:255]

    def set_imagen_archivo(self, uploaded) -> None:
        if hasattr(uploaded, "seek"):
            uploaded.seek(0)
        raw = uploaded.read()

        tipo_contenido = getattr(uploaded, "content_type", None)
        if not tipo_contenido:
            tipo_contenido = "image/png"

        nombre_archivo = getattr(uploaded, "name", None)
        if not nombre_archivo:
            nombre_archivo = "upload.png"

        self.set_imagen_bytes(raw, content_type=tipo_contenido, nombre=nombre_archivo)

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
    comentario = models.TextField(blank=True, default="")
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
