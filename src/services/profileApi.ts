import { apiRequest } from './apiClient';

export type PersistedProfile = {
  id: string;
  role: string;
  full_name: string;
  phone: string | null;
  district: string | null;
  state: string | null;
  avatar_url: string | null;
};

export const profileApi = {
  getMine: (): Promise<PersistedProfile> => apiRequest<PersistedProfile>('/profiles/me'),
  updateMine: (changes: Partial<Pick<PersistedProfile, 'full_name' | 'phone' | 'avatar_url'>>): Promise<PersistedProfile> =>
    apiRequest<PersistedProfile>('/profiles/me', { method: 'PATCH', body: JSON.stringify(changes) }),
};
