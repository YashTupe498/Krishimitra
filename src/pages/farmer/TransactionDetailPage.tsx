import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Package, Truck, CheckCircle2,
  Clock, AlertTriangle, FileText, ShieldCheck,
  ArrowUpRight, Scale, ArrowRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { transactionDemoService, statusLabel, statusColor, paymentStatusColor } from '../../services/transactionDemoService';
import type { DemoTransaction } from '../../types/transaction';
import { Button } from '../../components/ui/Button';

// Utility to format dates
const fmtDate = (iso?: string) => iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Pending';
const fmtCurrency = (n?: number) => n !== undefined ? `₹${n.toLocaleString('en-IN')}` : 'Unavailable';

export const TransactionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>('demo-farmer-id');
  const [tx, setTx] = useState<DemoTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TIMELINE' | 'QUALITY' | 'LOGISTICS' | 'PAYMENT' | 'DISPUTE'>('OVERVIEW');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) setUserId(session.user.id);
    });
  }, []);

  useEffect(() => {
    if (id) {
      setLoading(true);
      transactionDemoService.getById(id, userId).then(data => {
        setTx(data || null);
        setLoading(false);
      });
    }
  }, [id, userId]);

  const handleAction = async (action: 'DISPATCH' | 'DELIVER' | 'PAY' | 'RESOLVE') => {
    if (!tx || !id) return;
    setUpdating(true);
    try {
      if (action === 'DISPATCH') await transactionDemoService.updateStatus(id, userId, 'IN_TRANSIT', 'Produce marked as dispatched (Demo)');
      if (action === 'DELIVER') await transactionDemoService.updateStatus(id, userId, 'DELIVERED', 'Delivery confirmed (Demo)');
      if (action === 'PAY') await transactionDemoService.markPaymentReceived(id, userId);
      
      const refreshed = await transactionDemoService.getById(id, userId);
      setTx(refreshed || null);
    } catch (e) {
      console.error(e);
      alert('Action failed.');
    } finally {
      setUpdating(false);
    }
  };

  const reportIssue = async () => {
    if (!tx || !id) return;
    // Connect to grievance demo workflow
    const grievanceId = `KM-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 899999)}`;
    setUpdating(true);
    try {
      await transactionDemoService.attachGrievance(id, userId, grievanceId);
      const refreshed = await transactionDemoService.getById(id, userId);
      setTx(refreshed || null);
      setActiveTab('DISPUTE');
    } catch(e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto p-8 animate-pulse space-y-6">
      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
      <div className="h-32 bg-gray-200 rounded-2xl w-full"></div>
      <div className="h-64 bg-gray-200 rounded-2xl w-full"></div>
    </div>
  );

  if (!tx) return (
    <div className="max-w-4xl mx-auto p-8 text-center">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Transaction Not Found</h2>
      <Button onClick={() => navigate('/farmer/transactions')}>Back to Transactions</Button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 pb-24 pt-4">
      
      {/* ── Back & Header ── */}
      <button 
        onClick={() => navigate('/farmer/transactions')}
        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#194D2E] transition mb-6"
      >
        <ArrowLeft size={16} /> Back to Transactions
      </button>

      {/* ── Top Summary Card ── */}
      <div className={`bg-white rounded-2xl border shadow-sm p-6 mb-6 ${tx.status === 'DISPUTE' ? 'border-red-200 shadow-red-500/5' : 'border-gray-200'}`}>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-bold text-gray-400 font-mono tracking-wide">{tx.id}</span>
              {tx.isDemo && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase font-bold tracking-widest">Demo</span>}
            </div>
            
            <h1 className="text-3xl font-black text-[#14532D] mb-1">{tx.crop} · {tx.quantityKg.toLocaleString()} kg</h1>
            
            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium mb-4">
              <span>Grade {tx.grade}</span>
              <span className="text-gray-300">•</span>
              <span className="flex items-center gap-1 group relative cursor-pointer">
                {tx.buyerVerified && <ShieldCheck size={14} className="text-green-600" />}
                {tx.buyerName}
                {tx.buyerVerificationDetails && (
                  <div className="absolute top-full left-0 mt-2 bg-gray-900 text-white text-xs p-3 rounded-lg w-48 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none shadow-lg">
                    <div className="font-bold mb-2">Verified Buyer</div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2"><CheckCircle2 size={12} className="text-green-400" /> Identity verified</div>
                      <div className="flex items-center gap-2"><CheckCircle2 size={12} className="text-green-400" /> Contact verified</div>
                      <div className="flex items-center gap-2"><CheckCircle2 size={12} className="text-green-400" /> Profile verified</div>
                    </div>
                  </div>
                )}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${statusColor(tx.status)}`}>
                {statusLabel(tx.status)}
              </span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${paymentStatusColor(tx.payment.status)}`}>
                Payment: {tx.payment.status.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          <div className="md:text-right bg-gray-50 p-4 rounded-xl border border-gray-100 min-w-[200px]">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Sale Value</div>
            <div className="text-3xl font-black text-gray-900 mb-3">{fmtCurrency(tx.totalValue)}</div>
            
            <div className="flex justify-between items-center text-xs border-t border-gray-200 pt-2 mb-1">
              <span className="text-gray-500 font-medium">Agreed Price</span>
              <span className="font-bold text-gray-900">{fmtCurrency(tx.agreedPricePerQ)}/q</span>
            </div>
            {tx.netRealizationRs !== undefined && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#194D2E] font-bold">Net Realization</span>
                <span className="font-bold text-[#194D2E]">{fmtCurrency(tx.netRealizationRs)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex overflow-x-auto gap-1 border-b border-gray-200 mb-6 pb-px hide-scrollbar">
        {[
          { id: 'OVERVIEW', label: 'Overview' },
          { id: 'TIMELINE', label: 'Timeline' },
          { id: 'QUALITY', label: 'Quality' },
          { id: 'LOGISTICS', label: 'Logistics' },
          { id: 'PAYMENT', label: 'Payment' },
          { id: 'DISPUTE', label: 'Issue / Dispute' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2.5 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id 
                ? 'border-[#194D2E] text-[#194D2E]' 
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {activeTab === 'OVERVIEW' && (
            <>
              {/* Connection section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
                    <FileText size={14} /> Digital Offer
                  </div>
                  <div className="text-sm font-bold text-gray-900 mb-1">{tx.offerId}</div>
                  <div className="text-xs text-gray-500 mb-3">Accepted {fmtDate(tx.offerAcceptedAt)}</div>
                  <button onClick={() => navigate('/farmer/offers')} className="text-xs font-bold text-[#194D2E] hover:underline flex items-center gap-1">
                    View Offer <ArrowUpRight size={12} />
                  </button>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
                    <Package size={14} /> Source Lot
                  </div>
                  <div className="text-sm font-bold text-gray-900 mb-1">{tx.lotId}</div>
                  <div className="text-xs text-gray-500 mb-3">{tx.crop} · {tx.quantityKg} kg</div>
                  <button onClick={() => navigate(`/farmer/lots/${tx.lotId}`)} className="text-xs font-bold text-[#194D2E] hover:underline flex items-center gap-1">
                    View Lot <ArrowUpRight size={12} />
                  </button>
                </div>
              </div>

              {/* Price Realization & Transaction Costs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tx.marketPricePerQ && (
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Price Realization</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Market Intelligence ({tx.marketName})</span>
                        <span className="font-mono text-gray-900">{fmtCurrency(tx.marketPricePerQ)}/q</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Agreed Buyer Offer</span>
                        <span className="font-mono font-bold text-gray-900">{fmtCurrency(tx.agreedPricePerQ)}/q</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Difference</span>
                        <span className={`font-mono font-bold ${tx.agreedPricePerQ >= tx.marketPricePerQ ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.agreedPricePerQ >= tx.marketPricePerQ ? '+' : ''}{fmtCurrency(tx.agreedPricePerQ - tx.marketPricePerQ)}/q
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 text-[10px] text-gray-500 bg-gray-50 p-2 rounded">
                      The agreed buyer price is {fmtCurrency(Math.abs(tx.agreedPricePerQ - tx.marketPricePerQ))}/q {tx.agreedPricePerQ >= tx.marketPricePerQ ? 'above' : 'below'} the referenced market price.
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Transaction Cost & Net Realization</h3>
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Sale Value</span>
                      <span className="font-mono text-gray-900">{fmtCurrency(tx.totalValue)}</span>
                    </div>
                    {tx.transportCostRs !== undefined ? (
                      <>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Transport</span>
                          <span className="font-mono text-red-600">− {fmtCurrency(tx.transportCostRs)}</span>
                        </div>
                        {tx.handlingCostRs !== undefined && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Handling</span>
                            <span className="font-mono text-red-600">− {fmtCurrency(tx.handlingCostRs)}</span>
                          </div>
                        )}
                        {tx.otherCostRs !== undefined && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Other Charges</span>
                            <span className="font-mono text-red-600">− {fmtCurrency(tx.otherCostRs)}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-xs text-gray-400 italic">Transaction cost details unavailable</div>
                    )}
                  </div>
                  {tx.netRealizationRs !== undefined && (
                    <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-sm">
                      <span className="font-bold text-[#194D2E]">Net Realization</span>
                      <span className="font-mono font-bold text-[#194D2E]">{fmtCurrency(tx.netRealizationRs)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity Reconciliation */}
              {tx.dispatchedQuantityKg !== undefined && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Quantity Reconciliation</h3>
                  <div className="flex flex-wrap gap-6 items-center">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Agreed Quantity</div>
                      <div className="text-sm font-bold">{tx.quantityKg.toLocaleString()} kg</div>
                    </div>
                    <ArrowRight size={14} className="text-gray-300" />
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Dispatched</div>
                      <div className="text-sm font-bold">{tx.dispatchedQuantityKg.toLocaleString()} kg</div>
                    </div>
                    <ArrowRight size={14} className="text-gray-300" />
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Delivered</div>
                      <div className="text-sm font-bold">{tx.deliveredQuantityKg?.toLocaleString() || '—'} kg</div>
                    </div>
                    <ArrowRight size={14} className="text-gray-300" />
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Accepted</div>
                      <div className="text-sm font-bold">{tx.acceptedQuantityKg?.toLocaleString() || '—'} kg</div>
                    </div>
                  </div>
                  
                  {tx.acceptedQuantityKg !== undefined && tx.acceptedQuantityKg !== tx.quantityKg && (
                    <div className="mt-4 p-3 bg-amber-50 text-amber-800 text-sm border border-amber-200 rounded-lg flex items-center gap-2">
                      <AlertTriangle size={16} /> Discrepancy of {Math.abs(tx.quantityKg - tx.acceptedQuantityKg)} kg detected between agreed and accepted quantity.
                    </div>
                  )}
                  {tx.acceptedQuantityKg !== undefined && tx.acceptedQuantityKg === tx.quantityKg && (
                    <div className="mt-4 text-xs font-bold text-green-700 flex items-center gap-1">
                      <CheckCircle2 size={14} /> Quantity fully reconciled
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {activeTab === 'TIMELINE' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-black text-gray-900 mb-6">Transaction Timeline</h3>
              <div className="relative pl-4 space-y-6">
                <div className="absolute top-2 bottom-2 left-5 w-0.5 bg-gray-100"></div>
                {tx.timeline.map((ev, i) => {
                  const isCurrent = ev.state === 'CURRENT';
                  const isDone = ev.state === 'COMPLETED';
                  
                  return (
                    <div key={i} className={`relative flex items-start gap-4 ${ev.state === 'PENDING' ? 'opacity-40' : ''}`}>
                      <div className={`w-3 h-3 rounded-full mt-1.5 z-10 border-2 ${
                        isCurrent ? 'bg-[#194D2E] border-[#194D2E] ring-4 ring-[#194D2E]/20' : 
                        isDone ? 'bg-[#194D2E] border-[#194D2E]' : 
                        'bg-white border-gray-300'
                      }`} />
                      <div>
                        <div className={`font-bold text-sm ${isCurrent ? 'text-[#194D2E]' : 'text-gray-900'}`}>{ev.label}</div>
                        {ev.timestamp && <div className="text-xs text-gray-500 mt-0.5">{fmtDate(ev.timestamp)}</div>}
                        {ev.note && <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded mt-1 border border-gray-100">{ev.note}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'QUALITY' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-gray-900">Quality Grading</h3>
                {tx.quality.verified ? (
                  <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Verified
                  </span>
                ) : (
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200 flex items-center gap-1">
                    <Clock size={12} /> Pending Verification
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Grade</div>
                  <div className="text-lg font-black text-gray-900">{tx.quality.grade}</div>
                </div>
                {tx.quality.moisture && (
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Moisture</div>
                    <div className="text-base font-bold text-gray-900">{tx.quality.moisture}</div>
                  </div>
                )}
                {tx.quality.foreignMatter && (
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Foreign Matter</div>
                    <div className="text-base font-bold text-gray-900">{tx.quality.foreignMatter}</div>
                  </div>
                )}
                {tx.quality.size && (
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 sm:col-span-1 col-span-2">
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Size Range</div>
                    <div className="text-sm font-bold text-gray-900">{tx.quality.size}</div>
                  </div>
                )}
              </div>
              
              {tx.quality.notes && (
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <span className="font-bold text-gray-900 mr-2">Notes:</span>
                  {tx.quality.notes}
                </div>
              )}
            </div>
          )}

          {activeTab === 'LOGISTICS' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-black text-gray-900 mb-6">Logistics & Transport</h3>
              
              {tx.logistics ? (
                <div className="space-y-6">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mb-1" />
                      <div className="w-px h-8 bg-gray-200" />
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-1" />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pickup</div>
                        <div className="text-sm font-bold text-gray-900">{tx.logistics.pickupLocation}</div>
                        <div className="text-xs text-gray-500">{fmtDate(tx.logistics.expectedPickup)}</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Destination</div>
                        <div className="text-sm font-bold text-gray-900">{tx.logistics.destination}</div>
                        <div className="text-xs text-gray-500">{fmtDate(tx.logistics.expectedDelivery)}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Provider</div>
                      <div className="text-sm font-bold text-gray-900">{tx.logistics.transportProvider || 'Farmer arranged'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Vehicle</div>
                      <div className="text-sm font-bold text-gray-900">{tx.logistics.vehicle || 'Not specified'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Cost</div>
                      <div className="text-sm font-bold text-gray-900">{fmtCurrency(tx.logistics.actualCostRs || tx.logistics.estimatedCostRs)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Status</div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border uppercase ${
                        tx.logistics.status === 'DELIVERED' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>{tx.logistics.status}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Truck size={32} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-sm font-bold text-gray-700 mb-1">Logistics Data Unavailable</p>
                  <p className="text-xs text-gray-500">Transport details have not been finalized yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'PAYMENT' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-black text-gray-900 mb-6">Payment Tracking</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Total Due</div>
                  <div className="text-xl font-black text-gray-900">{fmtCurrency(tx.payment.totalValue)}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Received</div>
                  <div className="text-xl font-black text-green-700">{fmtCurrency(tx.payment.amountPaid)}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Remaining</div>
                  <div className="text-xl font-black text-amber-700">{fmtCurrency(tx.payment.amountRemaining)}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-3">
                  <span className="text-gray-500">Status</span>
                  <span className={`font-bold ${tx.payment.status === 'RECEIVED' ? 'text-green-700' : 'text-gray-900'}`}>
                    {tx.payment.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-3">
                  <span className="text-gray-500">Due Date</span>
                  <span className="font-bold text-gray-900">{tx.payment.dueDate ? fmtDate(tx.payment.dueDate) : 'On delivery'}</span>
                </div>
                {tx.payment.paidAt && (
                  <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-3">
                    <span className="text-gray-500">Paid At</span>
                    <span className="font-bold text-gray-900">{fmtDate(tx.payment.paidAt)}</span>
                  </div>
                )}
                {tx.payment.method && (
                  <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-3">
                    <span className="text-gray-500">Method</span>
                    <span className="font-bold text-gray-900">{tx.payment.method}</span>
                  </div>
                )}
                {tx.payment.reference && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Reference No.</span>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{tx.payment.reference}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'DISPUTE' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-black text-gray-900 mb-4">Having a problem?</h3>
              
              {tx.status === 'DISPUTE' && tx.grievanceDetails ? (
                <div className="bg-red-50 border border-red-200 p-5 rounded-xl">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle className="text-red-600 mt-0.5" size={20} />
                    <div>
                      <h4 className="font-bold text-red-900">Active Dispute</h4>
                      <p className="text-sm text-red-700 mt-1">A grievance has been registered for this transaction.</p>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-red-100 mb-4 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Grievance ID:</span>
                      <span className="font-mono font-bold text-gray-900">{tx.grievanceId}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Issue Type:</span>
                      <span className="font-bold text-gray-900">{tx.grievanceDetails.issueType}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Priority:</span>
                      <span className="font-bold text-red-600">{tx.grievanceDetails.priority}</span>
                    </div>
                    <div className="text-sm text-gray-600 pt-2 border-t border-red-50">
                      <span className="font-bold text-gray-900">Description:</span> {tx.grievanceDetails.description}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-amber-200 mb-4 space-y-2">
                    <div className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1"><ShieldCheck size={14} /> AI Assessment</div>
                    <div className="text-sm text-gray-800"><span className="font-semibold">Classification:</span> {tx.grievanceDetails.aiClassification}</div>
                    <div className="text-sm text-gray-800"><span className="font-semibold">Recommended Next Step:</span> {tx.grievanceDetails.recommendedNextStep}</div>
                  </div>

                  <Button variant="secondary" className="w-full bg-white text-red-700 border-red-200 hover:bg-red-50" onClick={() => navigate('/farmer/issues')}>
                    Track Grievance / Resolution
                  </Button>
                </div>
              ) : tx.status === 'DISPUTE' || tx.grievanceId ? (
                <div className="bg-red-50 border border-red-200 p-5 rounded-xl">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle className="text-red-600 mt-0.5" size={20} />
                    <div>
                      <h4 className="font-bold text-red-900">Active Dispute</h4>
                      <p className="text-sm text-red-700 mt-1">A grievance has been registered for this transaction.</p>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-red-100 mb-4 text-sm flex justify-between items-center">
                    <span className="text-gray-600">Grievance ID:</span>
                    <span className="font-mono font-bold">{tx.grievanceId}</span>
                  </div>
                  <Button variant="secondary" className="w-full bg-white text-red-700 border-red-200 hover:bg-red-50" onClick={() => navigate('/farmer/issues')}>
                    Track Grievance / Resolution
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">If you encounter issues with payment, quality rejection, or logistics, you can raise a grievance. This transaction will be automatically attached.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button onClick={reportIssue} disabled={updating} className="text-left p-4 rounded-xl border border-gray-200 hover:border-amber-400 hover:bg-amber-50 transition group">
                      <div className="font-bold text-sm text-gray-900 mb-1 group-hover:text-amber-800">Payment Issue</div>
                      <div className="text-xs text-gray-500">Buyer hasn't paid or paid less than agreed</div>
                    </button>
                    <button onClick={reportIssue} disabled={updating} className="text-left p-4 rounded-xl border border-gray-200 hover:border-amber-400 hover:bg-amber-50 transition group">
                      <div className="font-bold text-sm text-gray-900 mb-1 group-hover:text-amber-800">Quality Dispute</div>
                      <div className="text-xs text-gray-500">Produce rejected or downgraded at delivery</div>
                    </button>
                    <button onClick={reportIssue} disabled={updating} className="text-left p-4 rounded-xl border border-gray-200 hover:border-amber-400 hover:bg-amber-50 transition group">
                      <div className="font-bold text-sm text-gray-900 mb-1 group-hover:text-amber-800">Logistics Issue</div>
                      <div className="text-xs text-gray-500">Transport delayed or produce damaged</div>
                    </button>
                    <button onClick={reportIssue} disabled={updating} className="text-left p-4 rounded-xl border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition group">
                      <div className="font-bold text-sm text-gray-900 mb-1">Other Issue</div>
                      <div className="text-xs text-gray-500">Report any other transaction problem</div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* ── Actions Sidebar ── */}
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Actions</h3>
            
            <div className="space-y-3">
              {tx.status === 'READY_FOR_DISPATCH' && (
                <Button className="w-full" onClick={() => handleAction('DISPATCH')} disabled={updating}>
                  Mark as Dispatched (Demo)
                </Button>
              )}
              
              {tx.status === 'IN_TRANSIT' && (
                <Button className="w-full" onClick={() => handleAction('DELIVER')} disabled={updating}>
                  Mark Delivered (Demo)
                </Button>
              )}
              
              {(tx.status === 'DELIVERED' || tx.status === 'PAYMENT_PENDING' || tx.status === 'PAYMENT_INITIATED') && (
                <Button className="w-full" variant="secondary" onClick={() => handleAction('PAY')} disabled={updating}>
                  Simulate Payment Received
                </Button>
              )}

              {tx.status === 'DISPUTE' && (
                <Button className="w-full" variant="secondary" onClick={() => navigate('/farmer/issues')}>
                  View Grievance
                </Button>
              )}

              {tx.status === 'COMPLETED' && (
                <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm font-bold">
                  Transaction Completed
                </div>
              )}

              {['QUALITY_PENDING', 'LOGISTICS_PENDING'].includes(tx.status) && (
                <div className="text-center p-3 text-sm text-gray-500">
                  Waiting for external updates...
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-5">
             <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                <Scale size={14} /> Transparent Record
             </div>
             <p className="text-xs text-gray-500 mb-3">This transaction record is immutable and serves as verified proof of trade.</p>
             <div className="text-[10px] text-gray-400 font-mono break-all bg-gray-50 p-2 rounded">
               {tx.id} • {tx.updatedAt}
             </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};
