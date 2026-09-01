import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Lightbulb, Package, RefreshCcw, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { farmerLotsApi } from '../../services/farmerLotsApi';
import { decisionApi } from '../../services/decisionApi';
import type { DecisionResponse } from '../../services/decisionApi';
import { buildDecisionViewModel } from '../../services/decisionSupport/decisionViewModel';
import type { DecisionViewModel } from '../../services/decisionSupport/decisionViewModel';
import { supabase } from '../../lib/supabase';

const DISMISSED_DECISIONS_KEY = 'krishimitra_dismissed_decisions';
const actionTone = (action: DecisionViewModel['action']) => action === 'SELL_WITHIN_WINDOW' ? 'bg-[#E5F2E8] text-[#1B5E3C] border border-[#C9E1CE]' : action === 'CONSIDER_STORAGE' ? 'bg-[#FFF0E4] text-[#9C4221] border border-[#F4D7C3]' : 'bg-[#EEF3EA] text-[#49624B] border border-[#D9E5D9]';
const cardTone = (needsAttention: boolean) => needsAttention
  ? 'bg-gradient-to-br from-[#FFFCF8] via-white to-[#FFF4EA] border-[#F0D7BF] hover:border-[#D99A3E]'
  : 'bg-gradient-to-br from-[#FFFEFA] via-white to-[#F1F7F1] border-[#D9E6DA] hover:border-[#7FA58A]';
const dismissedIds = (): Set<string> => { try { return new Set(JSON.parse(localStorage.getItem(DISMISSED_DECISIONS_KEY) || '[]')); } catch { return new Set(); } };

export const MyDecisionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [models, setModels] = useState<DecisionViewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingRemoval, setPendingRemoval] = useState<DecisionViewModel | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const loadData = async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true); else setLoading(true);
      setError(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Please sign in to view your decisions.');
      const lots = await farmerLotsApi.list(session.access_token);
      const dismissed = dismissedIds();
      const resolved = await Promise.all(lots.filter(lot => lot.status !== 'DRAFT' && !dismissed.has(lot.id)).map(async lot => {
        let decision: DecisionResponse | null = null;
        try { decision = await decisionApi.getDecision(lot.id); } catch { /* Market resolver supplies an honest fallback. */ }
        return buildDecisionViewModel(lot, decision);
      }));
      setModels(resolved.sort((a, b) => Number(b.needsAttention) - Number(a.needsAttention) || Number(Boolean(b.buyer)) - Number(Boolean(a.buyer))));
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load decisions.'); }
    finally { setLoading(false); setRefreshing(false); }
  };
  useEffect(() => { void loadData(); }, []);
  useEffect(() => {
    if (!pendingRemoval) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setPendingRemoval(null); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [pendingRemoval]);
  const actionable = useMemo(() => models.filter(model => model.action !== 'MONITOR' || model.buyer || model.aggregation).length, [models]);
  const attention = useMemo(() => models.filter(model => model.needsAttention).length, [models]);
  const aggregation = useMemo(() => models.filter(model => model.aggregation).length, [models]);
  const removeDecision = () => {
    if (!pendingRemoval) return;
    const next = dismissedIds(); next.add(pendingRemoval.lot.id);
    localStorage.setItem(DISMISSED_DECISIONS_KEY, JSON.stringify(Array.from(next)));
    setModels(current => current.filter(model => model.lot.id !== pendingRemoval.lot.id)); setPendingRemoval(null); setNotice('Decision removed. Your original lot remains unchanged.');
  };
  if (loading) return <div className="p-8 max-w-7xl mx-auto space-y-6 animate-pulse"><div className="h-28 bg-gray-200 rounded-2xl" /><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="h-72 bg-gray-200 rounded-2xl" /><div className="h-72 bg-gray-200 rounded-2xl" /></div></div>;
  return <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
    <header className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50" />
      <div className="relative z-10"><div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center"><Lightbulb size={20} /></div><h1 className="text-2xl md:text-3xl font-display font-bold text-[#14532D]">MY DECISIONS</h1></div><p className="text-gray-600">Understand what to do with your produce.</p></div>
      <div className="relative z-10 flex flex-wrap items-center gap-3 bg-gray-50 rounded-xl p-4 border border-gray-200">
        {[['TOTAL LOTS', models.length, 'text-gray-900'], ['ACTIONABLE', actionable, 'text-green-600'], ['NEEDS ATTENTION', attention, 'text-amber-600'], ['GROUP OPTIONS', aggregation, 'text-blue-600']].map(([label, value, tone]) => <div key={String(label)} className="text-center px-3 border-r last:border-0 border-gray-200"><p className={`text-2xl font-bold ${tone}`}>{value}</p><p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</p></div>)}
        <button type="button" aria-label="Refresh decisions" onClick={() => void loadData(true)} disabled={refreshing} className="p-2 text-gray-400 hover:text-green-600 rounded-full hover:bg-white disabled:opacity-50"><RefreshCcw size={19} className={refreshing ? 'animate-spin' : ''} /></button>
      </div>
    </header>
    {notice && <div role="status" className="bg-green-50 text-green-800 p-3 rounded-xl border border-green-100 text-sm">{notice}</div>}
    {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 flex items-center justify-between gap-3"><span className="flex items-center gap-3"><AlertCircle size={20} />{error}</span><Button variant="secondary" onClick={() => void loadData()}>Try Again</Button></div>}
    {!error && models.length === 0 ? <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm"><div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><Package size={24} className="text-gray-400" /></div><h2 className="text-xl font-bold text-gray-900 mb-2">NO ACTIVE DECISIONS</h2><p className="text-gray-600 mb-6">Add or restore a lot to receive a market-based decision.</p><Button onClick={() => navigate('/farmer/lots')}>View My Lots</Button></div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {models.map(model => <article key={model.lot.id} className={`${cardTone(model.needsAttention)} rounded-2xl p-6 shadow-[0_2px_12px_rgba(28,68,43,0.06)] border hover:shadow-[0_12px_28px_rgba(28,68,43,0.12)] transition-all flex flex-col`}>
        <div className="flex justify-between gap-3"><div><h2 className="text-lg font-bold text-gray-900">{model.lot.crop}</h2><p className="text-sm text-gray-500">{model.lot.quantity} {model.lot.unit} · Grade {model.lot.qualityGrade || '—'} · {model.lot.location}</p></div><button type="button" aria-label={`Remove decision for ${model.lot.crop}`} title="Remove decision" onClick={() => setPendingRemoval(model)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full h-fit focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-700"><X size={18} /></button></div>
        <div className="mt-5"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Recommended action</p><span className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-bold ${actionTone(model.action)}`}>{model.actionLabel}</span></div>
        <div className="bg-white/70 rounded-xl p-4 mt-4 space-y-2 border border-[#E1EADF]"><p className="text-xs font-bold text-[#284A32]">{model.intelligence.selectedMarketName}</p><div className="flex justify-between text-sm"><span className="text-gray-500">Market price</span><span className="font-bold">₹{model.intelligence.snapshot.modal_price?.toLocaleString() || '—'}/q</span></div><div className="flex justify-between text-sm"><span className="text-gray-500">Estimated net</span><span className="font-bold text-[#1B5E3C]">{model.intelligence.netRealizationPerQuintal !== null ? `₹${Math.round(model.intelligence.netRealizationPerQuintal).toLocaleString()}/q` : 'Unavailable'}</span></div></div>
        <div className="flex flex-wrap gap-2 mt-4 text-[10px] font-bold uppercase tracking-wider"><span className="text-[#2D6A4F]">{model.intelligence.trend.direction === 'UP' ? '↑ Price momentum' : 'Market watch'}</span><span className="text-gray-400">•</span><span className="text-[#5A695A]">{model.intelligence.arrivalTrend === 'DECLINING' ? '↓ Arrivals' : 'Arrival data limited'}</span>{model.buyer && <><span className="text-gray-400">•</span><span className="text-[#2A6F77]">{model.buyer.matchPercent}% buyer match</span></>}{model.needsAttention && <><span className="text-gray-400">•</span><span className="text-[#A7572A]">Needs attention</span></>}</div>
        <div className="mt-auto pt-5"><div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-wider mb-3"><span>Confidence</span><span className="font-bold text-gray-800">{model.confidence}</span></div><Button variant="secondary" className="w-full" onClick={() => navigate(`/farmer/decisions/${model.lot.id}`)}>View Decision</Button></div>
      </article>)}
    </div>}
    {pendingRemoval && <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="remove-decision-title"><div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6"><h2 id="remove-decision-title" className="text-lg font-bold text-gray-900">Remove decision?</h2><p className="text-sm text-gray-600 mt-2">This will remove this decision from My Decisions. Your original farmer lot will remain unchanged.</p><div className="flex justify-end gap-3 mt-6"><Button variant="secondary" onClick={() => setPendingRemoval(null)}>Cancel</Button><Button onClick={removeDecision} className="bg-red-600 hover:bg-red-700">Remove</Button></div></div></div>}
  </div>;
};
