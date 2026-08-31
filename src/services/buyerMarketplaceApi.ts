import { apiRequest } from './apiClient';
import type { BuyerRequirement, LotMatch, MarketplaceTransaction, Offer, ProduceLot } from '../types/marketplace';

const notifyBuyerDataChanged = () => window.dispatchEvent(new Event('krishimitra_marketplace_updated'));

const requirement = (item: any): BuyerRequirement => ({ id: item.id, buyerId: item.buyer_id, crop: item.crop, quantityRequired: Number(item.required_quantity), quantityUnit: String(item.quantity_unit).toUpperCase() === 'QUINTAL' ? 'QUINTAL' : 'KG', minimumAcceptableLotQuantity: 0, acceptedQualityGrades: item.accepted_quality_grades?.length ? item.accepted_quality_grades : [item.required_quality_grade], district: item.delivery_location, state: '', maximumSourcingRadiusKm: 0, paymentTimelineDays: Number(item.payment_terms) || 0, deliveryPreference: 'FLEXIBLE', status: item.status, createdAt: item.created_at || new Date().toISOString() });
const lot = (item: any): ProduceLot => ({ id: item.id, farmerId: item.farmer_id || '', crop: item.crop, quantity: Number(String(item.quantity).replace(/,/g, '')) || 0, unit: String(item.unit).toUpperCase() === 'QUINTAL' ? 'QUINTAL' : 'KG', qualityGrade: item.quality_grade || 'PENDING', district: item.district || item.location || 'Location pending', state: item.state || '', availabilityStatus: 'READY', sourceType: 'FARMER' });
const match = (requirementId: string, item: any): { lot: ProduceLot; match: LotMatch } => {
  const supply = lot(item.lot);
  const partial = item.match_status === 'PARTIAL_MATCH';
  return { lot: supply, match: { id: item.id, requirementId, lotId: supply.id, cropCompatible: true, qualityCompatible: item.quality_match === 'COMPATIBLE', locationCompatible: item.location_match === 'COMPATIBLE', availabilityCompatible: true, quantityCompatibility: partial ? 'PARTIAL' : 'FULL', distanceKm: 0, overallStatus: partial ? 'PARTIAL_MATCH' : 'MATCHED', reasons: [] } };
};
const offer = (item: any): Offer => ({ id: item.id, lotId: item.lot_id, requirementId: item.requirement_id, buyerId: item.buyer_id, farmerId: item.farmer_id, quantity: Number(item.quantity), pricePerQuintal: Number(item.price_per_quintal), estimatedTotalValue: Number(item.estimated_total_value), paymentTimelineDays: Number(item.payment_timeline_days), deliveryPreference: item.delivery_preference, status: item.status, createdAt: item.created_at || new Date().toISOString() });

export const buyerMarketplaceApi = {
  getRequirements: async () => (await apiRequest<unknown[]>('/buyer/demands/')).map(requirement),
  createRequirement: async (input: BuyerRequirement) => {
    let saved = await apiRequest<any>('/buyer/demands/', { method: 'POST', body: JSON.stringify({ crop: input.crop, required_quantity: input.quantityRequired, quantity_unit: input.quantityUnit, required_quality_grade: input.acceptedQualityGrades[0] || 'A', accepted_quality_grades: input.acceptedQualityGrades, delivery_location: input.district, payment_terms: input.paymentTimelineDays.toString(), status: input.status }) });
    if (input.status === 'ACTIVE') saved = await apiRequest(`/buyer/demands/${saved.id}/publish`, { method: 'POST' });
    notifyBuyerDataChanged();
    return requirement(saved);
  },
  updateRequirement: async (id: string, changes: Partial<BuyerRequirement>) => {
    const updated = requirement(await apiRequest<any>(`/buyer/demands/${id}`, { method: 'PATCH', body: JSON.stringify({ status: changes.status }) }));
    notifyBuyerDataChanged();
    return updated;
  },
  getLot: async (id: string): Promise<ProduceLot | null> => {
    try { return lot(await apiRequest<any>(`/buyer/demands/matched-lots/${id}`)); } catch { return null; }
  },
  getMatches: async (requirementId: string) => (await apiRequest<any[]>(`/buyer/demands/${requirementId}/matches`)).map((item) => match(requirementId, item)),
  getOffersByBuyer: async (): Promise<Offer[]> => (await apiRequest<any[]>('/buyer/offers/')).map(offer),
  getOffersByFarmer: async (): Promise<Offer[]> => (await apiRequest<any[]>('/buyer/offers/received/')).map(offer),
  getTransactionsByBuyer: async (): Promise<MarketplaceTransaction[]> => apiRequest<MarketplaceTransaction[]>('/transactions/'),
  getTransactionsByFarmer: async (): Promise<MarketplaceTransaction[]> => apiRequest<MarketplaceTransaction[]>('/transactions/'),
  createOffer: async (input: Offer): Promise<Offer> => {
    const saved = offer(await apiRequest<any>('/buyer/offers/', { method: 'POST', body: JSON.stringify({ id: input.id, lot_id: input.lotId, requirement_id: input.requirementId, quantity: input.quantity, price_per_quintal: input.pricePerQuintal, estimated_total_value: input.estimatedTotalValue, payment_timeline_days: input.paymentTimelineDays, delivery_preference: input.deliveryPreference }) }));
    notifyBuyerDataChanged();
    return saved;
  },
  respondToOffer: async (id: string, response: 'ACCEPTED' | 'REJECTED'): Promise<Offer> => offer(await apiRequest<any>(`/buyer/offers/received/${id}?response=${response}`, { method: 'PATCH' })),
};
