from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import OportunidadVoluntariado
from .serializers import OportunidadVoluntariadoSerializer


class HealthCheckView(APIView):
    def get(self, request):
        return Response({"status": "ok", "service": "backend"})


class OportunidadVoluntariadoViewSet(viewsets.ModelViewSet):
    queryset = OportunidadVoluntariado.objects.all().order_by("-created_at")
    serializer_class = OportunidadVoluntariadoSerializer
