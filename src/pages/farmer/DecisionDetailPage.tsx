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
import { supabase } from '../../lib/supabase';
import type { Lot } from '../../types/lot';

export const DecisionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [decision, setDecision] = useState<DecisionResponse | null>(null);
  const [lot, setLot] = useState<Lot | null>(null);
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

        const decData = await decisionApi.getDecision(id);
        setDecision(decData);
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

  if (error || !decision || !lot) {
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
    market_signals, 
    constraints = [], 
    alternatives = [], 
    resolution_guidance, 
    evidence = [],
    reasons = []
  } = decision;

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
            {decision.recommendation?.replace(/_/g, ' ') || 'UNKNOWN'}
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
            {reasons.map((r, i) => (
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
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Market Signals</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Modal Price</span>
              <span className="font-bold text-gray-900">{market_signals?.modal_price ? formatCurrency(market_signals.modal_price) : '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Movement</span>
              <span className="font-bold text-gray-900">{market_signals?.price_movement || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Pressure</span>
              <span className="font-bold text-gray-900">{market_signals?.pressure || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Selling Window</span>
              <span className="font-bold text-gray-900">{market_signals?.selling_window || '---'}</span>
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

      {/* NET REALIZATION WATERFALL */}
      {best_opportunity && decision.net_realization && (
        <section className="mt-12">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Calculator className="text-brand-deep" />
            {t('decisions.netRealizationBreakdown', 'Net Realization Breakdown')}
          </h2>
          
          <div className="bg-gray-50 rounded-3xl p-6 md:p-8 border border-gray-100 space-y-2">
            {/* Gross Value */}
            <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  <TrendingUp size={18} className="text-gray-600" />
                </div>
                <div>
                  <p className="text-base font-bold text-gray-900">{t('decisions.grossSaleValue', 'Gross Sale Value')}</p>
                </div>
              </div>
              <div className="text-xl font-bold text-gray-900 numeric ml-14 sm:ml-0">
                {formatCurrency(decision.gross_value)}
              </div>
            </div>
            
            <div className="py-1 pl-24 hidden sm:block"><ArrowDownIcon className="text-gray-300 w-6 h-6" /></div>

            {/* Transport */}
            <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 md:p-5 shadow-sm relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ml-0 sm:ml-12">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0 text-red-600">
                  <Truck size={18} />
                </div>
                <div>
                  <p className="text-base font-bold text-red-900">{t('decisions.transport', 'Transport')}</p>
                </div>
              </div>
              <div className="text-xl font-bold text-red-700 ml-14 sm:ml-0 flex items-center gap-2 numeric">
                {decision.transport_cost ? `- ${formatCurrency(decision.transport_cost)}` : 'Unavailable'}
              </div>
            </div>

            <div className="py-1 pl-24 hidden sm:block"><ArrowDownIcon className="text-gray-300 w-6 h-6" /></div>

            {/* Handling */}
            <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 md:p-5 shadow-sm relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ml-0 sm:ml-12">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0 text-red-600">
                  <Receipt size={18} />
                </div>
                <div>
                  <p className="text-base font-bold text-red-900">{t('decisions.handling', 'Handling & Other Charges')}</p>
                </div>
              </div>
              <div className="text-xl font-bold text-red-700 ml-14 sm:ml-0 flex items-center gap-2 numeric">
                {decision.handling_cost ? `- ${formatCurrency(decision.handling_cost)}` : 'Unavailable'}
              </div>
            </div>

            <div className="py-1 pl-24 hidden sm:block"><ArrowDownIcon className="text-gray-300 w-6 h-6" /></div>

            {/* Net Realization */}
            <div className="bg-green-50/80 border-2 border-green-500 rounded-2xl p-6 md:p-8 shadow-md relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-green-600 text-white shadow-sm flex items-center justify-center shrink-0">
                  <Calculator size={28} />
                </div>
                <div>
                  <p className="text-sm font-bold text-green-700 uppercase tracking-widest mb-1">{t('decisions.estimatedNetRealization', 'Estimated Net Realization')}</p>
                </div>
              </div>
              <div className="text-4xl md:text-5xl font-display font-bold text-green-800 relative z-10 whitespace-nowrap numeric">
                {formatCurrency(decision.net_realization)}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FEASIBILITY & CONSTRAINTS */}
      {lot.status !== 'TRANSACTION_ACTIVE' && lot.status !== 'COMPLETED' && (
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <Card className="bg-white border-gray-200">
          <div className="p-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Feasibility constraints</h3>
            <div className="space-y-4">
              {constraints.map((c, i) => (
                <div key={i} className={`p-4 rounded-xl border ${
                  c.status === 'FEASIBLE' ? 'bg-green-50 border-green-100' :
                  c.status === 'AT_RISK' ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100'
                }`}>
                  <p className="font-bold text-gray-900 mb-2">{c.type}</p>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Your requirement:</span>
                    <span className="font-semibold">{c.farmer_requirement}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Buyer offering:</span>
                    <span className="font-semibold">{c.buyer_offering}</span>
                  </div>
                  {c.status !== 'FEASIBLE' && (
                    <div className={`mt-3 pt-3 border-t text-sm font-bold flex items-center gap-2 ${
                      c.status === 'AT_RISK' ? 'border-amber-200 text-amber-700' : 'border-red-200 text-red-700'
                    }`}>
                      <AlertTriangle size={16} />
                      {c.status === 'AT_RISK' ? 'At Risk' : 'Infeasible'}
                    </div>
                  )}
                </div>
              ))}
              {constraints.length === 0 && <p className="text-gray-500 text-sm">No specific constraints evaluated.</p>}
            </div>
          </div>
        </Card>

        <Card className="bg-white border-gray-200 flex flex-col h-full">
          <div className="p-6 flex-1 flex flex-col">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Other Alternatives</h3>
            {alternatives.length > 0 ? (
              <ul className="space-y-4 flex-1">
                {alternatives.map((alt, i) => (
                  <li key={i} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="flex justify-between mb-2">
                      <span className="font-bold text-gray-900">{alt.title}</span>
                      <span className="text-gray-900">{formatCurrency(alt.value)}/{alt.unit}</span>
                    </div>
                    <p className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded inline-block">Not selected</p>
                    <p className="text-xs text-gray-500 mt-2">Reason: {alt.reason_rejected}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center text-center p-6">
                <p className="text-gray-500">No other alternatives available.</p>
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
                  {evidence.map((ev, i) => (
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

// Helper component for the down arrow in the waterfall
function ArrowDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      {...props} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </svg>
  );
}
