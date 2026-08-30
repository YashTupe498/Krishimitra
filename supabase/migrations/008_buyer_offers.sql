CREATE TABLE IF NOT EXISTS public.buyer_offers (
  id TEXT PRIMARY KEY,
  lot_id TEXT NOT NULL REFERENCES public.lots(id) ON DELETE CASCADE,
  demand_id UUID NOT NULL REFERENCES public.buyer_demands(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  price_per_quintal NUMERIC NOT NULL CHECK (price_per_quintal >= 0),
  estimated_total_value NUMERIC NOT NULL CHECK (estimated_total_value >= 0),
  payment_timeline_days INTEGER NOT NULL CHECK (payment_timeline_days >= 0),
  delivery_preference TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'SENT',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.buyer_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Buyers can manage own offers" ON public.buyer_offers FOR ALL USING (auth.uid() = buyer_id);
CREATE POLICY "Farmers can view received offers" ON public.buyer_offers FOR SELECT USING (auth.uid() = farmer_id);
