from django.contrib import admin
from .models import OportunidadVoluntariado


@admin.register(OportunidadVoluntariado)
class OportunidadVoluntariadoAdmin(admin.ModelAdmin):
    list_display = ("id", "titulo", "organizacion", "ubicacion", "activa", "created_at")
    list_filter = ("activa",)
    search_fields = ("titulo", "organizacion", "ubicacion")
