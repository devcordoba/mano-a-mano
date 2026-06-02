from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework.exceptions import AuthenticationFailed

from .jwt_tokens import verificar_token


class JwtAuthentication(BaseAuthentication):
    keyword = b"bearer"

    def authenticate(self, request):
        auth = get_authorization_header(request).split()
        if not auth or auth[0].lower() != self.keyword:
            return None
        if len(auth) != 2:
            raise AuthenticationFailed("Formato de Authorization inválido.")

        token = auth[1].decode()
        usuario = verificar_token(token)
        if usuario is None:
            raise AuthenticationFailed("Token inválido o expirado.")
        if not usuario.is_active:
            raise AuthenticationFailed("Usuario inactivo.")
        return (usuario, None)
