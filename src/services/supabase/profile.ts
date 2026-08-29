import { supabase } from './client';
import type { Profile } from '../../types/auth';

export const profileService = {
  createProfile: async (profileData: Omit<Profile, 'created_at'>) => {
    const { data, error } = await supabase
      .from('profiles')
      .insert([profileData])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  
  getProfile: async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  }
};
