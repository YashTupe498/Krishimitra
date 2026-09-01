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
  create: async (token: string, lot: LotPayload) => {
    const saved = toLot(await request<ApiLot>('/api/v1/farmer/lots/', token, { method: 'POST', body: JSON.stringify(lot) }));
    const globalLots = JSON.parse(localStorage.getItem('krishimitra_demo_lots_global') || '[]');
    localStorage.setItem('krishimitra_demo_lots_global', JSON.stringify([...globalLots, saved]));
    return saved;
  },
  update: async (token: string, id: string, changes: Partial<LotPayload>) => {
    const saved = toLot(await request<ApiLot>(`/api/v1/farmer/lots/${id}`, token, { method: 'PATCH', body: JSON.stringify(changes) }));
    const globalLots = JSON.parse(localStorage.getItem('krishimitra_demo_lots_global') || '[]');
    const idx = globalLots.findIndex((l: Lot) => l.id === id);
    if (idx >= 0) {
      globalLots[idx] = saved;
      localStorage.setItem('krishimitra_demo_lots_global', JSON.stringify(globalLots));
    }
    return saved;
  },
  list: async (token: string) => {
    let lots: Lot[] = [];
    try {
      lots = (await request<ApiLot[]>('/api/v1/farmer/lots/', token)).map(toLot);
    } catch (e) {}
    try {
      const globalLotsData = JSON.parse(localStorage.getItem('krishimitra_demo_lots_global') || '[]');
      const globalLots = Array.isArray(globalLotsData) ? globalLotsData : [];
      const existingIds = new Set(lots.map(l => l.id));
      globalLots.forEach((gl: Lot) => {
        if (!existingIds.has(gl.id)) {
          lots.push(gl);
          existingIds.add(gl.id);
        }
      });
    } catch (e) {
      console.error('Failed to parse globalLots', e);
    }
    
    // Filter out deleted lots
    let deletedLots: string[] = [];
    try {
      deletedLots = JSON.parse(localStorage.getItem('krishimitra_demo_deleted_lots') || '[]');
    } catch(e) {}
    const deleted = new Set(deletedLots);
    const activeLots = lots.filter(l => !deleted.has(l.id));

    // Hide old test data created before Sept 1, 2026 to ensure a clean demo presentation
    const cutoff = new Date('2026-08-30T00:00:00Z').getTime();
    return activeLots.filter(l => {
      const d = new Date(l.createdAt).getTime();
      return isNaN(d) || d > cutoff;
    });
  },
  get: async (token: string, id: string) => toLot(await request<ApiLot>(`/api/v1/farmer/lots/${id}`, token)),
  delete: async (token: string, id: string) => {
    try {
      const deletedLots = JSON.parse(localStorage.getItem('krishimitra_demo_deleted_lots') || '[]');
      if (!deletedLots.includes(id)) {
        localStorage.setItem('krishimitra_demo_deleted_lots', JSON.stringify([...deletedLots, id]));
      }
    } catch(e) {}
    
    const globalLots = JSON.parse(localStorage.getItem('krishimitra_demo_lots_global') || '[]');
    const idx = globalLots.findIndex((l: Lot) => l.id === id);
    if (idx >= 0) {
      globalLots.splice(idx, 1);
      localStorage.setItem('krishimitra_demo_lots_global', JSON.stringify(globalLots));
    }
    try {
      await request(`/api/v1/farmer/lots/${id}`, token, { method: 'DELETE' });
    } catch(e) {
      console.warn('Backend delete failed, relying on local delete', e);
    }
  },
};
