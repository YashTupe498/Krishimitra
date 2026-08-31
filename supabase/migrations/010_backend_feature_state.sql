-- Forward-only source-of-truth tables used by the FastAPI application layer.
-- Apply with the Supabase CLI or SQL editor after migrations 001-009.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

CREATE TABLE IF NOT EXISTS public.marketplace_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id TEXT NOT NULL UNIQUE REFERENCES public.buyer_offers(id) ON DELETE RESTRICT,
  lot_id TEXT NOT NULL REFERENCES public.lots(id) ON DELETE RESTRICT,
  demand_id UUID NOT NULL REFERENCES public.buyer_demands(id) ON DELETE RESTRICT,
  farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  agreed_price_per_quintal NUMERIC NOT NULL CHECK (agreed_price_per_quintal >= 0),
  total_value NUMERIC NOT NULL CHECK (total_value >= 0),
  payment_timeline_days INTEGER NOT NULL CHECK (payment_timeline_days >= 0),
  transaction_status TEXT NOT NULL DEFAULT 'CREATED' CHECK (transaction_status IN ('CREATED','LOGISTICS_PLANNED','IN_TRANSIT','DELIVERED','PAYMENT_PENDING','PAYMENT_CONFIRMED','COMPLETED','CANCELLED')),
  logistics_status TEXT NOT NULL DEFAULT 'NOT_PLANNED' CHECK (logistics_status IN ('NOT_PLANNED','PLANNED','IN_TRANSIT','DELIVERED')),
  payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING','CONFIRMED','OVERDUE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS marketplace_transactions_buyer_idx ON public.marketplace_transactions (buyer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS marketplace_transactions_farmer_idx ON public.marketplace_transactions (farmer_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.grievances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('HIGH','MEDIUM','LOW')),
  status TEXT NOT NULL DEFAULT 'SUBMITTED',
  location TEXT,
  evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
  classification_summary TEXT,
  classification_reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  resolution_guidance JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS grievances_farmer_idx ON public.grievances (farmer_id, created_at DESC);

ALTER TABLE public.marketplace_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grievances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Marketplace parties can view transactions" ON public.marketplace_transactions FOR SELECT USING (auth.uid() IN (buyer_id, farmer_id));
CREATE POLICY "Farmers can view own grievances" ON public.grievances FOR SELECT USING (auth.uid() = farmer_id);
CREATE POLICY "Farmers can create own grievances" ON public.grievances FOR INSERT WITH CHECK (auth.uid() = farmer_id);
