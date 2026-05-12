from django.contrib.auth import authenticate, get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Mensaje, OportunidadVoluntariado, Organizacion, PerfilUsuario, Postulacion
from .serializers import (
    MensajeSerializer,
    OportunidadVoluntariadoSerializer,
    OrganizacionSerializer,
    PerfilUsuarioSerializer,
    PostulacionSerializer,
    UserCreateSerializer,
    UserSerializer,
    UserUpdateSerializer,
)

User = get_user_model()


def _serialize_user_min(user):
    perfil = None
    try:
        p = user.perfil
        perfil = {"id": p.id, "rol": p.rol}
    except PerfilUsuario.DoesNotExist:
        pass
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "is_staff": user.is_staff,
        "is_superuser": user.is_superuser,
        "perfil": perfil,
    }


class LoginView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        if not username or not password:
            return Response(
                {"detail": "Se requiere username y password."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user = authenticate(
            request, username=str(username).strip(), password=str(password)
        )
        if user is None:
            return Response(
                {"detail": "Credenciales inválidas."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not user.is_active:
            return Response(
                {"detail": "Usuario inactivo."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        token, _created = Token.objects.get_or_create(user=user)
        return Response(
            {"token": token.key, "user": _serialize_user_min(user)},
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"user": _serialize_user_min(request.user)})


class HealthCheckView(APIView):

    def get(self, request):
        return Response(
            {"status": "ok", "service": "mano-a-mano-backend"},
            status=status.HTTP_200_OK,
        )


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("id")
    serializer_class = UserSerializer

    def get_serializer_class(self):
        if self.action == "create":
            return UserCreateSerializer
        if self.action in ("update", "partial_update"):
            return UserUpdateSerializer
        return UserSerializer


class PerfilUsuarioViewSet(viewsets.ModelViewSet):
    queryset = PerfilUsuario.objects.select_related("user").all()
    serializer_class = PerfilUsuarioSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        uid = self.request.query_params.get("user")
        if uid is not None:
            qs = qs.filter(user_id=uid)
        return qs


class OrganizacionViewSet(viewsets.ModelViewSet):
    queryset = Organizacion.objects.select_related("propietario").all()
    serializer_class = OrganizacionSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        prop = self.request.query_params.get("propietario")
        if prop is not None:
            qs = qs.filter(propietario_id=prop)
        return qs


class OportunidadVoluntariadoViewSet(viewsets.ModelViewSet):
    queryset = (
        OportunidadVoluntariado.objects.select_related("organizacion")
        .all()
        .order_by("-created_at")
    )
    serializer_class = OportunidadVoluntariadoSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        activa = self.request.query_params.get("activa")

        if activa is not None:
            low = activa.lower()
            if low in ("1", "true", "si", "sí"):
                qs = qs.filter(activa=True)
            elif low in ("0", "false", "no"):
                qs = qs.filter(activa=False)
        org_id = self.request.query_params.get("organizacion")
        if org_id is not None:
            qs = qs.filter(organizacion_id=org_id)
        return qs


class PostulacionViewSet(viewsets.ModelViewSet):
    queryset = (
        Postulacion.objects.select_related("voluntario", "oportunidad")
        .all()
        .order_by("-created_at")
    )
    serializer_class = PostulacionSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        op_id = self.request.query_params.get("oportunidad")
        if op_id is not None:
            qs = qs.filter(oportunidad_id=op_id)
        vol_id = self.request.query_params.get("voluntario")
        if vol_id is not None:
            qs = qs.filter(voluntario_id=vol_id)
        return qs


class MensajeViewSet(viewsets.ModelViewSet):
    queryset = Mensaje.objects.select_related(
        "remitente", "destinatario", "oportunidad"
    ).all()
    serializer_class = MensajeSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        rem = self.request.query_params.get("remitente")
        dest = self.request.query_params.get("destinatario")
        if rem is not None:
            qs = qs.filter(remitente_id=rem)
        if dest is not None:
            qs = qs.filter(destinatario_id=dest)
        return qs

    @action(detail=False, methods=["get"])
    def bandeja(self, request):

        uid = request.query_params.get("usuario")
        if not uid:
            return Response(
                {"detail": "Se requiere el parámetro de consulta 'usuario'."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        get_object_or_404(User, pk=uid)
        base = Mensaje.objects.select_related(
            "remitente", "destinatario", "oportunidad"
        ).order_by("-created_at")
        recibidos = base.filter(destinatario_id=uid)
        enviados = base.filter(remitente_id=uid)
        return Response(
            {
                "recibidos": MensajeSerializer(recibidos, many=True).data,
                "enviados": MensajeSerializer(enviados, many=True).data,
            },
            status=status.HTTP_200_OK,
        )
