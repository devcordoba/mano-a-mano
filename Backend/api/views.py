from django.contrib.auth import authenticate, get_user_model
from django.db.models import Q
from django.http import HttpResponse
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .jwt_tokens import crear_token_usuario
from .models import (
    CausaVoluntariado,
    EstadoPostulacion,
    Mensaje,
    OportunidadVoluntariado,
    Organizacion,
    PerfilUsuario,
    Postulacion,
    TipoActividad,
)
from .permissions import (
    IsAuthenticatedOrReadOnly,
    IsOrganizacionOwner,
    IsOwner,
    IsPostulacionParticipantOrOrgOwner,
)
from .serializers import (
    CausaVoluntariadoSerializer,
    MensajeSerializer,
    OportunidadVoluntariadoSerializer,
    OrganizacionSerializer,
    PostulacionSerializer,
    TipoActividadSerializer,
    UserCreateSerializer,
)

User = get_user_model()

def serializar_usuario_para_respuesta(usuario):
    perfil = None
    try:
        perfil_db = usuario.perfil
        perfil = {"rol": perfil_db.rol}
    except PerfilUsuario.DoesNotExist:
        perfil = None

    return {
        "id": usuario.id,
        "username": usuario.username,
        "first_name": usuario.first_name,
        "last_name": usuario.last_name,
        "perfil": perfil,
    }

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        if username is None or str(username).strip() == "":
            return Response(
                {"detail": "Se requiere username y password."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if password is None or str(password).strip() == "":
            return Response(
                {"detail": "Se requiere username y password."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        usuario = authenticate(
            request, username=str(username).strip(), password=str(password)
        )
        if usuario is None:
            return Response(
                {"detail": "Credenciales inválidas."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        if not usuario.is_active:
            return Response(
                {"detail": "Usuario inactivo."},
                status=status.HTTP_403_FORBIDDEN,
            )
        token = crear_token_usuario(usuario)
        return Response(
            {
                "user": serializar_usuario_para_respuesta(usuario),
                "token": token,
            },
            status=status.HTTP_200_OK,
        )

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"user": serializar_usuario_para_respuesta(request.user)})

class UserViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = User.objects.all().order_by("id")
    serializer_class = UserCreateSerializer
    permission_classes = [AllowAny]

class OrganizacionViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Organizacion.objects.select_related("propietario").all()
    serializer_class = OrganizacionSerializer
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_permissions(self):
        if self.action == "list":
            return [AllowAny()]
        return [IsAuthenticated(), IsOwner()]

    def list(self, request, *args, **kwargs):
        id_propietario = request.query_params.get("propietario")
        if id_propietario is None or str(id_propietario).strip() == "":
            return Response(
                {"detail": "Se requiere el parámetro de consulta 'propietario'."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().list(request, *args, **kwargs)

    def get_queryset(self):
        queryset = super().get_queryset()
        id_propietario = self.request.query_params.get("propietario")
        if id_propietario is not None:
            queryset = queryset.filter(propietario_id=id_propietario)
        return queryset

    def perform_create(self, serializer):
        if Organizacion.objects.filter(propietario=self.request.user).exists():
            from rest_framework.exceptions import ValidationError

            raise ValidationError(
                {"non_field_errors": ["Ya tenés una organización registrada."]}
            )
        serializer.save(propietario=self.request.user)

class CausaVoluntariadoViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = CausaVoluntariado.objects.all()
    serializer_class = CausaVoluntariadoSerializer
    permission_classes = [AllowAny]

class TipoActividadViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = TipoActividad.objects.all()
    serializer_class = TipoActividadSerializer
    permission_classes = [AllowAny]

class OportunidadVoluntariadoViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    queryset = (
        OportunidadVoluntariado.objects.select_related(
            "organizacion", "causa", "tipo_actividad"
        )
        .all()
        .order_by("-created_at")
    )
    serializer_class = OportunidadVoluntariadoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOrganizacionOwner]
    parser_classes = [JSONParser, MultiPartParser]
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_queryset(self):
        queryset = super().get_queryset()

        activa = self.request.query_params.get("activa")
        if activa is not None:
            valor = activa.lower()
            if valor in ("1", "true", "si", "sí"):
                queryset = queryset.filter(activa=True)

        id_propietario = self.request.query_params.get("propietario")
        if id_propietario is not None:
            if str(self.request.user.pk) != str(id_propietario):
                from rest_framework.exceptions import PermissionDenied

                raise PermissionDenied("Solo podés listar tus propias publicaciones.")
            queryset = queryset.filter(organizacion__propietario_id=id_propietario)

        texto_busqueda = self.request.query_params.get("q")
        if texto_busqueda is not None and str(texto_busqueda).strip() != "":
            queryset = queryset.filter(
                Q(titulo__icontains=texto_busqueda)
                | Q(descripcion__icontains=texto_busqueda)
                | Q(ubicacion__icontains=texto_busqueda)
                | Q(causa__nombre__icontains=texto_busqueda)
                | Q(tipo_actividad__nombre__icontains=texto_busqueda)
            )
        return queryset

    def perform_create(self, serializer):
        organizacion = serializer.validated_data["organizacion"]
        if organizacion.propietario_id != self.request.user.pk:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied(
                "Solo el propietario de la organización puede publicar oportunidades."
            )
        serializer.save()

    @action(detail=True, methods=["get"], permission_classes=[AllowAny], url_path="imagen")
    def imagen(self, request, pk=None):
        oportunidad = self.get_object()
        if not oportunidad.imagen_data:
            return Response(status=status.HTTP_404_NOT_FOUND)

        tipo_contenido = oportunidad.imagen_tipo
        if not tipo_contenido:
            tipo_contenido = "image/png"

        respuesta = HttpResponse(bytes(oportunidad.imagen_data), content_type=tipo_contenido)
        respuesta["Cache-Control"] = "no-cache"
        return respuesta

class PostulacionViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    queryset = (
        Postulacion.objects.select_related(
            "voluntario",
            "oportunidad",
            "oportunidad__organizacion",
        )
        .all()
        .order_by("-created_at")
    )
    serializer_class = PostulacionSerializer
    permission_classes = [IsAuthenticated, IsPostulacionParticipantOrOrgOwner]
    http_method_names = ["get", "post", "patch", "head", "options"]

    def list(self, request, *args, **kwargs):
        id_voluntario = request.query_params.get("voluntario")
        if id_voluntario is None or str(id_voluntario).strip() == "":
            return Response(
                {"detail": "Se requiere el parámetro de consulta 'voluntario'."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().list(request, *args, **kwargs)

    def get_queryset(self):
        queryset = super().get_queryset()

        id_voluntario = self.request.query_params.get("voluntario")
        if id_voluntario is not None:
            queryset = queryset.filter(voluntario_id=id_voluntario)

        queryset = queryset.filter(
            Q(voluntario_id=self.request.user.pk)
            | Q(oportunidad__organizacion__propietario_id=self.request.user.pk)
        )
        return queryset

    def perform_create(self, serializer):
        serializer.save(voluntario=self.request.user)

    def perform_update(self, serializer):
        usuario = self.request.user
        postulacion = serializer.instance
        nuevo_estado = serializer.validated_data.get("estado")

        if nuevo_estado is not None and nuevo_estado != postulacion.estado:
            es_dueno_organizacion = (
                postulacion.oportunidad.organizacion.propietario_id == usuario.pk
            )

            if not es_dueno_organizacion:
                if postulacion.voluntario_id == usuario.pk and nuevo_estado in (
                    EstadoPostulacion.CANCELADA,
                ):
                    pass
                else:
                    from rest_framework.exceptions import PermissionDenied

                    raise PermissionDenied(
                        "Solo la organización puede cambiar el estado de la postulación "
                        "(excepto cancelar la propia)."
                    )
            elif (
                es_dueno_organizacion
                and nuevo_estado == EstadoPostulacion.CANCELADA
            ):
                from rest_framework.exceptions import PermissionDenied

                raise PermissionDenied(
                    "La organización no puede cancelar en nombre del voluntario."
                )

        serializer.save()

    @action(detail=False, methods=["get"], url_path="bloques-organizador")
    def bloques_organizador(self, request):
        oportunidades = (
            OportunidadVoluntariado.objects.filter(
                organizacion__propietario_id=request.user.pk
            )
            .order_by("-created_at")
        )

        bloques = []
        for oportunidad in oportunidades:
            postulaciones = self.get_queryset().filter(oportunidad_id=oportunidad.id)
            if not postulaciones.exists():
                continue
            bloques.append(
                {
                    "titulo": oportunidad.titulo,
                    "oportunidad_id": oportunidad.id,
                    "items": PostulacionSerializer(postulaciones, many=True).data,
                }
            )

        return Response(bloques, status=status.HTTP_200_OK)

class MensajeViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    serializer_class = MensajeSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(remitente=self.request.user)

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def bandeja(self, request):
        id_usuario = request.query_params.get("usuario")
        if id_usuario is None or str(id_usuario).strip() == "":
            return Response(
                {"detail": "Se requiere el parámetro de consulta 'usuario'."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if str(request.user.pk) != str(id_usuario):
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied("Solo podés consultar tu propia bandeja.")

        consulta_mensajes = Mensaje.objects.select_related(
            "remitente", "destinatario", "oportunidad"
        ).order_by("-created_at")
        recibidos = consulta_mensajes.filter(destinatario_id=id_usuario)
        enviados = consulta_mensajes.filter(remitente_id=id_usuario)
        return Response(
            {
                "recibidos": MensajeSerializer(recibidos, many=True).data,
                "enviados": MensajeSerializer(enviados, many=True).data,
            },
            status=status.HTTP_200_OK,
        )
