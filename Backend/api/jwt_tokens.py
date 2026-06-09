import hashlib
from datetime import datetime, timedelta, timezone

import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.cache import cache

User = get_user_model()

_CACHE_PREFIX = "jwt:blacklist:"


def _jwt_secret() -> str:
    return getattr(settings, "JWT_SECRET", settings.SECRET_KEY)


def _jwt_lifetime() -> timedelta:
    seconds = getattr(settings, "JWT_ACCESS_LIFETIME_SECONDS", 60 * 60 * 24 * 14)
    return timedelta(seconds=seconds)


def _cache_key_token(token: str) -> str:
    digest = hashlib.sha256(token.encode("utf-8")).hexdigest()
    return f"{_CACHE_PREFIX}{digest}"


def invalidar_token(token: str) -> None:
    """Registra el JWT en blacklist hasta su expiración natural."""
    try:
        payload = jwt.decode(
            token,
            _jwt_secret(),
            algorithms=["HS256"],
            options={"require": ["exp"]},
        )
    except jwt.PyJWTError:
        return

    exp = payload.get("exp")
    if exp is None:
        return

    ttl = int(exp - datetime.now(timezone.utc).timestamp())
    if ttl < 1:
        ttl = 1

    cache.set(_cache_key_token(token), True, timeout=ttl)


def token_esta_invalidado(token: str) -> bool:
    return cache.get(_cache_key_token(token)) is True


def crear_token_usuario(usuario) -> str:
    ahora = datetime.now(timezone.utc)
    payload = {
        "sub": str(usuario.pk),
        "iat": ahora,
        "exp": ahora + _jwt_lifetime(),
    }
    return jwt.encode(payload, _jwt_secret(), algorithm="HS256")


def verificar_token(token: str):
    if token_esta_invalidado(token):
        return None
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
