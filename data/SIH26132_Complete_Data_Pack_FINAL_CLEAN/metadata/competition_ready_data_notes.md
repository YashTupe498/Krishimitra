# Competition-ready extension notes

Data types are explicitly separated:
- OBSERVED: records already present in the pack and derived from observed market-price data.
- DERIVED: calculations based on existing data.
- CURATED_SCENARIO/DEMO: engineering/test records, not official live records.
- PROXY: estimate generated because the source pack did not contain the requested official field.

Important: `market_arrivals_real.csv` keeps the requested filename for pipeline compatibility, but its rows are marked `DERIVED_PROXY_FROM_PRICE_NOT_OFFICIAL_ARRIVALS`; they must be replaced with official AGMARKNET arrival records before claiming live/official arrivals.
Likewise multi-market expansion rows, weather scenarios, transport rates, and FPO capacity fields include explicit source/status labels and must not be presented as official data.
