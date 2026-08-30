"""Starter ingestion script.
Adapt column mappings after inspecting the real downloaded files.
"""
from pathlib import Path
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "raw"
PROCESSED = ROOT / "processed"

def list_csvs(folder: Path):
    return list(folder.rglob("*.csv"))

if __name__ == "__main__":
    files = list_csvs(RAW)
    print("Raw CSV files found:")
    for f in files:
        print("-", f)
    print("\nInspect actual columns before implementing normalization mappings.")
