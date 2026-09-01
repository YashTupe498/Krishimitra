import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CheckCircle2, Activity, FileText, MapPin, Briefcase } from 'lucide-react';
import { verificationDemoService, type VerificationProgress } from '../../../services/verificationDemoService';
import { transactionDemoService } from '../../../services/transactionDemoService';
import type { DemoTransaction } from '../../../types/transaction';
import { Button } from '../../ui/Button';

interface BuyerTrustModalProps {
  buyerId: string;
  buyerName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const BuyerTrustModal: React.FC<BuyerTrustModalProps> = ({ buyerId, buyerName, isOpen, onClose }) => {
  const [progress, setProgress] = useState<VerificationProgress | null>(null);
  const [transactions, setTransactions] = useState<DemoTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      // Fetch verification
      setProgress(verificationDemoService.getVerificationProgress(buyerId));
      
      // Fetch safe transaction history (simulating backend call that filters for authorized public history)
      const fetchTxs = async () => {
        try {
          const allTxs = await transactionDemoService.getAll('demo-farmer-id');
          // For demo, we just show a few recent transactions
          setTransactions(allTxs.slice(0, 3));
        } catch (e) {
          console.error("Failed to load transactions", e);
        } finally {
          setLoading(false);
        }
      };
      
      fetchTxs();
    }
  }, [isOpen, buyerId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-[#F5F8F5]">
          <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest flex items-center gap-1.5">
            <ShieldCheck size={14} /> Buyer Trust Profile
          </span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          
          {/* Buyer Identity */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-xl font-bold text-gray-500 shrink-0">
              {buyerName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{buyerName}</h2>
              <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                <span className="flex items-center gap-1"><Briefcase size={12} /> Trading Organization</span>
                <span className="flex items-center gap-1"><MapPin size={12} /> Maharashtra</span>
              </div>
            </div>
          </div>

          {/* Verification Status */}
          <div className="bg-[#F8FBFA] border border-[#E3EFE8] rounded-xl p-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 mb-3">
              <ShieldCheck size={14} className="text-brand-primary" /> Platform Verification
            </h3>
            
            {progress?.status === 'DEMO_VERIFIED' || progress?.isBackendVerified ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-black text-green-700 bg-green-50 w-max px-2.5 py-1 rounded">
                  <ShieldCheck size={16} /> DEMO VERIFIED BUYER
                </div>
                <ul className="space-y-2 text-xs text-gray-600 font-medium">
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500"/> Account created & verified</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500"/> Identity information submitted</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500"/> Business organization verified</li>
                </ul>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-black text-gray-700 bg-gray-100 w-max px-2.5 py-1 rounded">
                  UNVERIFIED BUYER
                </div>
                <p className="text-xs text-gray-500 font-medium">This buyer has not completed platform verification.</p>
              </div>
            )}
          </div>

          {/* Platform Activity */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 mb-3">
              <Activity size={14} className="text-brand-primary" /> Platform Activity
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="text-lg font-black text-gray-900">4</div>
                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Active Requirements</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="text-lg font-black text-gray-900">12</div>
                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Offers Sent</div>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 mb-3">
              <FileText size={14} className="text-brand-primary" /> Recent Transactions
            </h3>
            
            {loading ? (
              <div className="animate-pulse h-20 bg-gray-100 rounded-xl"></div>
            ) : transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map(tx => (
                  <div key={tx.id} className="bg-white border border-gray-100 shadow-sm rounded-xl p-3 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-xs font-bold text-gray-900 flex items-center gap-2">
                        {tx.id}
                        <span className="text-[8px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded uppercase">DEMO</span>
                      </span>
                      <span className="text-[10px] text-gray-500 font-medium">
                        {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-gray-900">{tx.crop || 'Crop'} • {tx.quantityKg?.toLocaleString() || 0} kg</span>
                      <span className="font-mono font-bold text-gray-700">₹{tx.agreedPricePerQ?.toLocaleString() || 0}/q</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${tx.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {tx.status}
                      </span>
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${tx.payment?.status === 'RECEIVED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {tx.payment?.status === 'RECEIVED' ? 'PAYMENT RECEIVED' : 'PAYMENT PENDING'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-xl text-center">No transaction history available.</p>
            )}
          </div>
          
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <Button onClick={onClose} className="w-full">Close Trust Profile</Button>
        </div>
      </div>
    </div>
  );
};
