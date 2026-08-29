-- 1. Ensure ALL required columns exist (this fixes the "does not exist" errors)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS district TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS organization_name TEXT,
  ADD COLUMN IF NOT EXISTS registration_reference TEXT,
  ADD COLUMN IF NOT EXISTS buyer_type TEXT;

-- 2. Safely convert potential ENUM columns to TEXT
ALTER TABLE public.profiles
  ALTER COLUMN role TYPE TEXT USING role::text,
  ALTER COLUMN account_type TYPE TEXT USING account_type::text;

-- 3. Update constraints to be safe
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('FARMER', 'BUYER'));

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_account_type_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_account_type_check CHECK (account_type IN ('FARMER', 'FPO', 'BUYER'));

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_language_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_language_check CHECK (preferred_language IN ('en', 'hi', 'mr'));

-- 4. Recreate the trigger now that all columns are guaranteed to exist
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    role,
    account_type,
    full_name,
    phone,
    district,
    state,
    preferred_language,
    organization_name,
    registration_reference,
    buyer_type
  )
  VALUES (
    new.id,
    new.raw_user_meta_data->>'role',
    new.raw_user_meta_data->>'account_type',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'district',
    new.raw_user_meta_data->>'state',
    COALESCE(new.raw_user_meta_data->>'preferred_language', 'en'),
    new.raw_user_meta_data->>'organization_name',
    new.raw_user_meta_data->>'registration_reference',
    new.raw_user_meta_data->>'buyer_type'
  );
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
