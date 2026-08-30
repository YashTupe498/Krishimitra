#!/usr/bin/env python3
"""Best-effort source downloader.

Run locally where you have internet access:
    python scripts/download_sources.py

This downloads the publicly accessible third-party historical AGMARKNET-derived dataset
and saves it under raw/third_party/. Official OGD/e-NAM downloads may require browser/API
access and should be saved manually under raw/agmarknet or raw/enam.
"""
from pathlib import Path
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "raw" / "third_party" / "agmarknet_india_historical_prices_2024_2025.csv"

URL = "https://raw.githubusercontent.com/BatMan0100/agricast/main/agmarknet_india_historical_prices_2024_2025.csv"

OUT.parent.mkdir(parents=True, exist_ok=True)
print("Downloading:", URL)
urllib.request.urlretrieve(URL, OUT)
print("Saved:", OUT)
print("Next: run your filtering/normalization pipeline for Onion + Maharashtra.")
