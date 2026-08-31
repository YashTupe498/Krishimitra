import type { Grievance } from '../types/grievance';
import { apiRequest } from './apiClient';

type GrievanceResponse = Omit<Grievance, 'farmerId' | 'createdAt' | 'updatedAt' | 'timeline' | 'resolutionGuidance'> & {
  farmer_id: string;
  created_at: string;
  updated_at: string;
  resolution_guidance: Grievance['resolutionGuidance'];
};

const toGrievance = (item: GrievanceResponse): Grievance => ({
  ...item,
  farmerId: item.farmer_id,
  createdAt: item.created_at,
  updatedAt: item.updated_at,
  resolutionGuidance: item.resolution_guidance,
  timeline: [{
    status: item.status,
    title: item.status.replace(/_/g, ' '),
    description: 'Your grievance is stored securely in KrishiMitra.',
    timestamp: item.updated_at,
    state: 'CURRENT',
  }],
});

export const grievanceDemoService = {
  getGrievances: async (_userId: string): Promise<Grievance[]> =>
    (await apiRequest<GrievanceResponse[]>('/grievances/')).map(toGrievance),

  getGrievanceById: async (id: string, _userId: string): Promise<Grievance | undefined> => {
    try { return toGrievance(await apiRequest<GrievanceResponse>(`/grievances/${id}`)); } catch { return undefined; }
  },

  createGrievance: async (grievance: Omit<Grievance, 'id'>, _userId: string): Promise<Grievance> =>
    toGrievance(await apiRequest<GrievanceResponse>('/grievances/', {
      method: 'POST',
      body: JSON.stringify({
        category: grievance.category, title: grievance.title, description: grievance.description,
        priority: grievance.priority, location: grievance.location, evidence: grievance.evidence,
        classification_summary: grievance.classificationSummary,
        classification_reasons: grievance.classificationReasons, details: grievance.details ?? {},
        resolution_guidance: grievance.resolutionGuidance,
      }),
    })),
};
