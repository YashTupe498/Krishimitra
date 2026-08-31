/**
 * Extended Transaction Types for KrishiMitra Demo Lifecycle
 * These extend the existing marketplace.ts types without modifying them.
 */

export type TxStatus =
  | 'OFFER_ACCEPTED'
  | 'QUALITY_PENDING'
  | 'QUALITY_VERIFIED'
  | 'LOGISTICS_PENDING'
  | 'LOGISTICS_CONFIRMED'
  | 'READY_FOR_DISPATCH'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_INITIATED'
  | 'PAYMENT_RECEIVED'
  | 'COMPLETED'
  | 'DISPUTE';

export type PaymentStatus =
  | 'NOT_APPLICABLE'
  | 'PENDING'
  | 'INITIATED'
  | 'PARTIALLY_PAID'
  | 'RECEIVED'
  | 'DISPUTED';

export interface TxLogisticsInfo {
  pickupLocation: string;
  destination: string;
  transportProvider?: string;
  vehicle?: string;
  expectedPickup?: string;
  expectedDelivery?: string;
  estimatedCostRs?: number;
  actualCostRs?: number;
  status: 'NOT_PLANNED' | 'PLANNED' | 'IN_TRANSIT' | 'DELIVERED';
}

export interface TxPaymentInfo {
  totalValue: number;
  amountPaid: number;
  amountRemaining: number;
  status: PaymentStatus;
  method?: string;
  reference?: string;
  paidAt?: string;
  dueDate?: string;
}

export interface TxQualityInfo {
  grade: 'A' | 'B' | 'C' | 'PENDING';
  verified: boolean;
  verifiedAt?: string;
  moisture?: string;
  size?: string;
  damagePct?: string;
  packaging?: string;
  notes?: string;
}

export interface TxTimelineEvent {
  status: TxStatus;
  label: string;
  timestamp?: string;
  state: 'COMPLETED' | 'CURRENT' | 'PENDING' | 'SKIPPED';
  note?: string;
}

export interface DemoTransaction {
  /** e.g. TM-2026-004281 */
  id: string;
  /** Links to an Offer */
  offerId: string;
  /** Links to a Lot */
  lotId: string;
  farmerId: string;
  
  // Produce
  crop: string;
  quantityKg: number;
  grade: 'A' | 'B' | 'C' | 'PENDING';
  
  // Buyer (demo — verified label only if set to true)
  buyerName: string;
  buyerId: string;
  buyerLocation: string;
  buyerVerified: boolean;
  
  // Market reference
  marketName: string;
  marketPricePerQ?: number; // reference price from Market Intelligence
  
  // Finance
  agreedPricePerQ: number;
  totalValue: number;
  transportCostRs?: number;
  netRealizationRs?: number;
  
  // Status
  status: TxStatus;
  payment: TxPaymentInfo;
  quality: TxQualityInfo;
  logistics?: TxLogisticsInfo;
  
  // Timeline
  timeline: TxTimelineEvent[];
  
  // Dispute
  grievanceId?: string;
  
  // Dates
  offerAcceptedAt: string;
  createdAt: string;
  updatedAt: string;
  
  isDemo: boolean;
}
