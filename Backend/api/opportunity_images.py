
from __future__ import annotations

import hashlib
import io
from typing import Tuple

from PIL import Image, ImageDraw

_PALETAS_CAUSA: list[tuple[str, tuple[int, int, int], tuple[int, int, int], tuple[int, int, int]]] = [
    ("educ", (66, 103, 178), (141, 180, 226), (255, 235, 59)),
    ("ambient", (46, 125, 50), (129, 199, 132), (255, 241, 118)),
    ("salud", (198, 40, 40), (239, 154, 154), (255, 255, 255)),
    ("inclus", (123, 31, 162), (186, 104, 200), (255, 183, 77)),
    ("animal", (230, 81, 0), (255, 183, 77), (255, 255, 255)),
    ("cultur", (216, 27, 96), (244, 143, 177), (255, 255, 255)),
    ("derech", (21, 101, 192), (100, 181, 246), (255, 255, 255)),
    ("emerg", (183, 28, 28), (239, 83, 80), (255, 255, 255)),
    ("deport", (0, 121, 107), (77, 182, 172), (255, 255, 255)),
]

_DEFAULT_PALETTE = ((94, 53, 177), (149, 117, 205), (255, 255, 255))

def _palette_for_causa(causa_nombre: str) -> tuple[tuple[int, int, int], tuple[int, int, int], tuple[int, int, int]]:
    if causa_nombre is None:
        causa_nombre = ""
    nombre_minuscula = causa_nombre.lower()

    for clave, color_superior, color_inferior, color_acento in _PALETAS_CAUSA:
        if clave in nombre_minuscula:
            return color_superior, color_inferior, color_acento
    return _DEFAULT_PALETTE

def _gradient(size: Tuple[int, int], top: tuple[int, int, int], bottom: tuple[int, int, int]) -> Image.Image:
    ancho, alto = size
    img = Image.new("RGB", (ancho, alto))
    draw = ImageDraw.Draw(img)
    for y in range(alto):
        proporcion_vertical = y / max(alto - 1, 1)
        r = int(top[0] * (1 - proporcion_vertical) + bottom[0] * proporcion_vertical)
        g = int(top[1] * (1 - proporcion_vertical) + bottom[1] * proporcion_vertical)
        b = int(top[2] * (1 - proporcion_vertical) + bottom[2] * proporcion_vertical)
        draw.line([(0, y), (ancho, y)], fill=(r, g, b))
    return img

def _rng_step(seed: int) -> int:
    return (seed * 1103515245 + 12345) & 0x7FFFFFFF

def _abstract_shapes(draw: ImageDraw.ImageDraw, w: int, h: int, seed: int, accent: tuple[int, int, int]) -> None:
    rng = seed % 9973
    for _ in range(10):
        rng = _rng_step(rng)
        x0 = rng % max(w - 20, 1)
        rng = _rng_step(rng)
        y0 = rng % max(h - 20, 1)
        rng = _rng_step(rng)
        size = (rng % (min(w, h) // 2)) + 28
        x1 = min(x0 + size, w - 2)
        y1 = min(y0 + int(size * 0.75), h - 2)
        draw.ellipse([x0, y0, x1, y1], fill=(*accent, 42), outline=None)

    for _ in range(4):
        rng = _rng_step(rng)
        x0 = rng % max(w // 2, 1)
        rng = _rng_step(rng)
        y0 = rng % max(h // 2, 1)
        rng = _rng_step(rng)
        x1 = min(x0 + (rng % (w // 2)) + 50, w - 2)
        y1 = min(y0 + (rng % (h // 3)) + 35, h - 2)
        draw.rounded_rectangle([x0, y0, x1, y1], radius=18, fill=(255, 255, 255, 28), outline=None)

    for _ in range(3):
        rng = _rng_step(rng)
        cx = rng % w
        rng = _rng_step(rng)
        cy = rng % h
        rng = _rng_step(rng)
        r = (rng % 40) + 18
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 255, 255, 38), outline=None)

def generate_opportunity_image(
    titulo: str,
    causa_nombre: str = "",
    organizacion_nombre: str = "",
    *,
    width: int = 480,
    height: int = 320,
) -> bytes:
    _ = organizacion_nombre
    top, bottom, accent = _palette_for_causa(causa_nombre)
    img = _gradient((width, height), top, bottom).convert("RGBA")
    overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    seed = int(hashlib.md5(f"{titulo}|{causa_nombre}".encode()).hexdigest()[:8], 16)
    _abstract_shapes(draw, width, height, seed, accent)
    img = Image.alpha_composite(img, overlay)

    buf = io.BytesIO()
    img.convert("RGB").save(buf, format="PNG", optimize=True)
    return buf.getvalue()
