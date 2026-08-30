import type { Lot } from '../types/lot';

type LotPayload = {
  id: string;
  crop: string;
  quantity: string;
  unit: string;
  location: string;
  village?: string;
  taluka?: string;
  district?: string;
  state?: string;
  status: string;
  quality_grade?: string | null;
  constraints: Lot['constraints'];
};

type ApiLot = {
  id: string;
  farmer_id: string;
  crop: string;
  quantity: string;
  unit: string;
  location?: string | null;
  village?: string | null;
  taluka?: string | null;
  district?: string | null;
  state?: string | null;
  status: Lot['status'];
  quality_grade?: Lot['qualityGrade'];
  constraints?: Partial<Lot['constraints']> | null;
  created_at?: string | null;
  updated_at?: string | null;
};

const request = async <T>(path: string, token: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(path, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });
  if (!response.ok) throw new Error((await response.text()) || 'The lot could not be saved.');
  return response.json() as Promise<T>;
};

const toLot = (lot: ApiLot): Lot => ({
  id: lot.id,
  farmerId: lot.farmer_id,
  crop: lot.crop,
  quantity: lot.quantity,
  unit: lot.unit,
  location: lot.location || [lot.village, lot.state].filter(Boolean).join(', '),
  village: lot.village || undefined,
  taluka: lot.taluka || undefined,
  district: lot.district || undefined,
  state: lot.state || undefined,
  status: lot.status,
  qualityGrade: lot.quality_grade || null,
  qualityAssessment: null,
  constraints: {
    paymentRequirement: lot.constraints?.paymentRequirement || 'Within 7 days',
    transportCapability: lot.constraints?.transportCapability || 'Can arrange transport',
    storageCapability: lot.constraints?.storageCapability || 'Can store produce',
  },
  createdAt: lot.created_at || new Date().toISOString(),
  updatedAt: lot.updated_at || lot.created_at || new Date().toISOString(),
});

export const farmerLotsApi = {
  create: async (token: string, lot: LotPayload) => toLot(await request<ApiLot>('/api/v1/farmer/lots/', token, { method: 'POST', body: JSON.stringify(lot) })),
  update: async (token: string, id: string, changes: Partial<LotPayload>) => toLot(await request<ApiLot>(`/api/v1/farmer/lots/${id}`, token, { method: 'PATCH', body: JSON.stringify(changes) })),
  list: async (token: string) => (await request<ApiLot[]>('/api/v1/farmer/lots/', token)).map(toLot),
  get: async (token: string, id: string) => toLot(await request<ApiLot>(`/api/v1/farmer/lots/${id}`, token)),
};
