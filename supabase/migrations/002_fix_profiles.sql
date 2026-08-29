-- Migration to fix auth structure and permissions

-- 1. Add account_type to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS account_type TEXT;

-- 2. Update role constraint to only allow FARMER and BUYER
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check CHECK (role IN ('FARMER', 'BUYER'));

-- 3. Add account_type constraint
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_account_type_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_account_type_check CHECK (account_type IN ('FARMER', 'FPO', 'BUYER'));

-- Set existing rows to match role if account_type is null
UPDATE public.profiles SET account_type = role WHERE account_type IS NULL;

-- 4. Make account_type NOT NULL
ALTER TABLE public.profiles
ALTER COLUMN account_type SET NOT NULL;

-- 5. Fix RLS by using a Security Definer function and Trigger
-- This handles the case where email confirmations are ON, causing the client-side
-- insert to fail because the user doesn't have a session yet (auth.uid() is null).

-- Create the function
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

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Ensure RLS is enabled and correct for subsequent updates/selects
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Note: We can remove the INSERT policy if we solely rely on the trigger,
-- but we leave it here in case client-side inserts are still used when 
-- email confirmations are disabled.
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
