-- Forward-only marketplace contract repair. Existing single-grade demands
-- remain valid and become one-item accepted-grade arrays.
ALTER TABLE public.buyer_demands
  ADD COLUMN IF NOT EXISTS accepted_quality_grades TEXT[];

UPDATE public.buyer_demands
SET accepted_quality_grades = ARRAY[required_quality_grade]
WHERE accepted_quality_grades IS NULL OR cardinality(accepted_quality_grades) = 0;

ALTER TABLE public.buyer_demands
  ALTER COLUMN accepted_quality_grades SET DEFAULT ARRAY[]::TEXT[],
  ALTER COLUMN accepted_quality_grades SET NOT NULL;

ALTER TABLE public.market_observations
  ADD COLUMN IF NOT EXISTS variety TEXT,
  ADD COLUMN IF NOT EXISTS grade TEXT,
  ADD COLUMN IF NOT EXISTS source_record_id TEXT,
  ADD COLUMN IF NOT EXISTS source_url TEXT,
  ADD COLUMN IF NOT EXISTS source_caveat TEXT,
  ADD COLUMN IF NOT EXISTS retrieved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS data_classification TEXT;

ALTER TABLE public.market_observations
  DROP CONSTRAINT IF EXISTS market_observations_source_type_check;

ALTER TABLE public.market_observations
  ADD CONSTRAINT market_observations_source_type_check
  CHECK (source_type IN (
    'CURATED', 'INGESTED', 'LIVE', 'OBSERVED_MARKET_DATA',
    'GOVERNMENT_SOURCE_DERIVED_CURRENT', 'DERIVED_ANALYTIC',
    'CURATED_DEMO', 'REFERENCE_ESTIMATE'
  ));
