-- 1. Create lots table
CREATE TABLE IF NOT EXISTS public.lots (
  id TEXT PRIMARY KEY,
  farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  crop TEXT NOT NULL,
  quantity TEXT NOT NULL,
  unit TEXT NOT NULL,
  location TEXT,
  village TEXT,
  taluka TEXT,
  district TEXT,
  state TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  quality_grade TEXT,
  constraints JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.lots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farmers can manage own lots" ON public.lots 
  FOR ALL USING (auth.uid() = farmer_id);

-- 2. Create quality_assessments table
CREATE TABLE IF NOT EXISTS public.quality_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id TEXT NOT NULL REFERENCES public.lots(id) ON DELETE CASCADE,
  farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  grade TEXT NOT NULL CHECK (grade IN ('A', 'B', 'C')),
  assessment_mode TEXT NOT NULL,
  reasoning JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(lot_id)
);

ALTER TABLE public.quality_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farmers can manage own assessments" ON public.quality_assessments 
  FOR ALL USING (auth.uid() = farmer_id);

-- 3. Create quality_images table
CREATE TABLE IF NOT EXISTS public.quality_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES public.quality_assessments(id) ON DELETE SET NULL,
  lot_id TEXT NOT NULL REFERENCES public.lots(id) ON DELETE CASCADE,
  farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  image_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.quality_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farmers can manage own images" ON public.quality_images 
  FOR ALL USING (auth.uid() = farmer_id);

-- 4. Create storage bucket for produce images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('produce-images', 'produce-images', true) 
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Farmers can upload own produce images" ON storage.objects 
  FOR INSERT WITH CHECK (
    bucket_id = 'produce-images' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Farmers can update own produce images" ON storage.objects 
  FOR UPDATE USING (
    bucket_id = 'produce-images' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Farmers can delete own produce images" ON storage.objects 
  FOR DELETE USING (
    bucket_id = 'produce-images' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Anyone can view public produce images" ON storage.objects 
  FOR SELECT USING (bucket_id = 'produce-images');
