import type { Lot } from '../types/lot';
import { apiRequest } from './apiClient';

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
  create: async (_token: string, lot: LotPayload) => toLot(await apiRequest<ApiLot>('/farmer/lots/', { method: 'POST', body: JSON.stringify(lot) })),
  update: async (_token: string, id: string, changes: Partial<LotPayload>) => toLot(await apiRequest<ApiLot>(`/farmer/lots/${id}`, { method: 'PATCH', body: JSON.stringify(changes) })),
  list: async (_token: string) => (await apiRequest<ApiLot[]>('/farmer/lots/')).map(toLot),
  get: async (_token: string, id: string) => toLot(await apiRequest<ApiLot>(`/farmer/lots/${id}`)),
};
