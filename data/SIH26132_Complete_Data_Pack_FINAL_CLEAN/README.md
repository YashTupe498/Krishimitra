# SIH 26132 Agriculture Data Pack

## Scope
Prototype focus: Onion market-linkage workflow in Maharashtra, centered on the Nashik region.

## Data honesty rule
SOURCE data must come from authoritative downloads/exports.
CURATED files simulate ecosystem participants where public/live datasets are unavailable.
Never display CURATED or SIMULATED records as live government or marketplace data.

## Folder flow
raw/ -> validation/cleaning -> processed/ -> PostgreSQL/PostGIS -> application services

## Core SIH modules supported
- Mandi price aggregation
- Arrival analysis
- Price trends
- Produce lots and quality workflow
- Buyer matching
- Net realization
- Feasibility constraints
- Constraint resolution
- FPO/aggregation scenarios
- Digital offers
- Logistics estimation
- Payment workflow
- Transaction state transitions

## Missing real data
This pack intentionally does not fabricate historical market records.
Download official source data into raw/agmarknet and raw/enam, then adapt ingestion mappings after inspecting actual columns.

## Key official sources
Government OGD/AGMARKNET:
https://www.data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi

Variety-wise prices:
https://www.data.gov.in/resource/variety-wise-daily-market-prices-data-commodity

e-NAM historical dashboard:
https://www.enam.gov.in/web/dashboard/Historical


## Added source acquisition
A `raw/third_party/` folder and `scripts/download_sources.py` were added. Run the downloader locally to fetch the identified public historical AGMARKNET-derived CSV, then run `filter_onion_maharashtra.py` to create a focused processed dataset.


## Complete version additions
This version adds e-NAM source schemas, acquisition instructions, advance-supply schema, farmer/lot/quality workflows, market costs, logistics routes, warehouse-finance scenarios, constraint-resolution options, grievance workflow, and recommendation scenarios.


## Populated market-data build (2026-08-26)
This build adds 84 real Maharashtra Onion daily market-price observations to the e-NAM/AGMARKNET layer. See `metadata/market_data_provenance_2026.md` for source chain and limitations. Missing arrivals/traded quantity and advance-supply data are intentionally not fabricated.
