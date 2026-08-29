-- =============================================================
-- DEFINITIVE FIX: Remove broken trigger, fix table schema
-- =============================================================
-- The trigger approach was failing because the profiles table
-- was created via Supabase Dashboard with ENUM types instead of
-- TEXT columns. Converting ENUMs is fragile. Instead, we:
-- 1. Remove the trigger entirely
-- 2. Fix the table to use TEXT columns
-- 3. Let the frontend insert profiles after signup (with RLS)
-- =============================================================

-- STEP 1: Remove any existing triggers that crash on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_user_created ON auth.users;
DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users;
DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users;

-- Clean up the function too
DROP FUNCTION IF EXISTS public.handle_new_user();

-- STEP 2: Fix column types - drop defaults and constraints first,
-- then convert, then re-add constraints.
-- Each statement wrapped in DO block to handle "does not exist" gracefully.

-- Fix 'role' column
DO $$
BEGIN
  ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  ALTER TABLE public.profiles ALTER COLUMN role TYPE TEXT USING role::text;
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('FARMER', 'BUYER'));
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'role column conversion skipped: %', SQLERRM;
END $$;

-- Fix 'account_type' column (add if missing, convert if ENUM)
DO $$
BEGIN
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_type TEXT;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.profiles ALTER COLUMN account_type DROP DEFAULT;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_account_type_check;
  ALTER TABLE public.profiles ALTER COLUMN account_type TYPE TEXT USING account_type::text;
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_account_type_check CHECK (account_type IN ('FARMER', 'FPO', 'BUYER'));
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'account_type column conversion skipped: %', SQLERRM;
END $$;

-- Fix 'preferred_language' column (add if missing, convert if ENUM)
DO $$
BEGIN
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.profiles ALTER COLUMN preferred_language DROP DEFAULT;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_preferred_language_check;
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_language_check;
  ALTER TABLE public.profiles ALTER COLUMN preferred_language TYPE TEXT USING preferred_language::text;
  ALTER TABLE public.profiles ALTER COLUMN preferred_language SET DEFAULT 'en';
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_preferred_language_check CHECK (preferred_language IN ('en', 'hi', 'mr'));
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'preferred_language column conversion skipped: %', SQLERRM;
END $$;

-- Ensure other required columns exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS organization_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS registration_reference TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS buyer_type TEXT;

-- STEP 3: RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- STEP 4: Clean up orphaned ENUM types
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.farmer_account_type CASCADE;
DROP TYPE IF EXISTS public.preferred_language CASCADE;
