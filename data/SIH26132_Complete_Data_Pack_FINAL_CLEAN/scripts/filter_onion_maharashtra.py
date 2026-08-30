#!/usr/bin/env python3
"""Filter the downloaded historical dataset to Onion + Maharashtra and normalize it."""
from pathlib import Path
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
inp = ROOT/"raw/third_party/agmarknet_india_historical_prices_2024_2025.csv"
out = ROOT/"processed/onion_maharashtra_prices_2024_2025.csv"

df = pd.read_csv(inp)
df.columns = [str(c).strip().lower() for c in df.columns]

filtered = df[
    df["state"].astype(str).str.strip().str.lower().eq("maharashtra")
    & df["commodity"].astype(str).str.strip().str.lower().eq("onion")
].copy()

rename = {
    "district_name":"district",
    "market_name":"market",
    "price_date":"date"
}
filtered = filtered.rename(columns=rename)

keep = [c for c in ["date","state","district","market","commodity","variety","grade",
                    "min_price","max_price","modal_price"] if c in filtered.columns]
filtered = filtered[keep].sort_values(["date","district","market"])
filtered.to_csv(out, index=False)
print(f"Saved {len(filtered):,} rows to {out}")
