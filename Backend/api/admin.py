from django.contrib import admin

from .models import Mensaje, OportunidadVoluntariado, Organizacion, PerfilUsuario, Postulacion


@admin.register(PerfilUsuario)
class PerfilUsuarioAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "rol", "created_at")
    list_filter = ("rol",)
    search_fields = ("user__username", "telefono", "intereses_causas")


@admin.register(Organizacion)
class OrganizacionAdmin(admin.ModelAdmin):
    list_display = ("id", "nombre_publico", "propietario", "email_contacto", "created_at")
    search_fields = ("nombre_publico", "email_contacto")


@admin.register(OportunidadVoluntariado)
class OportunidadVoluntariadoAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "titulo",
        "organizacion",
        "ubicacion",
        "causa",
        "activa",
        "created_at",
    )
    list_filter = ("activa", "causa", "tipo_actividad")
    search_fields = ("titulo", "descripcion", "ubicacion")


@admin.register(Postulacion)
class PostulacionAdmin(admin.ModelAdmin):
    list_display = ("id", "voluntario", "oportunidad", "estado", "created_at")
    list_filter = ("estado",)
    search_fields = ("voluntario__username", "oportunidad__titulo")


@admin.register(Mensaje)
class MensajeAdmin(admin.ModelAdmin):
    list_display = ("id", "remitente", "destinatario", "oportunidad", "created_at")
    search_fields = ("cuerpo",)
