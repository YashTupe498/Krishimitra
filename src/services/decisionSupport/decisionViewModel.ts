import type { DecisionResponse } from '../decisionApi';
import { getMarketIntelligence } from '../marketIntelligence/marketIntelligenceResolver';
import type { UnifiedMarketIntelligence } from '../marketIntelligence/marketIntelligenceResolver';
import type { Lot } from '../../types/lot';
import { DEMO_BUYER_REQUIREMENTS, DEMO_BUYER_PROFILES } from '../../data/offerDemoData';
import { calculateBuyerMatch } from '../../utils/marketIntelligence';

export type DecisionAction = 'SELL_WITHIN_WINDOW' | 'CONSIDER_STORAGE' | 'MONITOR';

export interface DecisionViewModel {
  lot: Lot;
  intelligence: UnifiedMarketIntelligence;
  action: DecisionAction;
  actionLabel: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  reasons: string[];
  needsAttention: boolean;
  attentionReason?: string;
  buyer: { name: string; requirementId: string; matchPercent: number; quantity: string; grade: string; source: 'CURATED_DEMO' } | null;
  aggregation: { groupName: string; additionalKg: number; combinedKg: number; buyerNeedKg: number; source: 'SUPPLIED_DATA' } | null;
  feasibility: FeasibilityItem[];
  alternatives: DecisionAlternative[];
}

export interface FeasibilityItem {
  key: 'QUALITY' | 'QUANTITY' | 'DELIVERY' | 'LOGISTICS' | 'STORAGE' | 'NET_REALIZATION';
  status: 'FEASIBLE' | 'ATTENTION' | 'UNAVAILABLE';
  title: string;
  detail: string;
}

export interface DecisionAlternative {
  key: 'AGGREGATION' | 'MARKET' | 'STORAGE';
  title: string;
  detail: string;
  value?: string;
  actionLabel: string;
  actionPath: string;
  source: 'PROJECT_DATA' | 'SUPPLIED_DATA' | 'CURATED_DEMO';
}

const marketForDecision = (decision?: DecisionResponse | null) => decision?.market_signals?.nearby_markets?.[0] || 'pimpalgaon-baswant';

export async function buildDecisionViewModel(lot: Lot, decision?: DecisionResponse | null): Promise<DecisionViewModel> {
  const intelligence = await getMarketIntelligence(lot, marketForDecision(decision));
  const buyerRequirement = DEMO_BUYER_REQUIREMENTS.find(requirement =>
    requirement.status === 'ACTIVE' && requirement.crop.toLowerCase() === lot.crop.toLowerCase()
  );
  const buyerMatch = buyerRequirement ? calculateBuyerMatch(lot, buyerRequirement) : null;
  const buyerProfile = buyerRequirement ? DEMO_BUYER_PROFILES[buyerRequirement.buyerId] : null;
  const buyer = buyerRequirement && buyerMatch && buyerMatch.matchPercentage > 0 ? {
    name: buyerProfile?.name || 'Buyer requirement',
    requirementId: buyerRequirement.id,
    matchPercent: buyerMatch.matchPercentage,
    quantity: `${buyerRequirement.quantityRequired} ${buyerRequirement.quantityUnit.toLowerCase()}`,
    grade: buyerRequirement.acceptedQualityGrades.join('/'),
    source: 'CURATED_DEMO' as const,
  } : null;

  const normalizedLotKg = intelligence.normalizedQuantityKg;
  const buyerNeedKg = buyerRequirement ? buyerRequirement.quantityRequired * (buyerRequirement.quantityUnit === 'QUINTAL' ? 100 : 1) : 0;
  // Based on the supplied FPO aggregation-lot data: F002 has 6,000 kg Grade A onion available.
  const aggregation = lot.crop.toLowerCase() === 'onion' && lot.qualityGrade === 'A' && buyerNeedKg > normalizedLotKg
    ? { groupName: 'Demo Pimpalgaon Producer Collective', additionalKg: 6000, combinedKg: normalizedLotKg + 6000, buyerNeedKg, source: 'SUPPLIED_DATA' as const }
    : null;

  const action: DecisionAction = intelligence.sellingWindow.level === 'FAVORABLE'
    ? 'SELL_WITHIN_WINDOW'
    : intelligence.sellVsStore?.signal === 'STORE' || intelligence.sellVsStore?.signal === 'CONSIDER_STORAGE'
      ? 'CONSIDER_STORAGE'
      : 'MONITOR';
  const actionLabel = action === 'SELL_WITHIN_WINDOW' ? 'Sell within the next 3–5 days' : action === 'CONSIDER_STORAGE' ? 'Consider short-term storage' : 'Monitor market signals';
  const evidenceCount = (intelligence.priceHistory.length >= 2 ? 1 : 0)
    + (intelligence.arrivalHistory.length >= 2 ? 1 : 0)
    + (intelligence.logistics ? 1 : 0)
    + (buyer ? 1 : 0);
  const confidence: 'HIGH' | 'MEDIUM' | 'LOW' = evidenceCount >= 4 ? 'HIGH' : evidenceCount >= 2 ? 'MEDIUM' : 'LOW';
  const reasons = [
    intelligence.trend.direction === 'UP' ? `Price momentum is positive (${intelligence.trend.percentage_change ?? 0}%).` : intelligence.trend.direction === 'DOWN' ? 'Prices are trending downward, so a cautious approach is advised.' : 'Recent price movement is stable.',
    intelligence.arrivalTrend === 'DECLINING' ? 'Recent arrivals are declining, indicating tighter observed supply.' : intelligence.arrivalTrend === 'INCREASING' ? 'Recent arrivals are increasing, which may add supply pressure.' : 'Arrival trend has limited evidence.',
    intelligence.netRealizationPerQuintal !== null ? `${intelligence.selectedMarketName} has an estimated net realization of ₹${Math.round(intelligence.netRealizationPerQuintal).toLocaleString()}/q.` : 'Net realization is unavailable without logistics data.',
    buyer ? `A curated demo buyer requirement matches ${buyer.matchPercent}% of this lot’s available signals.` : 'No matching buyer requirement is currently available.',
  ];
  const needsAttention = decision?.feasibility === 'INFEASIBLE' || decision?.feasibility === 'AT_RISK' || confidence === 'LOW';
  const quantityIsFeasible = !buyerRequirement || normalizedLotKg >= buyerNeedKg;
  const qualityIsFeasible = !buyerRequirement || buyerRequirement.acceptedQualityGrades.includes(lot.qualityGrade || 'PENDING');
  const feasibility: FeasibilityItem[] = [
    buyerRequirement ? { key: 'QUALITY', status: qualityIsFeasible ? 'FEASIBLE' : 'ATTENTION', title: qualityIsFeasible ? 'Quality compatible' : 'Quality mismatch', detail: qualityIsFeasible ? `Your Grade ${lot.qualityGrade || 'pending'} lot matches the buyer requirement.` : `This buyer requests Grade ${buyerRequirement.acceptedQualityGrades.join('/')}; your lot is Grade ${lot.qualityGrade || 'pending'}.` } : { key: 'QUALITY', status: 'UNAVAILABLE', title: 'Buyer quality requirement unavailable', detail: 'No active buyer requirement is available to compare quality.' },
    buyerRequirement ? { key: 'QUANTITY', status: quantityIsFeasible ? 'FEASIBLE' : 'ATTENTION', title: quantityIsFeasible ? 'Buyer quantity feasible' : 'Quantity constraint', detail: quantityIsFeasible ? `Your ${normalizedLotKg.toLocaleString()} kg lot meets the buyer’s ${buyerNeedKg.toLocaleString()} kg requirement.` : `Your ${normalizedLotKg.toLocaleString()} kg lot is below the buyer’s ${buyerNeedKg.toLocaleString()} kg requirement. Direct matching may be limited; farmer/FPO aggregation may help.` } : { key: 'QUANTITY', status: 'UNAVAILABLE', title: 'Buyer quantity requirement unavailable', detail: 'No active buyer requirement is available to evaluate volume.' },
    { key: 'DELIVERY', status: buyerRequirement ? 'FEASIBLE' : 'UNAVAILABLE', title: buyerRequirement ? 'Delivery timing compatible' : 'Delivery timing unavailable', detail: buyerRequirement ? `The buyer’s stated payment and delivery terms are ${buyerRequirement.paymentTimelineDays} day${buyerRequirement.paymentTimelineDays === 1 ? '' : 's'}; this lot is available for immediate sale.` : 'No buyer delivery timing is available to compare.' },
    intelligence.logistics ? { key: 'LOGISTICS', status: intelligence.logistics.availability === 'AVAILABLE' ? 'FEASIBLE' : 'ATTENTION', title: intelligence.logistics.availability === 'AVAILABLE' ? 'Transport available' : 'Transport availability needs attention', detail: `${intelligence.logistics.route.origin} → ${intelligence.logistics.route.destination} · ${intelligence.logistics.distanceKm} km · ${intelligence.logistics.estimatedTimeMin} min · ₹${intelligence.logistics.estimatedCostRs.toLocaleString()} estimated cost.` } : { key: 'LOGISTICS', status: 'UNAVAILABLE', title: 'Logistics information unavailable', detail: 'Transport route and cost could not be evaluated for this market.' },
    intelligence.storage ? { key: 'STORAGE', status: intelligence.storage.availability === 'AVAILABLE' ? 'FEASIBLE' : 'ATTENTION', title: intelligence.storage.availability === 'AVAILABLE' ? 'Storage available' : 'Storage availability needs attention', detail: `${intelligence.storage.centerName} has ${intelligence.storage.availableCapacityTonnes.toLocaleString()} tonnes available at ₹${intelligence.storage.costPerTonnePerDayRs}/tonne/day. Suitability: ${intelligence.storage.suitableFor.join(', ')}.` } : { key: 'STORAGE', status: 'UNAVAILABLE', title: 'Storage information unavailable', detail: 'Storage cannot be evaluated for this market from the available data.' },
    intelligence.sellVsStore ? { key: 'NET_REALIZATION', status: 'FEASIBLE', title: intelligence.sellVsStore.signal === 'SELL_NOW' ? 'Selling now is financially feasible' : 'Storage may be financially feasible', detail: `Sell now: ₹${Math.round(intelligence.sellVsStore.sellNowNetRs / (normalizedLotKg / 100)).toLocaleString()}/q. Estimated store net: ₹${Math.round(intelligence.sellVsStore.storeNetRs / (normalizedLotKg / 100)).toLocaleString()}/q.` } : { key: 'NET_REALIZATION', status: 'UNAVAILABLE', title: 'Net realization unavailable', detail: 'Net realization could not be calculated from the available data.' },
  ];
  const alternatives: DecisionAlternative[] = [];
  if (!quantityIsFeasible && aggregation) alternatives.push({ key: 'AGGREGATION', title: 'Farmer / FPO aggregation', detail: `Your ${normalizedLotKg.toLocaleString()} kg lot is below the ${buyerNeedKg.toLocaleString()} kg buyer requirement. Potential combined volume: ${aggregation.combinedKg.toLocaleString()} kg.`, actionLabel: 'View aggregation', actionPath: '#aggregation', source: 'SUPPLIED_DATA' });
  const otherMarket = intelligence.nearbyMarkets.filter(market => market.marketId !== intelligence.selectedMarketId).map(market => ({ market, net: intelligence.nearbyNetRealizationPerQuintal[market.marketId] })).filter((item): item is { market: typeof intelligence.nearbyMarkets[number]; net: number } => item.net !== null).sort((a, b) => b.net - a.net)[0];
  if (otherMarket) alternatives.push({ key: 'MARKET', title: `Sell at ${otherMarket.market.market_name}`, detail: `Observed market price: ₹${otherMarket.market.modal_price?.toLocaleString() || '—'}/q. This is an alternative to ${intelligence.selectedMarketName}.`, value: `Estimated net ₹${Math.round(otherMarket.net).toLocaleString()}/q`, actionLabel: 'Compare market', actionPath: '/farmer/market', source: 'PROJECT_DATA' });
  if (intelligence.storage && intelligence.sellVsStore) alternatives.push({ key: 'STORAGE', title: 'Store and sell later', detail: `Capacity is available. Storage cost is ₹${intelligence.storage.costPerTonnePerDayRs}/tonne/day; future prices are estimated, not guaranteed.`, value: `Estimated store net ₹${Math.round(intelligence.sellVsStore.storeNetRs / (normalizedLotKg / 100)).toLocaleString()}/q`, actionLabel: 'View storage', actionPath: '#storage', source: 'CURATED_DEMO' });
  return { lot, intelligence, action, actionLabel, confidence, reasons, needsAttention, attentionReason: needsAttention ? (decision?.feasibility === 'AT_RISK' ? 'A decision constraint needs review.' : 'Market evidence is limited for this lot.') : undefined, buyer, aggregation, feasibility, alternatives };
}
