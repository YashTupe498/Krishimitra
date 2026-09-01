import { supabase } from '../lib/supabase';

export interface DecisionResponse {
  id: string;
  generated_at: string;
  lot_id: string;
  farmer_id: string;
  recommendation: 'SELL_NOW' | 'WAIT' | 'CONSIDER_STORAGE' | 'NO_ACTIONABLE_OPTION';
  confidence: 'High' | 'Medium' | 'Low';
  reasons: string[];
  market_signals: {
    modal_price?: number;
    low_price?: number;
    high_price?: number;
    price_movement?: string;
    pressure?: string;
    selling_window?: string;
    nearby_markets: string[];
  };
  best_opportunity?: {
    opportunity_id: string;
    buyer_id: string;
    buyer_name: string;
    price: number;
    quantity: number;
    quantity_unit: string;
    payment_terms: string;
    expected_realization?: number;
  };
  net_realization?: number;
  gross_value?: number;
  transport_cost?: number;
  handling_cost?: number;
  storage_cost?: number;
  feasibility: 'FEASIBLE' | 'AT_RISK' | 'INFEASIBLE';
  constraints: {
    type: string;
    farmer_requirement: string;
    buyer_offering: string;
    status: 'FEASIBLE' | 'AT_RISK' | 'INFEASIBLE';
  }[];
  alternatives: {
    title: string;
    value: number;
    unit: string;
    reason_rejected: string;
  }[];
  resolution_guidance?: {
    problem: string;
    reason: string;
    actionable_advice: string;
    next_step: string;
  };
  evidence: {
    factor: string;
    text: string;
    source: string;
  }[];
}

export const decisionApi = {
  getDecision: async (lotId: string): Promise<DecisionResponse> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const response = await fetch(`/api/v1/farmer/decisions/${lotId}`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error((await response.text()) || 'Failed to fetch decision');
    }

    return response.json();
  }
};
