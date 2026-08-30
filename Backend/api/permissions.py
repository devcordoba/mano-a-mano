from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsAuthenticatedOrReadOnly(BasePermission):

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated)

class IsOwner(BasePermission):

    def has_object_permission(self, request, view, obj):
        propietario = getattr(obj, "propietario", None)
        if propietario is None:
            return False
        return propietario.pk == request.user.pk

class IsOrganizacionOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        if hasattr(obj, "organizacion"):
            organizacion = obj.organizacion
        else:
            organizacion = obj
        return organizacion.propietario_id == request.user.pk

class IsPostulacionParticipantOrOrgOwner(BasePermission):

    def has_object_permission(self, request, view, obj):
        usuario = request.user
        if usuario is None:
            return False
        if not usuario.is_authenticated:
            return False
        if obj.voluntario_id == usuario.pk:
            return True
        return obj.oportunidad.organizacion.propietario_id == usuario.pk
