import { apiRequest } from './apiClient';
import type { Opportunity } from '../types/opportunity';

type OpportunityResponse = {
  id: string;
  demand_id: string;
  match_score?: number | null;
  match_status: string;
  match_reasons?: string[] | null;
  lot_id: string;
  quantity_matched?: number | null;
  quality_match?: string | null;
  location_match?: string | null;
  payment_match?: string | null;
};

const toOpportunity = (item: OpportunityResponse): Opportunity => ({
  id: item.id,
  buyerDemandId: item.demand_id,
  matchScore: item.match_score ?? 0,
  matchLevel: item.match_status === 'MATCHED' ? 'Strong Match' : item.match_status === 'PARTIAL_MATCH' ? 'Good Match' : 'Fair Match',
  matchReasons: item.match_reasons ?? [],
  constraintWarnings: [],
  cropName: 'Matched produce',
  grade: item.quality_match === 'COMPATIBLE' ? 'Compatible' : 'Pending',
  quantity: item.quantity_matched ?? 0,
  location: item.location_match === 'COMPATIBLE' ? 'Compatible location' : 'Location needs review',
  paymentTerms: item.payment_match ?? 'Not specified',
});

export const opportunitiesApi = {
  list: async (): Promise<Opportunity[]> => (await apiRequest<OpportunityResponse[]>('/farmer/opportunities/')).map(toOpportunity),
  get: async (id: string): Promise<Opportunity> => toOpportunity(await apiRequest<OpportunityResponse>(`/farmer/opportunities/${id}`)),
};
