from django.contrib.auth import get_user_model
from django.db import IntegrityError
from rest_framework import serializers

from .models import (
    EstadoPostulacion,
    Mensaje,
    OportunidadVoluntariado,
    Organizacion,
    PerfilUsuario,
    Postulacion,
)

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name")
        read_only_fields = ("id",)


class UserCreateSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True, min_length=8, max_length=128)

    class Meta:
        model = User
        fields = ("username", "email", "first_name", "last_name", "password")

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserUpdateSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True, required=False, max_length=128)

    class Meta:
        model = User
        fields = ("username", "email", "first_name", "last_name", "password")

    def validate_password(self, value):
        if value and len(value) < 8:
            raise serializers.ValidationError("La contraseña debe tener al menos 8 caracteres.")
        return value

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user


class PerfilUsuarioSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = PerfilUsuario
        fields = (
            "id",
            "user",
            "username",
            "rol",
            "telefono",
            "intereses_causas",
            "disponibilidad_resumen",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "username", "created_at", "updated_at")

    def validate_user(self, value):
        if self.instance is not None:
            return value
        if PerfilUsuario.objects.filter(user=value).exists():
            raise serializers.ValidationError("Este usuario ya tiene un perfil.")
        return value


class OrganizacionSerializer(serializers.ModelSerializer):
    propietario_username = serializers.CharField(
        source="propietario.username", read_only=True
    )
    sitio_web = serializers.URLField(allow_blank=True, required=False, max_length=200)

    class Meta:
        model = Organizacion
        fields = (
            "id",
            "propietario",
            "propietario_username",
            "nombre_publico",
            "descripcion",
            "email_contacto",
            "telefono",
            "sitio_web",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "propietario_username", "created_at", "updated_at")


class OportunidadVoluntariadoSerializer(serializers.ModelSerializer):
    organizacion_nombre = serializers.CharField(
        source="organizacion.nombre_publico", read_only=True
    )

    class Meta:
        model = OportunidadVoluntariado
        fields = (
            "id",
            "organizacion",
            "organizacion_nombre",
            "titulo",
            "descripcion",
            "ubicacion",
            "causa",
            "tipo_actividad",
            "disponibilidad",
            "requisitos",
            "cupos",
            "fecha_actividad",
            "activa",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "organizacion_nombre", "created_at", "updated_at")

    def validate_cupos(self, value):
        if value < 1:
            raise serializers.ValidationError("Debe haber al menos 1 cupo.")
        return value


class PostulacionSerializer(serializers.ModelSerializer):
    voluntario_username = serializers.CharField(
        source="voluntario.username", read_only=True
    )
    oportunidad_titulo = serializers.CharField(
        source="oportunidad.titulo", read_only=True
    )

    class Meta:
        model = Postulacion
        fields = (
            "id",
            "voluntario",
            "voluntario_username",
            "oportunidad",
            "oportunidad_titulo",
            "estado",
            "comentario",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "voluntario_username",
            "oportunidad_titulo",
            "created_at",
            "updated_at",
        )

    def validate_estado(self, value):
        if value not in {c.value for c in EstadoPostulacion}:
            raise serializers.ValidationError("Estado de postulación inválido.")
        return value

    def validate(self, attrs):
        oportunidad = attrs.get("oportunidad")
        voluntario = attrs.get("voluntario")
        if self.instance is not None:
            if oportunidad is None:
                oportunidad = self.instance.oportunidad
            if voluntario is None:
                voluntario = self.instance.voluntario
        if oportunidad is None or voluntario is None:
            return attrs
        opp_pk = getattr(oportunidad, "pk", oportunidad)
        vol_pk = getattr(voluntario, "pk", voluntario)
        o_full = OportunidadVoluntariado.objects.select_related("organizacion").get(pk=opp_pk)
        if o_full.organizacion.propietario_id == vol_pk:
            raise serializers.ValidationError(
                {
                    "oportunidad": (
                        "No podés postularte a convocatorias de tu propia organización."
                    )
                }
            )
        return attrs

    def create(self, validated_data):
        try:
            return super().create(validated_data)
        except IntegrityError:
            raise serializers.ValidationError(
                {
                    "non_field_errors": [
                        "Ya existe una postulación de este voluntario para la oportunidad indicada."
                    ]
                }
            )


class MensajeSerializer(serializers.ModelSerializer):
    remitente_username = serializers.CharField(
        source="remitente.username", read_only=True
    )
    destinatario_username = serializers.CharField(
        source="destinatario.username", read_only=True
    )

    class Meta:
        model = Mensaje
        fields = (
            "id",
            "remitente",
            "remitente_username",
            "destinatario",
            "destinatario_username",
            "oportunidad",
            "cuerpo",
            "created_at",
        )
        read_only_fields = (
            "id",
            "remitente_username",
            "destinatario_username",
            "created_at",
        )

    def validate(self, attrs):
        rem = attrs.get("remitente") or getattr(self.instance, "remitente", None)
        dest = attrs.get("destinatario") or getattr(self.instance, "destinatario", None)
        if rem and dest and rem.pk == dest.pk:
            raise serializers.ValidationError(
                {"destinatario": "El destinatario no puede ser el mismo que el remitente."}
            )
        return attrs
