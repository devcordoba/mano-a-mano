from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist
from django.db import IntegrityError
from django.db.models import Q
from rest_framework import serializers

from .password_validation import validate_password_strength
from .models import (
    CausaVoluntariado,
    EstadoPostulacion,
    Mensaje,
    OportunidadVoluntariado,
    Organizacion,
    Postulacion,
    TipoActividad,
)

User = get_user_model()


def _texto_obligatorio(value, mensaje: str) -> str:
    if not value or not str(value).strip():
        raise serializers.ValidationError(mensaje)
    return str(value).strip()


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, max_length=128)

    class Meta:
        model = User
        fields = ("username", "email", "first_name", "last_name", "password")

    def validate_username(self, value):
        return _texto_obligatorio(value, "El nombre de usuario es obligatorio.")

    def validate_email(self, value):
        return _texto_obligatorio(value, "El correo electrónico es obligatorio.")

    def validate_password(self, value):
        try:
            return validate_password_strength(value)
        except ValueError as exc:
            raise serializers.ValidationError(str(exc)) from exc

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class OrganizacionSerializer(serializers.ModelSerializer):
    sitio_web = serializers.URLField(allow_blank=True, required=False, max_length=200)

    class Meta:
        model = Organizacion
        fields = (
            "id",
            "nombre_publico",
            "descripcion",
            "email_contacto",
            "telefono",
            "sitio_web",
        )
        read_only_fields = ("id",)

    def validate_nombre_publico(self, value):
        return _texto_obligatorio(value, "El nombre público es obligatorio.")

    def validate_email_contacto(self, value):
        return _texto_obligatorio(value, "El email de contacto es obligatorio.")


class CausaVoluntariadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CausaVoluntariado
        fields = ("id", "nombre")


class TipoActividadSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoActividad
        fields = ("id", "nombre")


class OportunidadVoluntariadoSerializer(serializers.ModelSerializer):
    organizacion_nombre = serializers.CharField(
        source="organizacion.nombre_publico", read_only=True
    )
    tipo_actividad_nombre = serializers.CharField(
        source="tipo_actividad.nombre", read_only=True
    )
    imagen = serializers.ImageField(write_only=True, required=False, allow_null=True)
    tiene_imagen = serializers.BooleanField(read_only=True)

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
            "tipo_actividad_nombre",
            "disponibilidad",
            "requisitos",
            "cupos",
            "fecha_actividad",
            "activa",
            "tiene_imagen",
            "imagen",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "organizacion_nombre",
            "tipo_actividad_nombre",
            "tiene_imagen",
            "updated_at",
        )

    def _guardar_imagen(self, instance, imagen_file):
        from .opportunity_images import generate_opportunity_image

        if imagen_file is not None:
            instance.set_imagen_archivo(imagen_file)
            return

        if instance.tiene_imagen:
            return

        nombre_causa = ""
        if instance.causa_id:
            nombre_causa = instance.causa.nombre

        nombre_organizacion = ""
        if instance.organizacion_id:
            nombre_organizacion = instance.organizacion.nombre_publico

        png = generate_opportunity_image(
            instance.titulo,
            nombre_causa,
            nombre_organizacion,
        )
        instance.set_imagen_bytes(png, content_type="image/png", nombre="generada.png")

    def create(self, validated_data):
        imagen_file = validated_data.pop("imagen", None)
        oportunidad = super().create(validated_data)
        self._guardar_imagen(oportunidad, imagen_file)
        oportunidad.save(update_fields=["imagen_data", "imagen_tipo", "imagen_nombre"])
        return oportunidad

    def update(self, instance, validated_data):
        imagen_file = validated_data.pop("imagen", None)
        instance = super().update(instance, validated_data)
        if imagen_file is not None:
            self._guardar_imagen(instance, imagen_file)
            instance.save(update_fields=["imagen_data", "imagen_tipo", "imagen_nombre"])
        return instance

    def validate_imagen(self, value):
        if value is None:
            return value
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("La imagen no puede superar 5 MB.")

        nombre = getattr(value, "name", "") or ""
        extension = nombre.rsplit(".", 1)[-1].lower() if "." in nombre else ""
        extensiones_permitidas = {"jpg", "jpeg", "png"}
        if extension not in extensiones_permitidas:
            raise serializers.ValidationError(
                "Extensión no válida. Solo se aceptan archivos JPG, JPEG y PNG."
            )

        tipo_contenido = getattr(value, "content_type", "") or ""
        tipos_permitidos = {"image/jpeg", "image/png"}
        if tipo_contenido and tipo_contenido not in tipos_permitidos:
            raise serializers.ValidationError(
                "Extensión no válida. Solo se aceptan archivos JPG, JPEG y PNG."
            )

        if hasattr(value, "seek"):
            value.seek(0)
        return value

    def validate_cupos(self, value):
        if value < 1:
            raise serializers.ValidationError("Debe haber al menos 1 cupo.")
        return value

    def validate_titulo(self, value):
        return _texto_obligatorio(value, "El título es obligatorio.")

    def validate_descripcion(self, value):
        return _texto_obligatorio(value, "La descripción es obligatoria.")

    def validate_ubicacion(self, value):
        return _texto_obligatorio(value, "La ubicación es obligatoria.")

    def validate_disponibilidad(self, value):
        return _texto_obligatorio(value, "La disponibilidad es obligatoria.")


class PostulacionSerializer(serializers.ModelSerializer):
    voluntario_username = serializers.CharField(
        source="voluntario.username", read_only=True
    )
    oportunidad_titulo = serializers.CharField(
        source="oportunidad.titulo", read_only=True
    )
    organizacion_propietario = serializers.IntegerField(
        source="oportunidad.organizacion.propietario_id", read_only=True
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance is None:
            self.fields["estado"].read_only = True
        else:
            self.fields["oportunidad"].read_only = True

    class Meta:
        model = Postulacion
        fields = (
            "id",
            "voluntario",
            "voluntario_username",
            "oportunidad",
            "oportunidad_titulo",
            "organizacion_propietario",
            "estado",
            "created_at",
        )
        read_only_fields = (
            "id",
            "voluntario",
            "voluntario_username",
            "oportunidad_titulo",
            "organizacion_propietario",
            "created_at",
        )

    def validate_estado(self, value):
        if value not in {c.value for c in EstadoPostulacion}:
            raise serializers.ValidationError(
                "Estado inválido. Use PEN, ACE, REC o CAN."
            )
        return value

    def validate_oportunidad(self, value):
        pk = getattr(value, "pk", value)
        try:
            return OportunidadVoluntariado.objects.select_related("organizacion").get(
                pk=pk
            )
        except ObjectDoesNotExist:
            raise serializers.ValidationError("La oportunidad indicada no existe.")

    def validate(self, attrs):
        request = self.context.get("request")
        oportunidad = attrs.get("oportunidad")

        if self.instance is not None:
            voluntario = self.instance.voluntario
            if oportunidad is None:
                oportunidad = self.instance.oportunidad
        elif request is not None and request.user.is_authenticated:
            voluntario = request.user
        else:
            return attrs

        if oportunidad is None:
            return attrs

        if oportunidad.organizacion.propietario_id == voluntario.pk:
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
            "remitente",
            "remitente_username",
            "destinatario_username",
            "created_at",
        )

    def validate_cuerpo(self, value):
        if not value or not str(value).strip():
            raise serializers.ValidationError("El mensaje no puede estar vacío.")
        return str(value).strip()

    def validate(self, attrs):
        request = self.context.get("request")
        destinatario = attrs.get("destinatario")

        if (
            request
            and request.user.is_authenticated
            and destinatario is not None
            and destinatario.pk == request.user.pk
        ):
            raise serializers.ValidationError(
                {"destinatario": "El destinatario no puede ser el mismo que el remitente."}
            )

        if request and request.user.is_authenticated:
            oportunidad = attrs.get("oportunidad")
            if oportunidad is not None and destinatario is not None:
                id_oportunidad = getattr(oportunidad, "pk", oportunidad)
                id_destinatario = getattr(destinatario, "pk", destinatario)

                postulaciones_vinculadas = Postulacion.objects.filter(
                    oportunidad_id=id_oportunidad
                ).filter(
                    Q(voluntario_id=request.user.pk)
                    | Q(oportunidad__organizacion__propietario_id=request.user.pk)
                )

                if not postulaciones_vinculadas.exists():
                    raise serializers.ValidationError(
                        "No tenés una postulación vinculada a esta oportunidad."
                    )

                postulacion_voluntario = (
                    postulaciones_vinculadas.select_related("oportunidad__organizacion")
                    .filter(voluntario_id=request.user.pk)
                    .first()
                )

                if postulacion_voluntario is not None:
                    id_propietario = postulacion_voluntario.oportunidad.organizacion.propietario_id
                    if id_destinatario != id_propietario:
                        raise serializers.ValidationError(
                            {
                                "destinatario": (
                                    "Como voluntario solo podés escribir al dueño de la organización."
                                )
                            }
                        )
                elif not postulaciones_vinculadas.filter(voluntario_id=id_destinatario).exists():
                    raise serializers.ValidationError(
                        {
                            "destinatario": (
                                "Como organización solo podés escribir a postulantes de tu convocatoria."
                            )
                        }
                    )

        return attrs
