# Market data provenance — populated build

## Real records included
- 84 daily Onion price observations for Maharashtra, Nashik district, Lasalgaon APMC and Lasalgaon(Vinchur) APMC.
- Date coverage: 2026-06-27 through 2026-08-25 (non-trading/reporting days naturally absent).
- Fields directly available: min price, max price, modal price, variety, market, district/state context.
- Unit normalized as Quintal (Rs/quintal).

## Source chain
1. Official Government of India OGD/AGMARKNET catalogue identifies the daily mandi price dataset and its fields.
2. AGMARKNET-attributed market pages were used to capture the visible recent daily rows for the two Nashik markets.
3. Maharashtra State Agricultural Marketing Board SMART weekly reports, sourced from AGMARKNET, provide independent contextual validation for Maharashtra onion market levels and selected markets.

## Important limitations
- Arrival quantity and traded quantity were not present in the captured daily price rows and are deliberately left blank.
- `enam_or_non_enam` is not inferred; it is set to `Unknown (not inferred from source)`.
- No verified public advance-supply rows were inserted.
- These files are real observed market-price records, not synthetic demo data, but they are a curated extraction rather than a complete official export.
