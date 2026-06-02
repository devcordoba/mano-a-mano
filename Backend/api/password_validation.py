import re

PASSWORD_STRENGTH_MSG = (
    "La contraseña debe tener al menos 8 caracteres, una mayúscula y un número."
)


def validate_password_strength(value: str) -> str:
    if not value or len(value) < 8:
        raise ValueError(PASSWORD_STRENGTH_MSG)
    if not re.search(r"[A-Z]", value):
        raise ValueError(PASSWORD_STRENGTH_MSG)
    if not re.search(r"\d", value):
        raise ValueError(PASSWORD_STRENGTH_MSG)
    return value
