export type LotStatus = 
  | 'DRAFT'
  | 'QUALITY_PENDING'
  | 'MARKET_ANALYSIS_READY'
  | 'DECISION_READY'
  | 'OFFER_RECEIVED'
  | 'TRANSACTION_ACTIVE'
  | 'COMPLETED';

export interface FarmerConstraints {
  paymentRequirement: string;
  transportCapability: string;
  storageCapability: string;
}

export interface QualityAssessmentResponse {
  crop: string;
  grade: 'A' | 'B' | 'C' | null;
  confidence: number | null;
  observations: string[];
  quality_adjustment_type?: 'PREMIUM' | 'DISCOUNT' | 'NONE';
  quality_adjustment_value?: number;
  assessment_mode: 'prototype_demo' | 'rule_based' | 'ml_model';
}

export interface BuyerQualityRequirement {
  buyer_id: string;
  crop: string;
  accepted_quality_grades: ('A' | 'B' | 'C')[];
}

export interface Lot {
  id: string;
  farmerId: string;
  crop: string;
  quantity: string;
  unit: string;
  location: string;
  village?: string;
  taluka?: string;
  district?: string;
  state?: string;
  status: LotStatus;
  qualityGrade: 'A' | 'B' | 'C' | null;
  qualityAssessment: QualityAssessmentResponse | null;
  constraints: FarmerConstraints;
  createdAt: string;
  updatedAt: string;
  
  // Display associations
  activeDecisionId?: string;
  activeOfferId?: string;
  activeTransactionId?: string;
}
