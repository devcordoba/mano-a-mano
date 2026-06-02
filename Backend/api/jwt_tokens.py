from datetime import datetime, timedelta, timezone

import jwt
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()


def _jwt_secret() -> str:
    return getattr(settings, "JWT_SECRET", settings.SECRET_KEY)


def _jwt_lifetime() -> timedelta:
    seconds = getattr(settings, "JWT_ACCESS_LIFETIME_SECONDS", 60 * 60 * 24 * 14)
    return timedelta(seconds=seconds)


def crear_token_usuario(usuario) -> str:
    ahora = datetime.now(timezone.utc)
    payload = {
        "sub": str(usuario.pk),
        "iat": ahora,
        "exp": ahora + _jwt_lifetime(),
    }
    return jwt.encode(payload, _jwt_secret(), algorithm="HS256")


def verificar_token(token: str):
    try:
        payload = jwt.decode(
            token,
            _jwt_secret(),
            algorithms=["HS256"],
            options={"require": ["exp", "sub"]},
        )
    except jwt.PyJWTError:
        return None
    user_id = payload.get("sub")
    if user_id is None:
        return None
    try:
        return User.objects.get(pk=int(user_id))
    except (User.DoesNotExist, TypeError, ValueError):
        return None
