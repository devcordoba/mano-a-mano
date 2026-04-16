from rest_framework import serializers

from .models import OportunidadVoluntariado


class OportunidadVoluntariadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = OportunidadVoluntariado
        fields = "__all__"
