-- 1. Create market_observations table
CREATE TABLE IF NOT EXISTS public.market_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop TEXT NOT NULL,
  market_name TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  observation_date DATE NOT NULL,
  
  min_price NUMERIC,
  modal_price NUMERIC,
  max_price NUMERIC,
  price_unit TEXT NOT NULL,
  
  arrival_quantity NUMERIC,
  arrival_unit TEXT,
  
  source_name TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('CURATED', 'INGESTED', 'LIVE')),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for efficient querying by crop, market, and date
CREATE INDEX IF NOT EXISTS idx_market_observations_crop_market_date 
  ON public.market_observations(crop, market_name, observation_date DESC);

-- Enable RLS
ALTER TABLE public.market_observations ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read market data (Farmers and Buyers need access to general market data)
CREATE POLICY "Anyone authenticated can view market observations" 
  ON public.market_observations 
  FOR SELECT 
  USING (auth.role() = 'authenticated');
