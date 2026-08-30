"""Canonical crop handling shared by lot and demand workflows."""

from __future__ import annotations


def normalize_crop(value: str) -> str:
    """Return a stable display value while rejecting blank crop names.

    Matching uses :func:`crop_key`; storing the cleaned display value keeps the
    API responses human-readable without depending on a hard-coded crop list.
    """
    cleaned = " ".join(value.split())
    if not cleaned:
        raise ValueError("Crop is required.")
    return cleaned.title()


def crop_key(value: str) -> str:
    """Canonical comparison key for any crop name."""
    return " ".join(value.split()).casefold()
