# Final Data Integrity Report

- CSV files audited: 139
- Structural malformed CSV files: 0
- Exact duplicate files remaining: 1
- Exact duplicate rows remaining: 0
- FK relationships checked: 43
- Invalid FK relationships remaining: 0
- Aggregation reconciliation failures: 0

## Cleanup performed

- Removed the exact duplicate AGMARKNET dataset from `raw/enam/agmarknet_dashboard/`; canonical records remain under `raw/agmarknet/`.
- Repaired `audit_repair_log.csv` to a consistent four-column schema.
- Rebuilt foreign-key validation from the current schema; `aggregation_lot_id` is now validated through `aggregation_lot_members.csv`.
- Reconciled aggregation member quantities to declared aggregation totals without over-allocating source lots.
- Populated market and commodity canonical mappings, unit conversion rules, and status codebook from the current pack.
- Regenerated all audit reports from the cleaned files.

## Provenance note

Schema-only e-NAM files remain intentionally empty and are explicitly classified as `SCHEMA_ONLY`; curated/demo and derived data are not relabelled as live official records.
