import type { DemoTransaction, TxStatus, TxTimelineEvent } from '../types/transaction';
import { DEMO_TRANSACTIONS } from '../data/transactionDemoData';

const STORAGE_KEY = 'krishimitra_demo_transactions_global';

/** Valid forward transitions */
const NEXT_STATUS: Partial<Record<TxStatus, TxStatus>> = {
  OFFER_ACCEPTED: 'QUALITY_PENDING',
  QUALITY_PENDING: 'QUALITY_VERIFIED',
  QUALITY_VERIFIED: 'LOGISTICS_PENDING',
  LOGISTICS_PENDING: 'LOGISTICS_CONFIRMED',
  LOGISTICS_CONFIRMED: 'READY_FOR_DISPATCH',
  READY_FOR_DISPATCH: 'IN_TRANSIT',
  IN_TRANSIT: 'DELIVERED',
  DELIVERED: 'PAYMENT_PENDING',
  PAYMENT_PENDING: 'PAYMENT_INITIATED',
  PAYMENT_INITIATED: 'PAYMENT_RECEIVED',
  PAYMENT_RECEIVED: 'COMPLETED',
};

export const transactionDemoService = {
  getAll: async (userId?: string): Promise<DemoTransaction[]> => {
    await new Promise(r => setTimeout(r, 250));
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const local: DemoTransaction[] = raw ? JSON.parse(raw) : [];
      // Merge: local transactions first, then demo seeds not already in local
      const localIds = new Set(local.map(t => t.id));
      const merged = [...local, ...DEMO_TRANSACTIONS.filter(d => !localIds.has(d.id))];
      
      const filtered = userId ? merged.filter(t => t.farmerId === userId || t.buyerId === userId) : merged;
      // Hide old demo transactions created before Sept 1, 2026
      const cutoff = new Date('2026-08-30T00:00:00Z').getTime();
      const cutoffFiltered = filtered.filter(t => new Date(t.createdAt).getTime() > cutoff || t.isDemo); // Keep hardcoded demo seeds if needed, or hide them too. Actually let's just hide anything before cutoff if it's not explicitly a seed.
      
      return cutoffFiltered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } catch {
      return [...DEMO_TRANSACTIONS];
    }
  },

  getById: async (id: string, _userId: string): Promise<DemoTransaction | undefined> => {
    const all = await transactionDemoService.getAll();
    return all.find(t => t.id === id);
  },

  save: (transactions: DemoTransaction[]) => {
    // Only persist non-seed transactions
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions.filter(t => !DEMO_TRANSACTIONS.find(d => d.id === t.id) || true)));
  },

  updateStatus: async (id: string, _userId: string, newStatus: TxStatus, note?: string): Promise<DemoTransaction> => {
    await new Promise(r => setTimeout(r, 400));
    const all = await transactionDemoService.getAll();
    const idx = all.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('Transaction not found');

    const tx = { ...all[idx] };
    const prev = tx.status;

    // Validate transition
    if (newStatus !== 'DISPUTE') {
      const expected = NEXT_STATUS[prev];
      if (expected !== newStatus) throw new Error(`Invalid transition: ${prev} → ${newStatus}`);
    }

    const now = new Date().toISOString();
    tx.status = newStatus;
    tx.updatedAt = now;

    // Update timeline
    tx.timeline = tx.timeline.map(ev => {
      if (ev.status === newStatus) return { ...ev, state: 'CURRENT' as const, timestamp: now, note: note || ev.note };
      if (ev.state === 'CURRENT') return { ...ev, state: 'COMPLETED' as const };
      return ev;
    });

    // Update payment status
    if (newStatus === 'PAYMENT_PENDING') tx.payment = { ...tx.payment, status: 'PENDING' };
    if (newStatus === 'PAYMENT_INITIATED') tx.payment = { ...tx.payment, status: 'INITIATED' };

    all[idx] = tx;
    transactionDemoService.save(all);
    return tx;
  },

  markPaymentReceived: async (id: string, userId?: string): Promise<DemoTransaction> => {
    await new Promise(r => setTimeout(r, 600));
    const all = await transactionDemoService.getAll(userId);
    const idx = all.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('Transaction not found');

    const tx = { ...all[idx] };
    const now = new Date().toISOString();
    const ref = `PAY-DEMO-${Math.floor(10000 + Math.random() * 89999)}`;

    tx.status = 'PAYMENT_RECEIVED';
    tx.updatedAt = now;
    tx.payment = {
      ...tx.payment,
      amountPaid: tx.payment.totalValue,
      amountRemaining: 0,
      status: 'RECEIVED',
      reference: ref,
      paidAt: now,
    };
    tx.timeline = (tx.timeline || []).map((ev): TxTimelineEvent => {
      if (ev.status === 'PAYMENT_RECEIVED') return { ...ev, state: 'CURRENT', timestamp: now, note: `DEMO PAYMENT · ${ref}` };
      if (ev.state === 'CURRENT') return { ...ev, state: 'COMPLETED' };
      return ev;
    });

    if (!tx.timeline.find(ev => ev.status === 'PAYMENT_RECEIVED')) {
      tx.timeline.push({ status: 'PAYMENT_RECEIVED', label: 'Payment Received', state: 'CURRENT', timestamp: now, note: `DEMO PAYMENT · ${ref}` });
    }

    all[idx] = tx;
    transactionDemoService.save(all);
    return tx;
  },

  completeTransaction: async (id: string, userId: string): Promise<DemoTransaction> => {
    await new Promise(r => setTimeout(r, 400));
    const all = await transactionDemoService.getAll(userId);
    const idx = all.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('Transaction not found');

    const tx = { ...all[idx] };
    const now = new Date().toISOString();
    tx.status = 'COMPLETED';
    tx.updatedAt = now;
    tx.timeline = tx.timeline.map((ev): TxTimelineEvent => {
      if (ev.status === 'COMPLETED') return { ...ev, state: 'CURRENT', timestamp: now };
      if (ev.state === 'CURRENT') return { ...ev, state: 'COMPLETED' };
      return ev;
    });

    all[idx] = tx;
    transactionDemoService.save(all);
    return tx;
  },

  saveLogistics: async (id: string, userId: string, logistics: DemoTransaction['logistics']): Promise<DemoTransaction> => {
    await new Promise(r => setTimeout(r, 500));
    const all = await transactionDemoService.getAll(userId);
    const idx = all.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('Transaction not found');

    const tx = { ...all[idx], logistics, status: 'LOGISTICS_CONFIRMED' as TxStatus, updatedAt: new Date().toISOString() };
    const now = new Date().toISOString();
    tx.timeline = tx.timeline.map((ev): TxTimelineEvent => {
      if (ev.status === 'LOGISTICS_PENDING') return { ...ev, state: 'COMPLETED', timestamp: now };
      if (ev.status === 'LOGISTICS_CONFIRMED') return { ...ev, state: 'CURRENT', timestamp: now };
      return ev;
    });

    all[idx] = tx;
    transactionDemoService.save(all);
    return tx;
  },

  attachGrievance: async (id: string, userId: string, grievanceId: string): Promise<DemoTransaction> => {
    const all = await transactionDemoService.getAll(userId);
    const idx = all.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('Transaction not found');

    const tx = { ...all[idx], grievanceId, status: 'DISPUTE' as TxStatus, updatedAt: new Date().toISOString() };
    tx.payment = { ...tx.payment, status: 'DISPUTED' };
    tx.timeline = tx.timeline.map((ev): TxTimelineEvent => {
      if (ev.status === 'DISPUTE') return { ...ev, state: 'CURRENT', timestamp: new Date().toISOString(), note: `Grievance ${grievanceId} filed` };
      return ev;
    });

    all[idx] = tx;
    transactionDemoService.save(all);
    return tx;
  },

  generateId: (): string => `TM-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 899999)}`,
};

/** Compute summary stats from a list of transactions */
export const computeStats = (txns: DemoTransaction[]) => {
  const active = txns.filter(t => !['COMPLETED', 'DISPUTE'].includes(t.status)).length;
  const completed = txns.filter(t => t.status === 'COMPLETED').length;
  const paymentPending = txns.filter(t => ['PAYMENT_PENDING', 'PAYMENT_INITIATED'].includes(t.status)).length;
  const totalValue = txns.reduce((s, t) => s + t.totalValue, 0);
  return { active, completed, paymentPending, totalValue };
};

/** Human-readable status label */
export const statusLabel = (s: TxStatus): string => ({
  OFFER_ACCEPTED: 'Offer Accepted',
  QUALITY_PENDING: 'Quality Pending',
  QUALITY_VERIFIED: 'Quality Verified',
  LOGISTICS_PENDING: 'Logistics Pending',
  LOGISTICS_CONFIRMED: 'Logistics Confirmed',
  READY_FOR_DISPATCH: 'Ready for Dispatch',
  IN_TRANSIT: 'In Transit',
  DELIVERED: 'Delivered',
  PAYMENT_PENDING: 'Payment Pending',
  PAYMENT_INITIATED: 'Payment Initiated',
  PAYMENT_RECEIVED: 'Payment Received',
  COMPLETED: 'Completed',
  DISPUTE: 'Dispute',
}[s] || s);

export const statusColor = (s: TxStatus): string => ({
  OFFER_ACCEPTED: 'bg-blue-50 text-blue-700 border-blue-200',
  QUALITY_PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  QUALITY_VERIFIED: 'bg-teal-50 text-teal-700 border-teal-200',
  LOGISTICS_PENDING: 'bg-orange-50 text-orange-700 border-orange-200',
  LOGISTICS_CONFIRMED: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  READY_FOR_DISPATCH: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  IN_TRANSIT: 'bg-blue-50 text-blue-700 border-blue-200',
  DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PAYMENT_PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  PAYMENT_INITIATED: 'bg-purple-50 text-purple-700 border-purple-200',
  PAYMENT_RECEIVED: 'bg-green-50 text-green-700 border-green-200',
  COMPLETED: 'bg-[#EDF7F0] text-[#194D2E] border-[#A8D5B5]',
  DISPUTE: 'bg-red-50 text-red-700 border-red-200',
}[s] || 'bg-gray-100 text-gray-600 border-gray-200');

export const paymentStatusColor = (s: string): string => ({
  PENDING: 'bg-amber-50 text-amber-700',
  INITIATED: 'bg-purple-50 text-purple-700',
  PARTIALLY_PAID: 'bg-orange-50 text-orange-700',
  RECEIVED: 'bg-green-50 text-green-700',
  DISPUTED: 'bg-red-50 text-red-700',
  NOT_APPLICABLE: 'bg-gray-50 text-gray-500',
}[s] || 'bg-gray-50 text-gray-500');
