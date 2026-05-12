from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    HealthCheckView,
    LoginView,
    LogoutView,
    MeView,
    MensajeViewSet,
    OportunidadVoluntariadoViewSet,
    OrganizacionViewSet,
    PerfilUsuarioViewSet,
    PostulacionViewSet,
    UserViewSet,
)

router = DefaultRouter()
router.register(r"usuarios", UserViewSet, basename="usuario")
router.register(r"perfiles", PerfilUsuarioViewSet, basename="perfil")
router.register(r"organizaciones", OrganizacionViewSet, basename="organizacion")
router.register(r"oportunidades", OportunidadVoluntariadoViewSet, basename="oportunidad-voluntariado")
router.register(r"postulaciones", PostulacionViewSet, basename="postulacion")
router.register(r"mensajes", MensajeViewSet, basename="mensaje")

urlpatterns = [
    path("health/", HealthCheckView.as_view(), name="health"),
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/logout/", LogoutView.as_view(), name="auth-logout"),
    path("auth/me/", MeView.as_view(), name="auth-me"),
    path("", include(router.urls)),
]
