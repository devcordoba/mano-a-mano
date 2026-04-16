from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import HealthCheckView, OportunidadVoluntariadoViewSet

router = DefaultRouter()
router.register(r"oportunidades", OportunidadVoluntariadoViewSet, basename="oportunidad-voluntariado")

urlpatterns = [
    path("health/", HealthCheckView.as_view(), name="health"),
    path("", include(router.urls)),
]
