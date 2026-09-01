import React from 'react';
import { ArrowRight, Tag, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '../../ui/Button';
import type { AugmentedOffer } from '../../../services/offerDemoService';
import { BuyerVerificationBadge } from '../../buyer/BuyerVerificationBadge';
import { BuyerTrustModal } from './BuyerTrustModal';
import { useState } from 'react';

export const OfferStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'ACCEPTED': return { color: 'text-green-700 bg-green-50 border-green-200', icon: CheckCircle2, label: 'Accepted' };
      case 'SENT': return { color: 'text-blue-700 bg-blue-50 border-blue-200', icon: Clock, label: 'Pending Response' };
      case 'RECEIVED': return { color: 'text-purple-700 bg-purple-50 border-purple-200', icon: ArrowRight, label: 'Received Offer' };
      case 'REJECTED': return { color: 'text-red-700 bg-red-50 border-red-200', icon: AlertTriangle, label: 'Rejected' };
      case 'EXPIRED': return { color: 'text-gray-700 bg-gray-50 border-gray-200', icon: Clock, label: 'Expired' };
      default: return { color: 'text-gray-700 bg-gray-50 border-gray-200', icon: Clock, label: status };
    }
  };
  
  const config = getStatusConfig();
  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${config.color}`}>
      <Icon size={14} />
      {config.label}
    </span>
  );
};

export const OfferCard: React.FC<{
  offer: AugmentedOffer;
  onView: (offer: AugmentedOffer) => void;
  onAccept?: (offer: AugmentedOffer) => void;
  onReject?: (offer: AugmentedOffer) => void;
  type: 'sent' | 'received' | 'history';
}> = ({ offer, onView, onAccept, onReject, type }) => {
  const { buyerProfile, requirement, isDemo } = offer;
  
  const [isTrustModalOpen, setIsTrustModalOpen] = useState(false);
  
  // Fake market reference for SIH demo to show price realization
  const marketRef = offer.pricePerQuintal - (offer.status === 'REJECTED' ? -50 : 150); 
  const diff = offer.pricePerQuintal - marketRef;
  const isPositive = diff >= 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-5 border-b border-gray-100 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <OfferStatusBadge status={offer.status} />
            {isDemo && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Demo
              </span>
            )}
          </div>
          <h3 className="font-bold text-gray-900 text-lg mt-2">{buyerProfile.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <BuyerVerificationBadge buyerId={offer.buyerId} showText={true} />
            <button onClick={() => setIsTrustModalOpen(true)} className="text-[10px] font-bold uppercase tracking-widest text-brand-primary hover:text-brand-deep transition-colors bg-[#F4F9F5] px-2 py-0.5 rounded border border-transparent hover:border-brand-primary/20">
              View Buyer
            </button>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Offer ID</div>
          <div className="font-mono text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">{offer.id}</div>
        </div>
      </div>
      
      <div className="p-5">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">Crop & Grade</div>
            <div className="font-bold text-gray-900">{requirement?.crop || 'Crop'} • Grade {requirement?.acceptedQualityGrades[0] || 'A'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Quantity</div>
            <div className="font-bold text-gray-900">{offer.quantity.toLocaleString()} kg</div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-500">Market Reference</span>
            <span className="font-mono text-sm text-gray-600">₹{marketRef.toLocaleString()}/q</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-gray-700">{type === 'received' ? 'Buyer Offer' : 'Your Offer'}</span>
            <span className="font-mono text-sm font-bold text-gray-900">₹{offer.pricePerQuintal.toLocaleString()}/q</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="text-xs text-gray-500">Difference</span>
            <span className={`font-mono text-sm font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}₹{diff.toLocaleString()}/q
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Tag size={16} className="text-gray-400" />
            Total: <span className="font-bold text-gray-900">₹{offer.estimatedTotalValue.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={16} className="text-gray-400" />
            Payment in {offer.paymentTimelineDays} days
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 border-t border-gray-100 flex flex-col gap-3">
        {offer.status === 'ACCEPTED' ? (
          <>
            {(offer.paymentStatus === 'RECEIVED' || offer.paymentStatus === 'CONFIRMED') && (
              <div className="bg-green-50 border-2 border-green-400 text-green-800 p-4 rounded-xl shadow-sm mb-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-green-100 rounded-bl-full -mr-8 -mt-8 pointer-events-none"></div>
                <div className="flex items-start justify-between mb-2 relative z-10">
                  <div className="flex items-center gap-2 font-black text-sm">
                    <CheckCircle2 size={18} className="text-green-600" /> 
                    Payment Received!
                  </div>
                  <div className="font-mono text-lg font-black text-green-700">
                    ₹{offer.paymentAmount?.toLocaleString('en-IN') || offer.estimatedTotalValue.toLocaleString('en-IN')}
                  </div>
                </div>
                <p className="text-xs text-green-700 font-medium leading-relaxed relative z-10">
                  Payment has come from <strong>{buyerProfile.name}</strong> for your <strong>{requirement?.crop}</strong> crop. The amount has been credited.
                </p>
              </div>
            )}
            <Button onClick={() => onView(offer)} className="w-full bg-green-600 hover:bg-green-700 text-white border-transparent">
              View Transaction →
            </Button>
          </>
        ) : type === 'received' && offer.status === 'RECEIVED' ? (
          <div className="flex gap-3 w-full">
            <Button onClick={() => onView(offer)} variant="secondary" className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border-gray-200">
              Details
            </Button>
            {onReject && (
              <Button onClick={() => onReject(offer)} variant="secondary" className="flex-1 bg-white hover:bg-red-50 text-red-600 border-red-200">
                Reject
              </Button>
            )}
            {onAccept && (
              <Button onClick={() => onAccept(offer)} className="flex-1 bg-green-600 hover:bg-green-700">
                Accept
              </Button>
            )}
          </div>
        ) : (
          <Button onClick={() => onView(offer)} variant="secondary" className="w-full bg-white hover:bg-gray-50 text-gray-700 border-gray-200">
            View Details
          </Button>
        )}
      </div>

      <BuyerTrustModal 
        buyerId={offer.buyerId} 
        buyerName={buyerProfile.name} 
        isOpen={isTrustModalOpen} 
        onClose={() => setIsTrustModalOpen(false)} 
      />
    </div>
  );
};
