export type UserRole = 'FARMER' | 'BUYER';
export type FarmerAccountType = 'FARMER' | 'FPO';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  account_type?: FarmerAccountType;
  organization_name?: string;
  phone: string;
  district: string;
  state: string;
  created_at: string;
}
