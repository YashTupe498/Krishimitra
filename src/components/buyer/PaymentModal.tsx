import React, { useState } from 'react';
import { CreditCard, Landmark, X } from 'lucide-react';
import { Button } from '../ui/Button';
import type { MarketplaceTransaction } from '../../types/marketplace';
import { buyerMarketplaceApi } from '../../services/buyerMarketplaceApi';

export const PaymentModal: React.FC<{
  transaction: MarketplaceTransaction;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ transaction, onClose, onSuccess }) => {
  const [method, setMethod] = useState<'UPI' | 'BANK'>('UPI');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [reference, setReference] = useState('');

  // Form states
  const [upiId, setUpiId] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNo, setAccountNo] = useState('');

  const processDemoPayment = async () => {
    // Simple validation
    if (method === 'UPI' && !upiId.trim()) {
      alert('Please enter a demo UPI ID');
      return;
    }
    if (method === 'BANK' && (!accountName.trim() || !accountNo.trim())) {
      alert('Please fill in demo bank details');
      return;
    }

    setLoading(true);
    try {
      // Process through existing demo service via API abstraction
      await buyerMarketplaceApi.processPayment(transaction.id);
      
      // We assume reference is generated in transactionDemoService, 
      // but we will generate a local one for the UI just to show if needed,
      // or we can just fetch the updated tx. We'll just show a generic success first.
      setReference(`PAY-DEMO-${Math.floor(10000 + Math.random() * 89999)}`);
      setSuccess(true);
      
      // Delay before calling onSuccess to let user see success state
      setTimeout(() => {
        onSuccess();
      }, 3000);
      
    } catch (e) {
      alert('Payment processing failed. Please try again.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white p-4 animate-in fade-in duration-300">
        <div className="max-w-md w-full text-center flex flex-col items-center justify-center h-full">
          <style>{`
            @keyframes scaleUp {
              0% { transform: scale(0); opacity: 0; }
              50% { transform: scale(1.1); opacity: 1; }
              100% { transform: scale(1); opacity: 1; }
            }
            @keyframes checkmark {
              0% { stroke-dashoffset: 48; }
              100% { stroke-dashoffset: 0; }
            }
            .success-circle {
              animation: scaleUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            }
            .success-check {
              stroke-dasharray: 48;
              stroke-dashoffset: 48;
              animation: checkmark 0.4s ease-out 0.4s forwards;
            }
          `}</style>
          
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(34,197,94,0.4)] success-circle">
            <svg viewBox="0 0 24 24" className="w-12 h-12 text-white" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" className="success-check"></polyline>
            </svg>
          </div>
          
          <h2 className="text-3xl font-black text-gray-900 mb-2 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-300 fill-mode-both">
            Payment Successful
          </h2>
          <div className="text-4xl font-mono font-black text-gray-900 mb-8 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-500 fill-mode-both">
            ₹{transaction.totalValue.toLocaleString('en-IN')}
          </div>
          
          <div className="w-full bg-gray-50 rounded-2xl p-5 text-left mb-8 animate-in slide-in-from-bottom-8 fade-in duration-500 delay-700 fill-mode-both border border-gray-100">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
              <div>
                <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Paid to</div>
                <div className="font-bold text-gray-900">KrishiMitra Escrow</div>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700">
                <Landmark size={20} />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Method</span>
                <span className="font-bold text-gray-900">{method === 'UPI' ? 'UPI' : 'Bank Transfer'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Ref No.</span>
                <span className="font-mono font-bold text-gray-900">{reference}</span>
              </div>
            </div>
          </div>
          
          <Button onClick={onSuccess} className="w-full h-12 rounded-full text-lg shadow-lg shadow-[#194D2E]/20 animate-in fade-in duration-500 delay-1000 fill-mode-both">
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              Payment Checkout
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 bg-amber-100 px-2 py-0.5 rounded border border-amber-200 mt-1 inline-block">
              Demo Mode
            </span>
          </div>
          <button onClick={onClose} disabled={loading} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 disabled:opacity-50">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
            <div className="flex justify-between items-end mb-2">
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Amount Payable</div>
              <div className="text-gray-500 font-mono text-xs">{transaction.id}</div>
            </div>
            <div className="text-3xl font-black text-gray-900 font-mono">
              ₹{transaction.totalValue.toLocaleString('en-IN')}
            </div>
          </div>
          
          <div className="mb-6">
            <label className="text-sm font-bold text-gray-900 block mb-3">Select Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setMethod('UPI')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${method === 'UPI' ? 'border-[#194D2E] bg-green-50 text-[#194D2E]' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
              >
                <CreditCard size={24} />
                <span className="font-bold text-sm">UPI</span>
              </button>
              <button 
                onClick={() => setMethod('BANK')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${method === 'BANK' ? 'border-[#194D2E] bg-green-50 text-[#194D2E]' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
              >
                <Landmark size={24} />
                <span className="font-bold text-sm">Bank Transfer</span>
              </button>
            </div>
          </div>
          
          {method === 'UPI' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">UPI ID (Demo)</label>
                <input 
                  type="text" 
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. farmerdemo@upi"
                  className="w-full p-3 rounded-xl border border-gray-300 focus:border-[#194D2E] focus:ring-1 focus:ring-[#194D2E] outline-none"
                />
              </div>
            </div>
          )}
          
          {method === 'BANK' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Account Holder Name (Demo)</label>
                <input 
                  type="text" 
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full p-3 rounded-xl border border-gray-300 focus:border-[#194D2E] focus:ring-1 focus:ring-[#194D2E] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Account Number (Demo)</label>
                <input 
                  type="text" 
                  value={accountNo}
                  onChange={(e) => setAccountNo(e.target.value)}
                  placeholder="e.g. 1234567890"
                  className="w-full p-3 rounded-xl border border-gray-300 focus:border-[#194D2E] focus:ring-1 focus:ring-[#194D2E] outline-none"
                />
              </div>
            </div>
          )}
          
          <div className="mt-6 bg-blue-50 border border-blue-100 p-3 rounded-lg text-xs text-blue-800">
            <strong>Note:</strong> This is a simulated payment for demonstration purposes. Do not enter real banking credentials or passwords.
          </div>
        </div>
        
        <div className="p-5 border-t border-gray-100 bg-gray-50">
          <Button 
            className="w-full h-12 text-lg" 
            onClick={processDemoPayment}
            disabled={loading}
          >
            {loading ? 'Processing Payment...' : 'Confirm Demo Payment'}
          </Button>
        </div>
      </div>
    </div>
  );
};
