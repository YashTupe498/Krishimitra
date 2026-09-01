import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, RefreshCw, AlertCircle, RefreshCcw, Package } from 'lucide-react';
import { farmerLotsApi } from '../../services/farmerLotsApi';
import { decisionApi } from '../../services/decisionApi';
import type { DecisionResponse } from '../../services/decisionApi';
import type { Lot } from '../../types/lot';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';

export const MyDecisionsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [lots, setLots] = useState<Lot[]>([]);
  const [decisions, setDecisions] = useState<Record<string, DecisionResponse>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const fetchedLots = await farmerLotsApi.list(session.access_token);
      setLots(Array.isArray(fetchedLots) ? fetchedLots : []);

      const newDecisions: Record<string, DecisionResponse> = {};
      for (const lot of fetchedLots) {
        if (lot.status !== 'DRAFT') {
          try {
            const dec = await decisionApi.getDecision(lot.id);
            newDecisions[lot.id] = dec;
          } catch (e) {
            console.error(`Failed to fetch decision for lot ${lot.id}`, e);
          }
        }
      }
      setDecisions(newDecisions);
    } catch (err: any) {
      setError(err.message || 'Failed to load decisions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const actionableCount = Object.values(decisions).filter(d => d?.recommendation === 'SELL_NOW').length;
  const needsAttentionCount = Object.values(decisions).filter(d => d?.feasibility === 'INFEASIBLE' || d?.feasibility === 'AT_RISK').length;

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-24 bg-gray-200 rounded-2xl w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded-2xl"></div>
          <div className="h-64 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* HEADER */}
      <header className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 z-0"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
              <Lightbulb size={20} />
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-900">
              {t('decisions.dashboardTitle', 'MY DECISIONS')}
            </h1>
          </div>
          <p className="text-gray-600">
            {t('decisions.dashboardSubtitle', 'Understand what to do with your produce.')}
          </p>
        </div>
        
        <div className="relative z-10 flex items-center gap-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="text-center px-4 border-r border-gray-200">
            <p className="text-2xl font-bold text-gray-900">{(lots || []).length}</p>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('decisions.summaryLots', 'LOTS')}</p>
          </div>
          <div className="text-center px-4 border-r border-gray-200">
            <p className="text-2xl font-bold text-green-600">{actionableCount}</p>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('decisions.summaryActionable', 'ACTIONABLE')}</p>
          </div>
          <div className="text-center px-4">
            <p className="text-2xl font-bold text-amber-600">{needsAttentionCount}</p>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('decisions.summaryAttention', 'NEEDS ATTENTION')}</p>
          </div>
          <button 
            onClick={() => loadData(true)} 
            disabled={refreshing}
            className="ml-2 p-2 text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50 rounded-full hover:bg-gray-100"
            title="Refresh"
          >
            <RefreshCcw size={20} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 flex items-center gap-3">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* EMPTY STATE */}
      {(lots || []).length === 0 && !error ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package size={24} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t('decisions.noLotsTitle', 'No lots available')}</h2>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            {t('decisions.noLotsDesc', 'Create a lot first so KrishiMitra can analyze the market and recommend the best next step.')}
          </p>
          <Button onClick={() => navigate('/farmer/lots/new')}>
            {t('decisions.createLot', 'Create Lot')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(lots || []).map((lot) => {
            const decision = decisions[lot.id];
            
            return (
              <div key={lot.id} className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 hover:border-green-200 hover:shadow-md transition-all flex flex-col h-full group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      {lot.crop}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {lot.quantity} {lot.unit} • {lot.qualityGrade ? `Grade ${lot.qualityGrade}` : 'No Grade'} • {lot.location}
                    </p>
                  </div>
                </div>

                {decision ? (
                  <div className="flex-1 flex flex-col">
                    <div className="mb-4">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">RECOMMENDATION</p>
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold ${
                        decision.recommendation === 'SELL_NOW' ? 'bg-green-100 text-green-800' :
                        decision.recommendation === 'WAIT' ? 'bg-blue-100 text-blue-800' :
                        decision.recommendation === 'CONSIDER_STORAGE' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {decision.recommendation?.replace(/_/g, ' ') || 'UNKNOWN'}
                      </div>
                    </div>
                    
                    {decision.best_opportunity && (
                      <div className="bg-gray-50 rounded-xl p-3 mb-5 border border-gray-100 flex-1">
                        <p className="text-xs text-gray-500 mb-1">Best opportunity:</p>
                        <p className="font-semibold text-gray-900 mb-2 truncate" title={decision.best_opportunity.buyer_name}>
                          {decision.best_opportunity.buyer_name}
                        </p>
                        <div className="flex items-center justify-between mt-auto">
                          <p className="text-xs text-gray-500">Expected net:</p>
                          <p className="font-bold text-green-700">₹{decision.net_realization?.toLocaleString() || '---'}</p>
                        </div>
                      </div>
                    )}
                    
                    {!decision.best_opportunity && (
                      <div className="bg-gray-50 rounded-xl p-3 mb-5 border border-gray-100 flex-1 flex flex-col justify-center items-center text-center">
                        <AlertCircle size={20} className="text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">No actionable buyer opportunity currently.</p>
                      </div>
                    )}

                    <Button 
                      variant="secondary" 
                      className="w-full mt-auto group-hover:bg-green-50 group-hover:border-green-200 group-hover:text-green-700 transition-colors"
                      onClick={() => navigate(`/farmer/decisions/${lot.id}`)}
                    >
                      {t('decisions.viewDecision', 'View Decision')}
                    </Button>
                  </div>
                ) : lot.status === 'DRAFT' ? (
                  <div className="flex-1 flex flex-col justify-center items-center py-6 text-center">
                    <p className="text-gray-500 text-sm mb-4">Complete lot details to get a recommendation.</p>
                    <Button variant="secondary" onClick={() => navigate(`/farmer/lots/${lot.id}`)}>
                      Complete Lot
                    </Button>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-center items-center py-6 text-center animate-pulse">
                    <RefreshCw size={24} className="text-gray-300 animate-spin mb-3" />
                    <p className="text-gray-400 text-sm">Analyzing market & opportunities...</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
