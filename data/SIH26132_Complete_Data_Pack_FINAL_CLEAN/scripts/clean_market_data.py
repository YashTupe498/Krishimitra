"""Normalize real market data after actual column inspection.
Do not assume source column names.
"""
import pandas as pd

def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df.columns = [str(c).strip().lower().replace(" ", "_") for c in df.columns]
    return df
