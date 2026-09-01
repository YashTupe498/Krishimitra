import { buyerMarketplaceApi } from './buyerMarketplaceApi';
import { farmerLotsApi } from './farmerLotsApi';
import { DEMO_OFFERS, DEMO_BUYER_PROFILES } from '../data/offerDemoData';
import type { BuyerRequirement, Offer } from '../types/marketplace';
import type { Lot } from '../types/lot';
import { transactionDemoService } from './transactionDemoService';

export type MatchScoreDetails = {
  cropMatch: boolean;
  gradeMatch: boolean;
  quantityMatch: boolean;
  locationMatch: boolean;
  timingMatch: boolean;
  overallScore: number;
};

export type BuyerOpportunity = {
  requirement: BuyerRequirement;
  matchedLot: Lot;
  matchScore: MatchScoreDetails;
  buyerProfile: { name: string; verified: boolean; type: string };
  isDemo: boolean;
};

export type AugmentedOffer = Offer & {
  buyerProfile: { name: string; verified: boolean; type: string };
  requirement?: BuyerRequirement;
  isDemo: boolean;
  paymentStatus?: string;
  paymentReference?: string;
  paymentAmount?: number;
};

const STORAGE_KEY_OFFERS = 'farmer_demo_offers';
const STORAGE_KEY_REQS = 'krishimitra_demo_requirements';

export const offerDemoService = {
  // Helpers to get/set local state
  getLocalOffers: (): Offer[] => {
    const data = localStorage.getItem(STORAGE_KEY_OFFERS);
    return data ? JSON.parse(data) : [];
  },
  
  saveLocalOffers: (offers: Offer[]) => {
    localStorage.setItem(STORAGE_KEY_OFFERS, JSON.stringify(offers));
    window.dispatchEvent(new Event('krishimitra_offers_updated'));
  },

  getLocalRequirements: (): BuyerRequirement[] => {
    const data = localStorage.getItem(STORAGE_KEY_REQS);
    return data ? JSON.parse(data) : [];
  },

  saveLocalRequirements: (reqs: BuyerRequirement[]) => {
    localStorage.setItem('krishimitra_demo_requirements', JSON.stringify(reqs));
    window.dispatchEvent(new Event('krishimitra_offers_updated'));
  },
  getDeletedRequirements: (): string[] => {
    const raw = localStorage.getItem('krishimitra_demo_deleted_requirements');
    return raw ? JSON.parse(raw) : [];
  },
  addDeletedRequirement: (id: string) => {
    const deleted = offerDemoService.getDeletedRequirements();
    if (!deleted.includes(id)) {
      localStorage.setItem('krishimitra_demo_deleted_requirements', JSON.stringify([...deleted, id]));
    }
  },
  getDeletedOffers: (): string[] => {
    const raw = localStorage.getItem('krishimitra_demo_deleted_offers');
    return raw ? JSON.parse(raw) : [];
  },
  addDeletedOffer: (id: string) => {
    const deleted = offerDemoService.getDeletedOffers();
    if (!deleted.includes(id)) {
      localStorage.setItem('krishimitra_demo_deleted_offers', JSON.stringify([...deleted, id]));
    }
  },
  getDeletedLots: (): string[] => {
    const raw = localStorage.getItem('krishimitra_demo_deleted_lots');
    return raw ? JSON.parse(raw) : [];
  },
  addDeletedLot: (id: string) => {
    const deleted = offerDemoService.getDeletedLots();
    if (!deleted.includes(id)) {
      localStorage.setItem('krishimitra_demo_deleted_lots', JSON.stringify([...deleted, id]));
    }
  },

  getBuyerProfile: (buyerId: string) => {
    if (buyerId.length > 15 && !buyerId.startsWith('BUYER-') && !buyerId.startsWith('demo-')) {
       // Force backend-generated UUIDs to look like the hardcoded buyer for demo consistency
       return { name: `Buyer BUYER-`, verified: false, type: 'Buyer' };
    }
    return DEMO_BUYER_PROFILES[buyerId] || { name: `Buyer ${buyerId.substring(0, 6).toUpperCase()}-`, verified: false, type: 'Buyer' };
  },

  // 1. Fetch and deduplicate requirements
  getNormalizedRequirements: async (): Promise<BuyerRequirement[]> => {
    try {
      const liveReqs = await buyerMarketplaceApi.getRequirements();
      let localReqs = offerDemoService.getLocalRequirements();
      // Ensure local requirements have a valid status, defaulting to ACTIVE if missing due to publish endpoint returning a non-standard response
      localReqs = localReqs.map(r => ({ ...r, status: r.status || 'ACTIVE' }));
      
      const allReqs = [...liveReqs, ...localReqs];
      // Hide old test data created before Sept 1, 2026
      const cutoff = new Date('2026-08-30T00:00:00Z').getTime();
      const filteredReqs = allReqs.filter(r => {
        const d = new Date(r.createdAt).getTime();
        return isNaN(d) || d > cutoff;
      });

      // Deduplicate by ID and prefer local versions as they may have unsynced properties like pricePerQuintal
      const map = new Map<string, BuyerRequirement>();
      filteredReqs.forEach(req => {
        if (!map.has(req.id)) {
          map.set(req.id, req);
        } else {
          // If already exists (e.g. from liveReqs), and the new one (from localReqs) has a price, overwrite it
          if (req.pricePerQuintal) {
            map.set(req.id, { ...map.get(req.id)!, ...req });
          }
        }
      });
      return Array.from(map.values()).filter(r => r.status === 'ACTIVE');
    } catch (e) {
      console.error('Failed to fetch live requirements, using local data', e);
      const localReqs = offerDemoService.getLocalRequirements();
      return localReqs.filter(r => r.status === 'ACTIVE');
    }
  },

  // 2. Fetch and deduplicate offers
  getNormalizedOffers: async (farmerId: string): Promise<AugmentedOffer[]> => {
    let liveOffers: Offer[] = [];
    try {
      liveOffers = await buyerMarketplaceApi.getOffersByFarmer();
    } catch (e) {
      console.warn('Live offers fetch failed, using local/demo data');
    }
    const localOffers = offerDemoService.getLocalOffers();
    const allOffers = [...liveOffers, ...localOffers];
    const reqs = await offerDemoService.getNormalizedRequirements();
    const transactions = await transactionDemoService.getAll(farmerId);
    
    // Deduplicate
    const map = new Map<string, AugmentedOffer>();
    allOffers.forEach(off => {
      if (!map.has(off.id) && (off.farmerId === farmerId || farmerId === 'demo-farmer-id' || off.farmerId === 'demo-farmer-id')) {
        let displayStatus = off.status;
        if (off.status === 'SENT' && ((off as any).initiatedBy === 'BUYER' || off.buyerId === 'BUYER-001')) {
          displayStatus = 'RECEIVED';
        }
        
        const tx = transactions.find(t => t.offerId === off.id);
        
        map.set(off.id, {
          ...off,
          status: displayStatus,
          buyerProfile: offerDemoService.getBuyerProfile(off.buyerId),
          requirement: reqs.find(r => r.id === off.requirementId),
          isDemo: (off as any).isDemo || false,
          paymentStatus: tx?.payment?.status,
          paymentReference: tx?.payment?.reference,
          paymentAmount: tx?.payment?.amountPaid,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  // 3. Match Engine
  calculateMatchScore: (req: BuyerRequirement, lot: Lot): MatchScoreDetails => {
    let score = 0;
    
    // Crop: 30%
    const cropMatch = (req.crop?.trim().toLowerCase() || '') === (lot.crop?.trim().toLowerCase() || '');
    if (cropMatch) score += 30;

    // Grade: 20%
    const gradeMatch = cropMatch && (req.acceptedQualityGrades.includes(lot.qualityGrade as any) || (!lot.qualityGrade));
    if (gradeMatch) score += 20;

    // Quantity: 20% (If lot quantity is >= requirement min acceptable)
    let lotQtyKg = Number(lot.quantity);
    if (lot.unit === 'Quintal' || lot.unit === 'QUINTAL') lotQtyKg *= 100;
    
    let reqQtyKg = req.quantityRequired;
    if (req.quantityUnit === 'QUINTAL') reqQtyKg *= 100;
    let reqMinQtyKg = req.minimumAcceptableLotQuantity;
    if (req.quantityUnit === 'QUINTAL') reqMinQtyKg *= 100;

    const quantityMatch = cropMatch && lotQtyKg >= reqMinQtyKg;
    if (quantityMatch) score += 20;

    // Location: 15% (simplified for demo: matching state/district)
    const locationMatch = cropMatch && (lot.district?.trim().toLowerCase() === req.district?.trim().toLowerCase() || lot.state?.trim().toLowerCase() === req.state?.trim().toLowerCase() || !req.district?.trim());
    if (locationMatch) score += 15;

    // Timing: 15%
    const timingMatch = cropMatch && (lot.status === 'MARKET_ANALYSIS_READY' || lot.status === 'DECISION_READY');
    if (timingMatch) score += 15;

    return {
      cropMatch,
      gradeMatch,
      quantityMatch,
      locationMatch,
      timingMatch,
      overallScore: score
    };
  },

  getBuyerOpportunities: async (token: string, _farmerId: string): Promise<BuyerOpportunity[]> => {
    // 1. Get farmer lots
    let lots: Lot[] = [];
    try {
      lots = await farmerLotsApi.list(token);
    } catch (e) {
      console.warn('Failed to fetch farmer lots', e);
    }

    if (!lots || lots.length === 0) return [];

    // 2. Get requirements
    const reqs = await offerDemoService.getNormalizedRequirements();

    // 3. Match
    const opportunities: BuyerOpportunity[] = [];
    
    reqs.forEach(req => {
      // Find the best lot for this requirement
      let bestLot: Lot | null = null;
      let bestScore: MatchScoreDetails | null = null;

      lots.forEach(lot => {
        const score = offerDemoService.calculateMatchScore(req, lot);
        if (score.overallScore > 0) { // Lowered to 0 for demo reliability
          if (!bestScore || score.overallScore > bestScore.overallScore) {
            bestScore = score;
            bestLot = lot;
          }
        }
      });

      if (bestLot && bestScore) {
        opportunities.push({
          requirement: req,
          matchedLot: bestLot,
          matchScore: bestScore,
          buyerProfile: offerDemoService.getBuyerProfile(req.buyerId),
          isDemo: false // Synced requirements are real user data, not static demos
        });
      }
    });

    const sorted = opportunities.sort((a, b) => b.matchScore.overallScore - a.matchScore.overallScore);
    
    // Inject exactly one static demo opportunity as requested
    const staticDemoOpp: BuyerOpportunity = {
      requirement: {
        id: 'STATIC-DEMO-REQ-1',
        buyerId: 'demo-buyer-static',
        crop: 'Onion',
        quantityRequired: 100,
        quantityUnit: 'KG',
        minimumAcceptableLotQuantity: 50,
        acceptedQualityGrades: ['A'],
        district: 'Nashik',
        state: 'Maharashtra',
        maximumSourcingRadiusKm: 50,
        paymentTimelineDays: 3,
        deliveryPreference: 'FLEXIBLE',
        pricePerQuintal: 4350,
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      },
      matchedLot: lots[0] || { id: 'demo-lot-fallback', crop: 'Onion', quantity: 100, unit: 'KG' } as any,
      matchScore: { cropMatch: true, gradeMatch: true, quantityMatch: true, locationMatch: false, timingMatch: true, overallScore: 85 },
      buyerProfile: { name: 'Buyer c2fecf', verified: false, type: 'Buyer' },
      isDemo: true
    };
    
    return [staticDemoOpp, ...sorted];
  },

  // 4. Create an offer (Farmer responding to a requirement)
  submitOffer: async (offerInput: Omit<Offer, 'id' | 'createdAt' | 'status'>): Promise<Offer> => {
    const newOffer: Offer = {
      ...offerInput,
      id: `OFF-${new Date().getFullYear()}-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
      status: 'SENT',
      createdAt: new Date().toISOString(),
    };

    // Save to local storage for demo traceability
    const local = offerDemoService.getLocalOffers();
    offerDemoService.saveLocalOffers([...local, newOffer]);

    return newOffer;
  },

  // 5. Accept an incoming offer and create a transaction
  acceptReceivedOffer: async (offerId: string): Promise<void> => {
    const local = offerDemoService.getLocalOffers();
    const all = [...DEMO_OFFERS, ...local];
    const offer = all.find(o => o.id === offerId);
    
    if (offer) {
      // 1. Mark accepted
      offer.status = 'ACCEPTED';
      offerDemoService.saveLocalOffers([...local.filter(o => o.id !== offerId), offer]);

      // 2. Spawn transaction using transactionDemoService
      const reqs = await offerDemoService.getNormalizedRequirements();
      const req = reqs.find(r => r.id === offer.requirementId);
      const buyer = offerDemoService.getBuyerProfile(offer.buyerId);

      // Create transaction via transactionDemoService
      const existingTxs = await transactionDemoService.getAll();
      
      const newTxId = `TM-${new Date().getFullYear()}-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
      
      const newTx = {
        id: newTxId,
        date: new Date().toISOString(),
        crop: req?.crop || 'Crop',
        quantityKg: offer.quantity,
        grade: req?.acceptedQualityGrades[0] || 'A',
        totalValue: offer.estimatedTotalValue,
        agreedPricePerQ: offer.pricePerQuintal,
        marketPricePerQ: offer.pricePerQuintal - 100, // Demo diff
        status: 'PAYMENT_PENDING' as const,
        buyerName: buyer.name,
        buyerVerified: buyer.verified,
        buyerId: offer.buyerId,
        farmerId: offer.farmerId,
        offerId: offer.id,
        lotId: offer.lotId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        payment: {
          status: 'PENDING',
          totalValue: offer.estimatedTotalValue,
          amountPaid: 0,
          amountRemaining: offer.estimatedTotalValue,
          dueDate: new Date(Date.now() + 86400000 * (offer.paymentTimelineDays || 3)).toISOString()
        },
        timeline: [
          { status: 'OFFER_ACCEPTED', label: 'Offer Accepted', timestamp: new Date().toISOString(), state: 'COMPLETED' },
          { status: 'DELIVERED', label: 'Delivered', timestamp: new Date().toISOString(), state: 'COMPLETED' },
          { status: 'PAYMENT_PENDING', label: 'Payment Due', timestamp: new Date().toISOString(), state: 'CURRENT' },
          { status: 'PAYMENT_RECEIVED', label: 'Payment Received', state: 'PENDING' },
          { status: 'COMPLETED', label: 'Completed', state: 'PENDING' },
        ],
        isDemo: true
      } as any; // Type override since DemoTransaction expects more fields but transactionDemoService provides fallbacks

      const txs = [...existingTxs, newTx];
      transactionDemoService.save(txs);
      window.dispatchEvent(new Event('krishimitra_transactions_updated'));
    }
  },

  rejectReceivedOffer: async (offerId: string): Promise<void> => {
    const local = offerDemoService.getLocalOffers();
    const offer = local.find(o => o.id === offerId) || DEMO_OFFERS.find(o => o.id === offerId);
    if (offer) {
      offer.status = 'REJECTED';
      offerDemoService.saveLocalOffers([...local.filter(o => o.id !== offerId), offer]);
    }
  },
  
  // For demo: pretend buyer accepts an offer the farmer sent
  simulateBuyerAcceptance: async (offerId: string): Promise<void> => {
    const local = offerDemoService.getLocalOffers();
    const offer = local.find(o => o.id === offerId) || DEMO_OFFERS.find(o => o.id === offerId);
    
    if (offer) {
      offer.status = 'ACCEPTED';
      offerDemoService.saveLocalOffers([...local.filter(o => o.id !== offerId), offer]);
      
      // Spawn transaction
      const reqs = await offerDemoService.getNormalizedRequirements();
      const req = reqs.find(r => r.id === offer.requirementId);
      const buyer = offerDemoService.getBuyerProfile(offer.buyerId);
      
      const existingTxs = await transactionDemoService.getAll('demo-farmer-id');
      const newTxId = `TM-${new Date().getFullYear()}-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
      const newTx = {
        id: newTxId,
        date: new Date().toISOString(),
        crop: req?.crop || 'Crop',
        quantityKg: offer.quantity,
        grade: req?.acceptedQualityGrades[0] || 'A',
        totalValue: offer.estimatedTotalValue,
        agreedPricePerQ: offer.pricePerQuintal,
        marketPricePerQ: offer.pricePerQuintal - 150, 
        status: 'LOGISTICS_CONFIRMED' as const,
        buyerName: buyer.name,
        buyerVerified: buyer.verified,
        offerId: offer.id,
        lotId: offer.lotId,
        payment: {
          status: 'PENDING',
          totalValue: offer.estimatedTotalValue,
          amountPaid: 0,
          amountRemaining: offer.estimatedTotalValue,
          dueDate: new Date(Date.now() + 86400000 * (offer.paymentTimelineDays || 3)).toISOString()
        }
      } as any;
      const txs = [...existingTxs, newTx];
      localStorage.setItem('farmer_transactions_demo-farmer-id', JSON.stringify(txs));
      window.dispatchEvent(new Event('krishimitra_transactions_updated'));
    }
  }
};
