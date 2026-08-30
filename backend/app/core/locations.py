"""Small, shared location and unit normalizers for marketplace matching."""

from __future__ import annotations


def location_key(value: str | None) -> str:
    """Canonicalise labels such as ``Nashik District`` to ``nashik``."""
    if not value:
        return ""
    normalized = " ".join(value.split()).casefold().strip()
    for suffix in (" district", " dist.", " dist"):
        if normalized.endswith(suffix):
            return normalized[: -len(suffix)].strip()
    return normalized


def location_matches(required_location: str | None, *lot_locations: str | None) -> bool:
    required = location_key(required_location)
    if not required:
        return False
    return any(required == location_key(candidate) for candidate in lot_locations if candidate)


def quantity_to_kg(quantity: float, unit: str | None) -> float:
    """Convert supported marketplace units to kilograms at the domain boundary."""
    normalized = (unit or "kg").strip().casefold()
    if normalized in {"quintal", "quintals", "q", "qt"}:
        return quantity * 100
    return quantity
