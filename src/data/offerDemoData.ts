import type { BuyerRequirement, Offer } from '../types/marketplace';

export const DEMO_BUYER_REQUIREMENTS: BuyerRequirement[] = [
  {
    id: 'DEMO-REQ-001',
    buyerId: 'buyer-nashik-fresh',
    crop: 'Onion',
    quantityRequired: 500,
    quantityUnit: 'KG',
    minimumAcceptableLotQuantity: 100,
    acceptedQualityGrades: ['A'],
    district: 'Nashik',
    state: 'Maharashtra',
    maximumSourcingRadiusKm: 50,
    paymentTimelineDays: 3,
    deliveryPreference: 'FLEXIBLE',
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
  },
  {
    id: 'DEMO-REQ-002',
    buyerId: 'buyer-maha-agro',
    crop: 'Tomato',
    quantityRequired: 1000,
    quantityUnit: 'KG',
    minimumAcceptableLotQuantity: 500,
    acceptedQualityGrades: ['A', 'B'],
    district: 'Pune',
    state: 'Maharashtra',
    maximumSourcingRadiusKm: 100,
    paymentTimelineDays: 0, // Immediate
    deliveryPreference: 'SELLER_DELIVERY',
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'DEMO-REQ-003',
    buyerId: 'buyer-premium-exports',
    crop: 'Pomegranate',
    quantityRequired: 200,
    quantityUnit: 'QUINTAL',
    minimumAcceptableLotQuantity: 50,
    acceptedQualityGrades: ['A'],
    district: 'Solapur',
    state: 'Maharashtra',
    maximumSourcingRadiusKm: 200,
    paymentTimelineDays: 7,
    deliveryPreference: 'BUYER_PICKUP',
    status: 'EXPIRED',
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
  }
];

export const DEMO_OFFERS: Offer[] = [
  {
    id: 'DEMO-OFF-001',
    lotId: 'demo-lot-1',
    requirementId: 'DEMO-REQ-001',
    buyerId: 'buyer-nashik-fresh',
    farmerId: 'demo-farmer-id',
    quantity: 500,
    pricePerQuintal: 4350,
    estimatedTotalValue: 21750,
    paymentTimelineDays: 3,
    deliveryPreference: 'FLEXIBLE',
    status: 'SENT', // Farmer sent it, pending buyer response
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'DEMO-OFF-002',
    lotId: 'demo-lot-2',
    requirementId: 'DEMO-REQ-002',
    buyerId: 'buyer-maha-agro',
    farmerId: 'demo-farmer-id',
    quantity: 800,
    pricePerQuintal: 2100,
    estimatedTotalValue: 16800,
    paymentTimelineDays: 0,
    deliveryPreference: 'SELLER_DELIVERY',
    status: 'REJECTED',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  }
];

export const DEMO_BUYER_PROFILES: Record<string, { name: string; verified: boolean; type: string }> = {
  'buyer-nashik-fresh': { name: 'Nashik Fresh Foods Pvt. Ltd.', verified: true, type: 'Processor' },
  'buyer-maha-agro': { name: 'Maharashtra Agro Traders', verified: true, type: 'Wholesaler' },
  'buyer-premium-exports': { name: 'Premium Exports Ltd.', verified: false, type: 'Exporter' },
};
