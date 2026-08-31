import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, ChevronRight, Search, Filter, TrendingUp,
  CheckCircle2, Clock, AlertTriangle, IndianRupee,
  ArrowUpRight, Leaf
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { transactionDemoService, computeStats, statusLabel, statusColor, paymentStatusColor } from '../../services/transactionDemoService';
import type { DemoTransaction, TxStatus } from '../../types/transaction';

const CROP_EMOJI: Record<string, string> = { Onion: '🧅', Potato: '🥔', Tomato: '🍅', Wheat: '🌾', Rice: '🌾' };

const STATUS_FILTERS: Array<{ label: string; value: TxStatus | 'ALL' | 'ACTIVE' | 'PAYMENT' }> = [
  { label: 'All', value: 'ALL' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Payment Due', value: 'PAYMENT' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Dispute', value: 'DISPUTE' },
];

export const FarmerTransactionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>('demo-farmer-id');
  const [transactions, setTransactions] = useState<DemoTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PAYMENT' | TxStatus>('ALL');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) setUserId(session.user.id);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    transactionDemoService.getAll(userId).then(data => {
      setTransactions(data);
      setLoading(false);
    });
  }, [userId]);

  const stats = useMemo(() => computeStats(transactions), [transactions]);

  const filtered = useMemo(() => {
    let list = transactions;

    // Status filter
    if (statusFilter === 'ACTIVE') {
      list = list.filter(t => !['COMPLETED', 'DISPUTE'].includes(t.status));
    } else if (statusFilter === 'PAYMENT') {
      list = list.filter(t => ['PAYMENT_PENDING', 'PAYMENT_INITIATED'].includes(t.status));
    } else if (statusFilter !== 'ALL') {
      list = list.filter(t => t.status === statusFilter);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.id.toLowerCase().includes(q) ||
        t.crop.toLowerCase().includes(q) ||
        t.buyerName.toLowerCase().includes(q) ||
        t.marketName.toLowerCase().includes(q)
      );
    }

    return list;
  }, [transactions, statusFilter, search]);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const fmtCurrency = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 pb-20 pt-4">

      {/* ── Header ── */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Transactions</h1>
            <p className="text-sm text-gray-500 mt-0.5">Track your produce from accepted offer to delivery and payment.</p>
          </div>
          <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-full uppercase tracking-widest">Demo Mode</span>
        </div>
      </div>

      {/* ── Summary Strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Active', value: stats.active, icon: <Clock size={14} />, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Completed', value: stats.completed, icon: <CheckCircle2 size={14} />, color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'Payment Pending', value: stats.paymentPending, icon: <IndianRupee size={14} />, color: 'text-amber-700', bg: 'bg-amber-50' },
          { label: 'Total Value', value: fmtCurrency(stats.totalValue), icon: <TrendingUp size={14} />, color: 'text-[#194D2E]', bg: 'bg-[#EDF7F0]' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_6px_rgba(0,0,0,0.04)] p-4">
            <div className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest ${s.color} mb-2`}>
              {s.icon}{s.label}
            </div>
            <div className={`text-xl font-black ${s.color}`}>{typeof s.value === 'number' ? s.value : s.value}</div>
          </div>
        ))}
      </div>

      {/* ── Search + Filter ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by ID, crop, buyer…"
            className="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-[#194D2E]/20 focus:border-[#194D2E]/40 transition"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value as typeof statusFilter)}
              className={`whitespace-nowrap px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                statusFilter === f.value
                  ? 'bg-[#194D2E] text-white border-[#194D2E]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-[#194D2E]/40'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/4" />
            </div>
          ))}
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="text-5xl mb-4">🌾</div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">No Transactions Yet</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
            Your completed offers will appear here once a buyer accepts your produce lot.
          </p>
          <button
            onClick={() => navigate('/farmer/offers/opportunities')}
            className="inline-flex items-center gap-2 bg-[#194D2E] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#133d24] transition"
          >
            <ArrowUpRight size={15} /> View Opportunities
          </button>
        </div>
      )}

      {/* ── Transaction List ── */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map(tx => {
            const isDispute = tx.status === 'DISPUTE';
            const isCompleted = tx.status === 'COMPLETED';
            return (
              <div
                key={tx.id}
                onClick={() => navigate(`/farmer/transactions/${tx.id}`)}
                className={`bg-white rounded-2xl border shadow-[0_1px_6px_rgba(0,0,0,0.04)] p-5 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(25,77,46,0.1)] hover:border-[#194D2E]/30 group ${
                  isDispute ? 'border-red-200' : isCompleted ? 'border-green-200' : 'border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                      isDispute ? 'bg-red-50' : isCompleted ? 'bg-green-50' : 'bg-[#EDF7F0]'
                    }`}>
                      {CROP_EMOJI[tx.crop] || <Leaf size={20} className="text-[#194D2E]" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-gray-400 font-mono">{tx.id}</span>
                        {tx.isDemo && <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Demo</span>}
                      </div>
                      <h3 className="text-base font-black text-gray-900 mt-0.5">{tx.crop}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {tx.quantityKg.toLocaleString()} kg · Grade {tx.grade} · {tx.marketName}
                      </p>
                      <p className="text-xs font-semibold text-gray-700 mt-1">
                        {tx.buyerVerified && <span className="text-green-600 mr-1">✓</span>}
                        {tx.buyerName}
                      </p>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-lg font-black text-gray-900">₹{tx.totalValue.toLocaleString()}</div>
                    <div className="text-[10px] text-gray-400 font-medium">₹{tx.agreedPricePerQ}/q</div>
                    <div className="mt-2 flex flex-col items-end gap-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${statusColor(tx.status)}`}>
                        {statusLabel(tx.status)}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${paymentStatusColor(tx.payment.status)}`}>
                        {tx.payment.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">Updated {fmtDate(tx.updatedAt)}</span>
                  <span className="text-[10px] font-bold text-[#194D2E] flex items-center gap-1 group-hover:gap-2 transition-all">
                    View Transaction <ChevronRight size={12} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
