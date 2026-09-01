import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, MapPin, TrendingUp, Truck, Receipt, CheckCircle2,
  AlertTriangle, Calculator, ArrowRight, FileCheck,
  Package, XCircle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { decisionApi } from '../../services/decisionApi';
import type { DecisionResponse } from '../../services/decisionApi';
import { farmerLotsApi } from '../../services/farmerLotsApi';
import { getMarketIntelligence } from '../../services/marketIntelligence/marketIntelligenceResolver';
import type { UnifiedMarketIntelligence } from '../../services/marketIntelligence/marketIntelligenceResolver';
import { supabase } from '../../lib/supabase';
import type { Lot } from '../../types/lot';
import { ENWRAwareness } from '../../components/farmer/market/ENWRAwareness';
import { buildDecisionViewModel } from '../../services/decisionSupport/decisionViewModel';
import type { DecisionViewModel } from '../../services/decisionSupport/decisionViewModel';

export const DecisionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [decision, setDecision] = useState<DecisionResponse | null>(null);
  const [intelligence, setIntelligence] = useState<UnifiedMarketIntelligence | null>(null);
  const [lot, setLot] = useState<Lot | null>(null);
  const [viewModel, setViewModel] = useState<DecisionViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDecision = async () => {
      try {
        setLoading(true);
        if (!id) throw new Error("No lot ID provided");
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Not authenticated');

        const lotData = await farmerLotsApi.get(session.access_token, id);
        setLot(lotData);

        let decData: DecisionResponse;
        try {
          decData = await decisionApi.getDecision(id);
        } catch {
          decData = { id: `local-${id}`, generated_at: '', lot_id: id, farmer_id: lotData.farmerId, recommendation: 'NO_ACTIONABLE_OPTION', confidence: 'Low', reasons: [], market_signals: { nearby_markets: [] }, feasibility: 'AT_RISK', constraints: [], alternatives: [], evidence: [] };
        }
        setDecision(decData);

        const recommendedMarket = decData.market_signals?.nearby_markets?.[0] || 'Pimpalgaon Baswant APMC';
        const intel = await getMarketIntelligence(lotData, recommendedMarket);
        setIntelligence(intel);
        setViewModel(await buildDecisionViewModel(lotData, decData));
      } catch (err: any) {
        setError(err.message || "Failed to load decision");
      } finally {
        setLoading(false);
      }
    };
    fetchDecision();
  }, [id]);

  const formatCurrency = (val: number | undefined) => {
    if (val === undefined) return '---';
    return '₹ ' + val.toLocaleString('en-IN');
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-24 bg-gray-200 rounded-2xl w-full"></div>
        <div className="h-64 bg-gray-200 rounded-2xl w-full"></div>
        <div className="h-48 bg-gray-200 rounded-2xl w-full"></div>
      </div>
    );
  }

  if (error || !decision || !intelligence || !lot) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center mt-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
          <XCircle size={32} />
        </div>
        <h2 className="text-xl font-bold mb-2">Unable to load decision</h2>
        <p className="text-gray-500 mb-6">{error || "The decision service could not be reached."}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  const { 
    best_opportunity, 
    resolution_guidance, 
    evidence = [],
    reasons = []
  } = decision;
  const feasibilityItems = viewModel?.feasibility ?? [];
  const decisionAlternatives = viewModel?.alternatives ?? [];
  const decisionEvidence = evidence.length ? evidence : viewModel ? [
    { factor: 'Price', text: `₹${viewModel.intelligence.snapshot.modal_price?.toLocaleString() || '—'}/q`, source: viewModel.intelligence.sources.price },
    { factor: 'Arrivals', text: viewModel.intelligence.arrivalTrend === 'INSUFFICIENT_DATA' ? 'Unavailable' : viewModel.intelligence.arrivalTrend.toLowerCase(), source: viewModel.intelligence.sources.arrivals },
    { factor: 'Net realization', text: viewModel.intelligence.netRealizationPerQuintal === null ? 'Unavailable' : `₹${Math.round(viewModel.intelligence.netRealizationPerQuintal).toLocaleString()}/q`, source: viewModel.intelligence.sources.logistics },
    { factor: 'Aggregation', text: viewModel.aggregation ? 'Potentially suitable' : 'Not required', source: viewModel.aggregation?.source || 'UNAVAILABLE' },
  ] : [];

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-28 md:pb-24 max-w-4xl mx-auto p-4 md:p-8">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 border-b border-gray-200 pb-4 pt-4 md:pt-0">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
          aria-label={t('common.back', 'Back')}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
            {t('decisions.headerTag', 'Active Decision')}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">
            {t('decisions.title', 'Where should you sell?')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t('decisions.subtitle', 'Compare the likely outcome, costs and constraints before deciding.')}
          </p>
        </div>
      </div>

      {/* LOT SUMMARY */}
      <Card className="border-gray-200 shadow-sm bg-white overflow-hidden">
        <div className="p-5 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-3xl shrink-0">
              <Package className="text-gray-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {lot.crop}
              </h2>
              <div className="flex items-center gap-2 mt-1 text-sm font-medium text-gray-600">
                <span>{lot.quantity} {lot.unit}</span>
                <span>•</span>
                <span>{lot.qualityGrade ? `Grade ${lot.qualityGrade}` : 'No Grade'}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><MapPin size={12} /> {lot.location}</span>
              </div>
            </div>
          </div>
          <Badge variant={decision.feasibility === 'FEASIBLE' ? 'success' : 'warning'} className="px-3 py-1 uppercase tracking-wider font-bold">
            {decision.feasibility === 'FEASIBLE' ? '🟢 Feasible' : decision.feasibility === 'AT_RISK' ? '🟡 At Risk' : '🔴 Infeasible'}
          </Badge>
        </div>
      </Card>

      {/* TRANSACTION INTEGRATION */}
      {(lot.status === 'TRANSACTION_ACTIVE' || lot.status === 'COMPLETED') && lot.activeTransactionId && (
        <Card className="border border-brand-primary shadow-sm overflow-hidden bg-brand-primary/5">
          <div className="p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-16 h-16 bg-brand-primary/20 text-brand-primary rounded-full flex items-center justify-center shrink-0">
              <Receipt size={32} />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold text-gray-900 mb-1">TRANSACTION CREATED</h2>
              <p className="text-gray-600 mb-4">This lot is currently locked in an active transaction.</p>
              <div className="bg-white rounded-lg p-3 inline-block border border-gray-200">
                <span className="text-sm font-bold text-gray-500 mr-2">Transaction:</span>
                <span className="font-mono text-gray-900">{lot.activeTransactionId}</span>
              </div>
            </div>
            <Button 
              onClick={() => navigate(`/farmer/transactions/${lot.activeTransactionId}`)}
              className="w-full sm:w-auto"
            >
              View Transaction
            </Button>
          </div>
        </Card>
      )}

      {/* RECOMMENDED ACTION */}
      {lot.status !== 'TRANSACTION_ACTIVE' && lot.status !== 'COMPLETED' && (
      <Card className="border border-brand-primary shadow-sm overflow-hidden relative group bg-white">
        <div className="p-6 md:p-8 relative z-10 flex flex-col items-center sm:items-start text-center sm:text-left">
          <div className="flex items-center gap-2 mb-3 bg-brand-primary/10 text-brand-primary px-3 py-1.5 rounded-full border border-brand-primary/20 w-fit mx-auto sm:mx-0">
            <CheckCircle2 size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">{t('decisions.recommendedAction', '⭐ Recommended Action')}</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-3 text-brand-deep uppercase">
            {viewModel?.actionLabel || decision.recommendation?.replace(/_/g, ' ') || 'Monitor Market Signals'}
          </h2>
          
          <div className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 flex items-center gap-2 mx-auto sm:mx-0">
            <Calculator size={14} className="text-brand-primary" />
            <span>{t('decisions.enginePowered', 'Calculated by KrishiMitra Decision Engine')}</span>
          </div>
        </div>
      </Card>
      )}

      {/* WHY THIS DECISION */}
      {lot.status !== 'TRANSACTION_ACTIVE' && lot.status !== 'COMPLETED' && (
        <Card className="bg-white border-gray-200">
        <div className="p-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Why this decision?</h3>
          <ul className="space-y-3">
            {(reasons.length ? reasons : viewModel?.reasons || []).map((r, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-green-600 shrink-0 mt-0.5" />
                <span className="text-gray-700">{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>
      )}

      {/* MARKET SIGNALS AND OPPORTUNITY */}
      {lot.status !== 'TRANSACTION_ACTIVE' && lot.status !== 'COMPLETED' && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">RECOMMENDED MARKET</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <span className="text-sm font-medium text-gray-500">Market</span>
              <span className="font-bold text-gray-900">{intelligence.selectedMarketName}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <span className="text-sm font-medium text-gray-500">Expected Market Price</span>
              <span className="font-bold text-gray-900">₹{intelligence.snapshot.modal_price?.toLocaleString() || '—'}/q</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-green-700">Estimated Net Realization</span>
              <span className="font-black text-green-800 text-lg">₹{intelligence.netRealizationPerQuintal?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || '---'}/q</span>
            </div>
          </div>
        </Card>

        {best_opportunity ? (
          <Card className="bg-green-50 border-green-200 p-6">
            <h3 className="text-sm font-bold text-green-800 uppercase tracking-wider mb-4">Best Opportunity</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-green-700 mb-1">Buyer</p>
                <p className="font-bold text-green-900">{best_opportunity.buyer_name}</p>
              </div>
              <div className="flex justify-between">
                <span className="text-green-800">Price</span>
                <span className="font-bold text-green-900">{formatCurrency(best_opportunity.price)}/{best_opportunity.quantity_unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-800">Quantity Required</span>
                <span className="font-bold text-green-900">{best_opportunity.quantity} {best_opportunity.quantity_unit}</span>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="bg-gray-50 border-gray-200 p-6 flex flex-col justify-center items-center text-center">
            <AlertTriangle className="text-gray-400 mb-3" size={24} />
            <p className="text-gray-500 text-sm">No actionable buyer opportunity currently.</p>
          </Card>
        )}
      </div>
      )}

      {/* LOGISTICS & STORAGE & SELL VS STORE */}
      {lot.status !== 'TRANSACTION_ACTIVE' && lot.status !== 'COMPLETED' && (
        <section id="storage" className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Card className="bg-white border-gray-200 p-6 flex flex-col">
             <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-4"><Truck size={14}/> Logistics</h3>
             {intelligence.logistics ? (
                <div className="flex-1 flex flex-col text-sm">
                   <div className="mb-auto">
                     <span className="text-gray-900 font-bold block mb-1">{intelligence.logistics.route.origin} → {intelligence.logistics.route.destination}</span>
                     <span className="text-gray-500 block mb-3">{intelligence.logistics.distanceKm} km</span>
                     <span className="font-bold text-gray-900 block mb-1">₹{intelligence.logistics.estimatedCostRs.toLocaleString()} transport</span>
                   </div>
                   <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 text-green-600 font-bold text-[10px] uppercase tracking-widest">
                      <CheckCircle2 size={14} /> {intelligence.logistics.availability}
                   </div>
                </div>
             ) : (
                <p className="text-sm text-gray-500 italic">Logistics information unavailable.</p>
             )}
          </Card>
          
          <Card className="bg-white border-gray-200 p-6 flex flex-col">
             <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-4"><Package size={14}/> Storage</h3>
             {intelligence.storage ? (
                <div className="flex-1 flex flex-col text-sm">
                   <div className="mb-auto">
                     <span className="text-gray-900 font-bold block mb-1">{intelligence.storage.centerName}</span>
                     <span className="text-gray-500 block mb-3">{intelligence.storage.distanceKm} km</span>
                     <span className="font-bold text-gray-900 block mb-1">₹{intelligence.storage.costPerTonnePerDayRs}/tonne/day</span>
                   </div>
                   <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 text-green-600 font-bold text-[10px] uppercase tracking-widest">
                      <CheckCircle2 size={14} /> Capacity {intelligence.storage.availability}
                   </div>
                </div>
             ) : (
                <p className="text-sm text-gray-500 italic">Storage information unavailable.</p>
             )}
          </Card>

          <Card className="bg-white border-gray-200 p-6 flex flex-col">
             <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-4"><TrendingUp size={14}/> Sell vs Store</h3>
             {intelligence.sellVsStore ? (
                <div className="flex-1 flex flex-col text-sm">
                   <div className="mb-auto space-y-2">
                     <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                        <span className="text-gray-500">Sell Now Net</span>
                        <span className="font-bold text-gray-900">₹{(intelligence.sellVsStore.sellNowNetRs / (intelligence.normalizedQuantityKg / 100)).toLocaleString(undefined, {maximumFractionDigits: 0})}/q</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-gray-500">Estimated Store Net</span>
                        <span className="font-bold text-gray-900">₹{(intelligence.sellVsStore.storeNetRs / (intelligence.normalizedQuantityKg / 100)).toLocaleString(undefined, {maximumFractionDigits: 0})}/q</span>
                     </div>
                   </div>
                   <div className={`mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest ${intelligence.sellVsStore.signal === 'CONSIDER_STORAGE' ? 'text-orange-600' : 'text-green-600'}`}>
                      <CheckCircle2 size={14} /> {intelligence.sellVsStore.signal === 'CONSIDER_STORAGE' ? 'Consider Storage' : 'Sell Now Favorable'}
                   </div>
                </div>
             ) : (
                <p className="text-sm text-gray-500 italic">Sell vs store unavailable.</p>
             )}
          </Card>
        </section>
      )}

      {/* ENWR AWARENESS */}
      {lot.status !== 'TRANSACTION_ACTIVE' && lot.status !== 'COMPLETED' && intelligence.storage && (
         <div className="mt-8">
            <ENWRAwareness />
         </div>
      )}

      {lot.status !== 'TRANSACTION_ACTIVE' && lot.status !== 'COMPLETED' && viewModel?.aggregation && (
        <Card className="mt-8 bg-white border-gray-200">
          <div id="aggregation" />
          <div className="p-6"><div className="flex justify-between gap-4 items-start"><div><h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Farmer / FPO aggregation</h3><p className="text-sm text-gray-600 mt-2">Combining compatible Grade A onion lots may help meet a buyer’s volume requirement.</p></div><span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded uppercase">Supplied data</span></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 text-sm"><div><span className="text-gray-500 block">Your lot</span><strong>{viewModel.intelligence.normalizedQuantityKg.toLocaleString()} kg</strong></div><div><span className="text-gray-500 block">Compatible group</span><strong>{viewModel.aggregation.groupName}</strong></div><div><span className="text-gray-500 block">Combined potential</span><strong>{viewModel.aggregation.combinedKg.toLocaleString()} kg</strong></div><div><span className="text-gray-500 block">Buyer need</span><strong>{viewModel.aggregation.buyerNeedKg.toLocaleString()} kg</strong></div></div>
          <p className="text-xs text-green-700 font-medium mt-5">Potential benefit: the combined volume can meet the buyer quantity threshold; shared logistics may reduce per-unit cost. This does not join you to an FPO or guarantee a sale.</p></div>
        </Card>
      )}

      {/* FEASIBILITY & CONSTRAINTS */}
      {lot.status !== 'TRANSACTION_ACTIVE' && lot.status !== 'COMPLETED' && (
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <Card className="bg-white border-gray-200">
          <div className="p-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Feasibility constraints</h3>
            <div className="space-y-3">
              {feasibilityItems.map(item => <div key={item.key} className={`p-4 rounded-xl border ${item.status === 'FEASIBLE' ? 'bg-green-50 border-green-100' : item.status === 'ATTENTION' ? 'bg-amber-50 border-amber-100' : 'bg-gray-50 border-gray-100'}`}>
                <div className="flex gap-2"><span aria-hidden="true" className={`font-bold ${item.status === 'FEASIBLE' ? 'text-green-700' : item.status === 'ATTENTION' ? 'text-amber-700' : 'text-gray-500'}`}>{item.status === 'FEASIBLE' ? '✓' : item.status === 'ATTENTION' ? '⚠' : '•'}</span><div><p className="font-bold text-gray-900 text-sm">{item.title}</p><p className="text-xs text-gray-600 mt-1 leading-relaxed">{item.detail}</p></div></div>
              </div>)}
              {feasibilityItems.length > 0 && <div className="pt-3 border-t border-gray-100"><p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Feasibility summary</p><p className="text-xs text-gray-700 mt-1">{feasibilityItems.filter(item => item.status === 'FEASIBLE').length} checks feasible{feasibilityItems.some(item => item.status === 'ATTENTION') ? '; attention is needed before the selected route can be fully executed.' : '.'}</p></div>}
            </div>
          </div>
        </Card>

        <Card className="bg-white border-gray-200 flex flex-col h-full">
          <div className="p-6 flex-1 flex flex-col">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Other Alternatives</h3>
            {decisionAlternatives.length > 0 ? (
              <ul className="space-y-4 flex-1">
                {decisionAlternatives.map(alt => (
                  <li key={alt.key} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="flex justify-between gap-3 mb-2"><span className="font-bold text-gray-900 text-sm">{alt.title}</span>{alt.value && <span className="text-xs font-bold text-green-700 text-right">{alt.value}</span>}</div>
                    <p className="text-xs text-gray-600 leading-relaxed">{alt.detail}</p>
                    <div className="flex justify-between items-center mt-3"><span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{alt.source === 'CURATED_DEMO' ? 'Curated demo' : alt.source === 'SUPPLIED_DATA' ? 'Supplied data' : 'Project data'}</span><button type="button" className="text-xs font-bold text-brand-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary rounded" onClick={() => alt.actionPath.startsWith('#') ? document.getElementById(alt.actionPath.slice(1))?.scrollIntoView({ behavior: 'smooth' }) : navigate(alt.actionPath)}>{alt.actionLabel} →</button></div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center text-center p-6">
                <p className="text-sm font-bold text-gray-700">NO ADDITIONAL ALTERNATIVES IDENTIFIED</p><p className="text-xs text-gray-500 mt-2">Based on the available market, buyer, logistics and storage information, no additional actionable option is supported.</p><Button variant="secondary" className="mt-4" onClick={() => navigate('/farmer/market')}>View Market Intelligence</Button>
              </div>
            )}
          </div>
        </Card>
      </section>
      )}

      {/* RESOLUTION GUIDANCE */}
      {lot.status !== 'TRANSACTION_ACTIVE' && lot.status !== 'COMPLETED' && resolution_guidance && (
        <Card className="mt-8 bg-amber-50 border-amber-200 overflow-hidden">
          <div className="p-6 md:p-8 flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-900 mb-1">{resolution_guidance.problem}</h3>
              <p className="text-amber-800 mb-4">{resolution_guidance.reason}</p>
              
              <div className="bg-white rounded-xl p-4 border border-amber-100">
                <p className="text-sm font-bold text-gray-900 mb-1">What can you do?</p>
                <p className="text-sm text-gray-600 mb-4">{resolution_guidance.actionable_advice}</p>
                <p className="text-sm font-bold text-brand-primary">Recommended next step: {resolution_guidance.next_step}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {lot.status !== 'TRANSACTION_ACTIVE' && lot.status !== 'COMPLETED' && (
        <>
          {/* EVIDENCE / DATA PROVENANCE */}
          <section className="mt-10">
            <Card className="bg-white border-gray-200">
              <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <FileCheck size={18} className="text-brand-deep" />
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{t('decisions.decisionBasis', 'Decision Basis / Evidence')}</h3>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                  {decisionEvidence.map((ev, i) => (
                    <div key={i} className="flex items-center gap-1.5" title={ev.source}>
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> 
                      {ev.factor}: {ev.text} <span className="text-xs text-gray-400">({ev.source})</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </section>
        </>
      )}
      
      {lot.status !== 'TRANSACTION_ACTIVE' && lot.status !== 'COMPLETED' && (
          <div className="fixed bottom-0 left-0 right-0 md:left-[260px] bg-white border-t border-gray-200 p-4 px-6 md:px-8 flex items-center justify-between shadow-[0_-4px_24px_rgba(0,0,0,0.06)] z-40">
            <Button variant="ghost" onClick={() => navigate(-1)} className="hidden sm:flex text-gray-600">
              {t('common.back', 'Back')}
            </Button>
            <div className="flex gap-3 w-full sm:w-auto">
              {best_opportunity ? (
                <Button 
                  variant="primary" 
                  icon={<ArrowRight size={18} />} 
                  iconPosition="right" 
                  className="flex-1 sm:flex-none px-6 md:px-8 shadow-sm"
                  onClick={() => navigate(`/farmer/offers/opportunities/${best_opportunity.opportunity_id}`)}
                >
                  View Buyer Opportunity
                </Button>
              ) : (
                <Button variant="secondary" className="flex-1 sm:flex-none opacity-50 cursor-not-allowed">
                  No Actionable Option
                </Button>
              )}
            </div>
          </div>
      )}

    </div>
  );
};
