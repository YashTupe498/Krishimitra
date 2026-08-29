-- 1. Create buyer_demands table
CREATE TABLE IF NOT EXISTS public.buyer_demands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  crop TEXT NOT NULL,
  required_quantity NUMERIC NOT NULL,
  quantity_unit TEXT NOT NULL DEFAULT 'kg',
  required_quality_grade TEXT NOT NULL,
  delivery_location TEXT NOT NULL,
  required_date DATE,
  payment_terms TEXT,
  transport_requirement TEXT,
  storage_requirement TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.buyer_demands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Buyers can manage own demands" ON public.buyer_demands 
  FOR ALL USING (auth.uid() = buyer_id);
CREATE POLICY "Farmers can view active demands" ON public.buyer_demands
  FOR SELECT USING (status = 'ACTIVE' AND auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'FARMER'));

-- 2. Create opportunities table
CREATE TABLE IF NOT EXISTS public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lot_id TEXT NOT NULL REFERENCES public.lots(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  demand_id UUID NOT NULL REFERENCES public.buyer_demands(id) ON DELETE CASCADE,
  
  match_status TEXT NOT NULL,
  match_score INTEGER,
  match_reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  quantity_matched NUMERIC,
  quantity_unit TEXT,
  quality_match TEXT,
  location_match TEXT,
  date_match TEXT,
  payment_match TEXT,
  transport_status TEXT,
  storage_status TEXT,
  
  status TEXT NOT NULL DEFAULT 'MATCHED',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(demand_id, lot_id)
);

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farmers can manage own opportunities" ON public.opportunities 
  FOR ALL USING (auth.uid() = farmer_id);
CREATE POLICY "Buyers can view opportunities for their demands" ON public.opportunities 
  FOR SELECT USING (auth.uid() = buyer_id);
