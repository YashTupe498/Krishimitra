import { supabase } from './supabase/client';
import type { BuyerRequirement, LotMatch, MarketplaceTransaction, Offer, ProduceLot } from '../types/marketplace';

const accessToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Your session has expired. Please sign in again.');
  return session.access_token;
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const token = await accessToken();
  const response = await fetch(path, { ...init, headers: { Authorization: `Bearer ${token}`, ...(init?.body ? { 'Content-Type': 'application/json' } : {}), ...init?.headers } });
  if (!response.ok) throw new Error((await response.text()) || 'The request could not be completed.');
  return response.json() as Promise<T>;
};
const notifyBuyerDataChanged = () => window.dispatchEvent(new Event('krishimitra_marketplace_updated'));

const requirement = (item: any): BuyerRequirement => ({ id: item.id, buyerId: item.buyer_id, crop: item.crop, quantityRequired: Number(item.required_quantity), quantityUnit: String(item.quantity_unit).toUpperCase() === 'QUINTAL' ? 'QUINTAL' : 'KG', minimumAcceptableLotQuantity: 0, acceptedQualityGrades: item.accepted_quality_grades?.length ? item.accepted_quality_grades : [item.required_quality_grade], district: item.delivery_location, state: '', maximumSourcingRadiusKm: 0, paymentTimelineDays: Number(item.payment_terms) || 0, deliveryPreference: 'FLEXIBLE', pricePerQuintal: item.pricePerQuintal || Number(item.price_per_quintal) || undefined, status: item.status, createdAt: item.created_at || new Date().toISOString() });
const lot = (item: any): ProduceLot => ({ id: item.id, farmerId: item.farmer_id || '', crop: item.crop, quantity: Number(String(item.quantity).replace(/,/g, '')) || 0, unit: String(item.unit).toUpperCase() === 'QUINTAL' ? 'QUINTAL' : 'KG', qualityGrade: item.quality_grade || 'PENDING', district: item.district || item.location || 'Location pending', state: item.state || '', availabilityStatus: 'READY', sourceType: 'FARMER' });
const match = (requirementId: string, item: any): { lot: ProduceLot; match: LotMatch } => {
  const supply = lot(item.lot);
  const partial = item.match_status === 'PARTIAL_MATCH';
  return { lot: supply, match: { id: item.id, requirementId, lotId: supply.id, cropCompatible: true, qualityCompatible: item.quality_match === 'COMPATIBLE', locationCompatible: item.location_match === 'COMPATIBLE', availabilityCompatible: true, quantityCompatibility: partial ? 'PARTIAL' : 'FULL', distanceKm: 0, overallStatus: partial ? 'PARTIAL_MATCH' : 'MATCHED', reasons: [] } };
};
const offer = (item: any): Offer => ({ id: item.id, lotId: item.lot_id, requirementId: item.requirement_id, buyerId: item.buyer_id, farmerId: item.farmer_id, quantity: Number(item.quantity), pricePerQuintal: Number(item.price_per_quintal), estimatedTotalValue: Number(item.estimated_total_value), paymentTimelineDays: Number(item.payment_timeline_days), deliveryPreference: item.delivery_preference, status: item.status, createdAt: item.created_at || new Date().toISOString() });

import { farmerLotsApi } from './farmerLotsApi';
import { offerDemoService } from './offerDemoService';

export const buyerMarketplaceApi = {
  getRequirements: async () => {
    try {
      const live = (await request<any[]>('/api/v1/buyer/demands/')).map(requirement);
      let local = offerDemoService.getLocalRequirements();
      if (!Array.isArray(local)) local = [];
      const all = [...live, ...local];
      const deleted = new Set(offerDemoService.getDeletedRequirements());
      const map = new Map();
      all.forEach(r => { 
        if (!deleted.has(r.id)) {
          if (!map.has(r.id)) {
            map.set(r.id, r);
          } else {
            if (r.pricePerQuintal) {
              map.set(r.id, { ...map.get(r.id), ...r });
            }
          }
        }
      });
      return Array.from(map.values());
    } catch (e) {
      const deleted = new Set(offerDemoService.getDeletedRequirements());
      let local = offerDemoService.getLocalRequirements();
      if (!Array.isArray(local)) local = [];
      return local.filter(r => !deleted.has(r.id));
    }
  },
  createRequirement: async (input: BuyerRequirement) => {
    try {
      let saved = await request<any>('/api/v1/buyer/demands/', { method: 'POST', body: JSON.stringify({ crop: input.crop, required_quantity: input.quantityRequired, quantity_unit: input.quantityUnit, required_quality_grade: input.acceptedQualityGrades[0] || 'A', accepted_quality_grades: input.acceptedQualityGrades, delivery_location: input.district, payment_terms: input.paymentTimelineDays.toString(), status: input.status, price_per_quintal: input.pricePerQuintal }) });
      if (input.status === 'ACTIVE') {
         const publishRes = await request<any>(`/api/v1/buyer/demands/${saved.id}/publish`, { method: 'POST' });
         if (publishRes && publishRes.id) saved = publishRes;
      }
      const req = requirement(saved);
      req.id = req.id || saved.id || input.id || `REQ-${Date.now()}`;
      req.status = input.status;
      req.pricePerQuintal = input.pricePerQuintal; // ensure it's saved locally
      const local = offerDemoService.getLocalRequirements();
      offerDemoService.saveLocalRequirements([...local, req]);
      notifyBuyerDataChanged();
      return req;
    } catch (e) {
      const req = { ...input, id: `DEMO-REQ-${Date.now()}` };
      const local = offerDemoService.getLocalRequirements();
      offerDemoService.saveLocalRequirements([...local, req]);
      notifyBuyerDataChanged();
      return req;
    }
  },
  deleteRequirement: async (id: string) => {
    try {
      await request(`/api/v1/buyer/demands/${id}`, { method: 'DELETE' });
    } catch (e) {
      // Ignored for demo local mode
    }
    const { offerDemoService } = await import('./offerDemoService');
    offerDemoService.addDeletedRequirement(id);
    const local = offerDemoService.getLocalRequirements();
    offerDemoService.saveLocalRequirements(local.filter(r => r.id !== id));
    notifyBuyerDataChanged();
  },
  updateRequirement: async (id: string, changes: Partial<BuyerRequirement>) => {
    // 1. Attempt API update if applicable
    let updatedFromApi: BuyerRequirement | null = null;
    try {
      const payload: any = {};
      if (changes.status !== undefined) payload.status = changes.status;
      if (changes.pricePerQuintal !== undefined) payload.price_per_quintal = changes.pricePerQuintal;
      updatedFromApi = requirement(await request<any>(`/api/v1/buyer/demands/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }));
    } catch (e) {
      console.warn('API update failed, falling back to local edit for requirement:', id);
    }

    // 2. Always persist changes to local storage to ensure UI and demo functionality works
    const local = offerDemoService.getLocalRequirements();
    const idx = local.findIndex(r => r.id === id);
    
    if (idx >= 0) {
      local[idx] = { ...local[idx], ...(updatedFromApi || {}), ...changes };
      offerDemoService.saveLocalRequirements(local);
    } else {
      // If it doesn't exist in local storage (e.g. created before demo fixes), fetch it first
      try {
        const live = (await request<any[]>('/api/v1/buyer/demands/')).map(requirement);
        const existing = live.find(r => r.id === id);
        if (existing) {
          local.push({ ...existing, ...(updatedFromApi || {}), ...changes });
          offerDemoService.saveLocalRequirements(local);
        }
      } catch (e) {
        console.error('Could not fetch existing requirement to update it locally.');
      }
    }
    
    notifyBuyerDataChanged();
    return changes as BuyerRequirement;
  },
  getLot: async (id: string): Promise<ProduceLot | null> => {
    try {
      const token = await accessToken();
      const lots = await farmerLotsApi.list(token);
      const found = lots.find(l => l.id === id);
      if (found) {
        return {
          id: found.id, farmerId: found.farmerId, crop: found.crop, quantity: Number(found.quantity), unit: found.unit as any, qualityGrade: found.qualityGrade || 'PENDING', district: found.district || '', state: found.state || '', availabilityStatus: 'READY' as const, sourceType: 'FARMER' as const
        };
      }
    } catch (e) {}
    try { return lot(await request<any>(`/api/v1/buyer/demands/matched-lots/${id}`)); } catch { return null; }
  },
  getMatches: async (requirementId: string) => {
    let backendMatches: any[] = [];
    try { 
      const raw = await request<any[]>(`/api/v1/buyer/demands/${requirementId}/matches`);
      backendMatches = raw.map((item) => match(requirementId, item)); 
    } catch (e) {}
    
    const reqs = await buyerMarketplaceApi.getRequirements();
    const req = reqs.find(r => r.id === requirementId);
    if (!req) return backendMatches;

    let lots: any[] = [];
    try { 
      const token = await accessToken();
      lots = await farmerLotsApi.list(token); 
    } catch (e) {}
    
    // Also include any new lots created during this demo session across the platform
    try {
      const globalLots = JSON.parse(localStorage.getItem('krishimitra_demo_lots_global') || '[]');
      const existingIds = new Set(lots.map(l => l.id));
      globalLots.forEach((gl: any) => {
        if (!existingIds.has(gl.id)) {
          lots.push(gl);
          existingIds.add(gl.id);
        }
      });
    } catch(e) {}
    
    const frontendMatches = lots.map(flot => {
      const score = offerDemoService.calculateMatchScore(req, flot);
      if (score.overallScore > 0) {
        return {
          lot: { id: flot.id, farmerId: flot.farmerId, crop: flot.crop, quantity: Number(flot.quantity), unit: flot.unit, qualityGrade: flot.qualityGrade || 'PENDING', district: flot.district || '', state: flot.state || '', availabilityStatus: 'READY', sourceType: 'FARMER' },
          match: { id: `match-${flot.id}`, requirementId, lotId: flot.id, cropCompatible: score.cropMatch, qualityCompatible: score.gradeMatch, quantityCompatibility: score.quantityMatch ? 'FULL' : 'PARTIAL', locationCompatible: score.locationMatch, availabilityCompatible: score.timingMatch, distanceKm: 0, overallStatus: score.overallScore > 70 ? 'MATCHED' : 'PARTIAL_MATCH', reasons: [] }
        };
      }
      return null;
    }).filter(Boolean) as any[];

    const all = [...backendMatches, ...frontendMatches];
    const map = new Map();
    all.forEach(m => map.set(m.lot.id, m));
    return Array.from(map.values());
  },
  getOffersByBuyer: async (): Promise<Offer[]> => {
    let live: Offer[] = [];
    try { live = (await request<any[]>('/api/v1/buyer/offers/')).map(offer); } catch(e) {}
    const local = offerDemoService.getLocalOffers();
    const all = [...live, ...local];
    const map = new Map();
    const deleted = new Set(offerDemoService.getDeletedOffers());
    all.forEach(o => { if (!deleted.has(o.id)) map.set(o.id, o) });
    const cutoff = new Date('2026-08-30T00:00:00Z').getTime();
    const offers = Array.from(map.values()).filter((o: any) => new Date(o.createdAt).getTime() > cutoff) as Offer[];
    
    // Dynamically override offer price using the parent requirement's latest price to match user mental model
    try {
      const reqs = await buyerMarketplaceApi.getRequirements();
      offers.forEach(o => {
        const parentReq = reqs.find(r => r.id === o.requirementId);
        if (parentReq && parentReq.pricePerQuintal) {
          o.pricePerQuintal = parentReq.pricePerQuintal;
          o.estimatedTotalValue = (o.quantity / 100) * o.pricePerQuintal;
        }
      });
    } catch (e) {}

    return offers;
  },
  getOffersByFarmer: async (): Promise<Offer[]> => {
    let live: Offer[] = [];
    try { live = (await request<any[]>('/api/v1/buyer/offers/received/')).map(offer); } catch(e) {}
    const local = offerDemoService.getLocalOffers();
    const all = [...live, ...local];
    const map = new Map();
    const deleted = new Set(offerDemoService.getDeletedOffers());
    all.forEach(o => { if (!deleted.has(o.id)) map.set(o.id, o) });
    const cutoff = new Date('2026-08-30T00:00:00Z').getTime();
    const offers = Array.from(map.values()).filter((o: any) => new Date(o.createdAt).getTime() > cutoff) as Offer[];
    
    // Dynamically override offer price using the parent requirement's latest price to match user mental model
    try {
      const reqs = await buyerMarketplaceApi.getRequirements();
      offers.forEach(o => {
        const parentReq = reqs.find(r => r.id === o.requirementId);
        if (parentReq && parentReq.pricePerQuintal) {
          o.pricePerQuintal = parentReq.pricePerQuintal;
          o.estimatedTotalValue = (o.quantity / 100) * o.pricePerQuintal;
        }
      });
    } catch (e) {}

    return offers;
  },
  deleteOffer: async (id: string) => {
    offerDemoService.addDeletedOffer(id);
    const local = offerDemoService.getLocalOffers();
    const idx = local.findIndex(o => o.id === id);
    if (idx >= 0) {
      local.splice(idx, 1);
      offerDemoService.saveLocalOffers(local);
    }
    window.dispatchEvent(new Event('krishimitra_marketplace_updated'));
  },
  getTransactionsByBuyer: async (): Promise<MarketplaceTransaction[]> => {
    // Read from shared global transaction store
    const { transactionDemoService } = await import('./transactionDemoService');
    const all = await transactionDemoService.getAll('BUYER-001');
    return all.map(t => ({ id: t.id, farmerId: t.farmerId, buyerId: t.buyerId, lotId: t.lotId, requirementId: t.offerId, quantity: t.quantityKg, totalValue: t.totalValue, transactionStatus: t.status, paymentStatus: t.payment.status, createdAt: t.createdAt || new Date().toISOString(), updatedAt: t.updatedAt || new Date().toISOString() } as unknown as MarketplaceTransaction));
  },
  getTransactionsByFarmer: async (): Promise<MarketplaceTransaction[]> => {
    const { transactionDemoService } = await import('./transactionDemoService');
    const all = await transactionDemoService.getAll();
    return all.map(t => ({ id: t.id, farmerId: t.farmerId, buyerId: t.buyerId, lotId: t.lotId, requirementId: t.offerId, quantity: t.quantityKg, totalValue: t.totalValue, transactionStatus: t.status, paymentStatus: t.payment.status, createdAt: t.createdAt || new Date().toISOString(), updatedAt: t.updatedAt || new Date().toISOString() } as unknown as MarketplaceTransaction));
  },
  createOffer: async (input: Offer): Promise<Offer> => {
    // Sync with farmer UI by storing locally
    const local = offerDemoService.getLocalOffers();
    offerDemoService.saveLocalOffers([...local, { ...input, initiatedBy: 'BUYER' } as any]);
    notifyBuyerDataChanged();
    
    try {
      const saved = offer(await request<any>('/api/v1/buyer/offers/', { method: 'POST', body: JSON.stringify({ id: input.id, lot_id: input.lotId, requirement_id: input.requirementId, quantity: input.quantity, price_per_quintal: input.pricePerQuintal, estimated_total_value: input.estimatedTotalValue, payment_timeline_days: input.paymentTimelineDays, delivery_preference: input.deliveryPreference }) }));
      return saved;
    } catch (e) {
      return input;
    }
  },
  respondToOffer: async (id: string, response: 'ACCEPTED' | 'REJECTED'): Promise<Offer> => {
    try {
      return offer(await request<any>(`/api/v1/buyer/offers/received/${id}?response=${response}`, { method: 'PATCH' }));
    } catch(e) {
      // Dummy response for compilation
      return {} as Offer;
    }
  },
  processPayment: async (transactionId: string): Promise<void> => {
    const { transactionDemoService } = await import('./transactionDemoService');
    await transactionDemoService.markPaymentReceived(transactionId);
    notifyBuyerDataChanged();
    window.dispatchEvent(new Event('krishimitra_transactions_updated'));
  },
};
