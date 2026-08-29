import type { User as SupabaseUser, Session as SupabaseSession } from '@supabase/supabase-js';

export type UserRole = 'FARMER' | 'BUYER';
export type AccountType = 'FARMER' | 'FPO' | 'BUYER';
export type PreferredLanguage = 'en' | 'hi' | 'mr';

export interface Profile {
  id: string;
  role: UserRole;
  account_type: AccountType;
  full_name: string;
  phone?: string | null;
  district?: string | null;
  state?: string | null;
  preferred_language: PreferredLanguage;
  organization_name?: string | null;
  registration_reference?: string | null;
  buyer_type?: string | null;
  created_at: string;
}

export type User = SupabaseUser;
export type Session = SupabaseSession;
