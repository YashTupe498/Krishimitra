import type { Lot, QualityAssessmentResponse } from '../types/lot';

export const mockQualityB: QualityAssessmentResponse = {
  crop: 'Onion',
  grade: 'B',
  confidence: null,
  observations: [
    'Produce is generally suitable but shows some size variation or minor visible defects.'
  ],
  quality_adjustment_type: 'NONE',
  quality_adjustment_value: 0,
  assessment_mode: 'prototype_demo'
};

const initialMockLots: Record<string, Lot> = {
  'lot-1': {
    id: 'lot-1',
    farmerId: 'farmer-bhavya',
    crop: 'Onion',
    quantity: '5,000',
    unit: 'kg',
    location: 'Nashik, Maharashtra',
    village: 'Nashik',
    taluka: 'Nashik Taluka',
    district: 'Nashik District',
    state: 'Maharashtra',
    status: 'DECISION_READY',
    qualityGrade: 'B',
    qualityAssessment: mockQualityB,
    constraints: {
      paymentRequirement: 'Within 7 days',
      transportCapability: 'Can arrange transport',
      storageCapability: 'Can store produce'
    },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    activeDecisionId: 'dec-101',
    activeOfferId: 'off-101'
  },
  'lot-2': {
    id: 'lot-2',
    farmerId: 'farmer-bhavya',
    crop: 'Potato',
    quantity: '2,000',
    unit: 'kg',
    location: 'Pune, Maharashtra',
    village: 'Pune',
    taluka: 'Pune Taluka',
    district: 'Pune District',
    state: 'Maharashtra',
    status: 'QUALITY_PENDING',
    qualityGrade: null,
    qualityAssessment: null,
    constraints: {
      paymentRequirement: 'Within 3 days',
      transportCapability: 'Need transport assistance',
      storageCapability: 'Cannot store produce'
    },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
};

class LotStore {
  private lots: Record<string, Lot> = {};

  constructor() {
    this.load();
  }

  private load() {
    try {
      const stored = localStorage.getItem('krishimitra_lots');
      if (stored) {
        this.lots = JSON.parse(stored);
        // Quick sanity check
        if (!this.lots['lot-1']) {
            this.lots = { ...initialMockLots };
        }
      } else {
        this.lots = { ...initialMockLots };
      }
    } catch (e) {
      this.lots = { ...initialMockLots };
    }
  }

  private save() {
    localStorage.setItem('krishimitra_lots', JSON.stringify(this.lots));
    // Dispatch a custom event so other components can re-render if needed
    window.dispatchEvent(new Event('krishimitra_lots_updated'));
  }

  getAll(): Lot[] {
    return Object.values(this.lots).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  get(id: string): Lot | null {
    return this.lots[id] || null;
  }

  add(lot: Lot) {
    this.lots[lot.id] = lot;
    this.save();
  }

  update(id: string, updates: Partial<Lot>) {
    if (this.lots[id]) {
      this.lots[id] = { ...this.lots[id], ...updates, updatedAt: new Date().toISOString() };
      this.save();
    }
  }

  delete(id: string) {
    if (this.lots[id]) {
      delete this.lots[id];
      this.save();
    }
  }
}

export const lotStore = new LotStore();

// For backwards compatibility during transition, define a getter object
// that returns the current state of the store if someone tries to access `mockLots[id]` directly.
export const mockLots = new Proxy({}, {
  get(_target, prop) {
    if (typeof prop === 'string') {
      return lotStore.get(prop);
    }
    return undefined;
  },
  ownKeys(_target) {
    return Object.keys(lotStore.getAll().reduce((acc, lot) => { acc[lot.id] = lot; return acc; }, {} as Record<string, Lot>));
  },
  getOwnPropertyDescriptor(_target, prop) {
    return {
      enumerable: true,
      configurable: true,
      value: typeof prop === 'string' ? lotStore.get(prop) : undefined
    };
  }
}) as Record<string, Lot>;
