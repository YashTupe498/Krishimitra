export type GrievanceCategory = 
  | 'CROP' 
  | 'MARKET' 
  | 'BUYER' 
  | 'PAYMENT' 
  | 'GOVERNMENT_SCHEME' 
  | 'LOGISTICS' 
  | 'INPUTS' 
  | 'IRRIGATION' 
  | 'PEST_DISEASE' 
  | 'OTHER';

export type GrievancePriority = 'HIGH' | 'MEDIUM' | 'LOW';

export type GrievanceStatus = 
  | 'SUBMITTED' 
  | 'REGISTERED' 
  | 'UNDER_REVIEW' 
  | 'IN_PROGRESS' 
  | 'RESOLVED';

export interface TimelineEvent {
  status: GrievanceStatus;
  title: string;
  description: string;
  timestamp: string;
  state: 'COMPLETED' | 'CURRENT' | 'PENDING';
}

export interface Grievance {
  id: string;
  farmerId: string;
  category: GrievanceCategory;
  title: string;
  description: string;
  priority: GrievancePriority;
  status: GrievanceStatus;
  location: string;
  createdAt: string;
  updatedAt: string;
  evidence: string[]; // File names for demo purposes
  
  // AI-assisted assessment
  classificationSummary: string;
  classificationReasons: string[]; // E.g. "Why HIGH?"
  
  timeline: TimelineEvent[];
  
  resolutionGuidance: {
    whatHappened: string;
    why: string;
    whatToDo: string;
    recommendedAction: string;
    resolutionChannel?: string;
  };
  
  // Category-specific dynamic details
  details?: Record<string, any>;
}
