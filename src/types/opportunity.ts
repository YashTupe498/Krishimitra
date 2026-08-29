export interface BuyerDemand {
  id: string;
  cropName: string;
  grade: string;
  quantity: number;
  location: string;
  paymentTerms: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  createdAt: string;
}

export interface Opportunity {
  id: string;
  buyerDemandId: string;
  matchScore: number;
  matchLevel: 'Strong Match' | 'Good Match' | 'Fair Match';
  matchReasons: string[];
  constraintWarnings: string[];
  
  // Details inherited/copied from BuyerDemand for display
  cropName: string;
  grade: string;
  quantity: number;
  location: string;
  paymentTerms: string;
}
