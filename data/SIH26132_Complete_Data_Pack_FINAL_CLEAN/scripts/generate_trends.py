"""Generate derived price/arrival trend metrics from processed data."""
import pandas as pd

def add_rolling_metrics(df: pd.DataFrame, window: int = 7) -> pd.DataFrame:
    df = df.sort_values("date").copy()
    df["rolling_avg_price"] = df["modal_price"].rolling(window, min_periods=1).mean()
    df["price_change_pct"] = df["modal_price"].pct_change() * 100
    return df
