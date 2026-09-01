import React from 'react';
import { Button } from '../../ui/Button';
import { MapPin, Calendar, ShieldCheck, Tag, Leaf, X } from 'lucide-react';
import type { BuyerOpportunity } from '../../../services/offerDemoService';
import { MatchIndicators } from './MatchIndicators';

    export const OfferDetails: React.FC<{
  opportunity: BuyerOpportunity;
  onClose: () => void;
  onRespond: () => void;
  isOfferView?: boolean;
}> = ({ opportunity, onClose, onRespond, isOfferView }) => {
  const { requirement, matchedLot, buyerProfile, isDemo } = opportunity;
  
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Flexible';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
      <div className="p-5 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
        <h2 className="text-xl font-black text-gray-900">Requirement Details</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
          <X size={20} />
        </button>
      </div>
      
      <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            {buyerProfile.verified && (
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-50 px-2 py-0.5 rounded">
                <ShieldCheck size={12} /> Verified {buyerProfile.type}
              </span>
            )}
            {isDemo && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Demo
              </span>
            )}
          </div>
          <h3 className="font-bold text-gray-900 text-2xl">{buyerProfile.name}</h3>
          <div className="text-sm text-gray-500 mt-1">ID: {requirement.id}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-1"><Leaf size={14} /> Product Required</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Crop</span>
                <span className="text-sm font-bold text-gray-900">{requirement.crop}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Grade</span>
                <span className="text-sm font-bold text-gray-900">{requirement.acceptedQualityGrades.join(', ') || 'Any'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Quantity</span>
                <span className="text-sm font-bold text-gray-900">{requirement.quantityRequired.toLocaleString()} {requirement.quantityUnit.toLowerCase()}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-1"><Tag size={14} /> Commercial Terms</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Target Price</span>
                <span className="text-sm font-bold text-green-700">₹{requirement.pricePerQuintal ? requirement.pricePerQuintal.toLocaleString() : '4,350'}/q</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Payment</span>
                <span className="text-sm font-bold text-gray-900">Within {requirement.paymentTimelineDays} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Delivery</span>
                <span className="text-sm font-bold text-gray-900">{requirement.deliveryPreference.replace(/_/g, ' ')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 space-y-3">
          <div className="flex items-center gap-3 text-sm text-gray-700 bg-white border border-gray-200 p-4 rounded-xl">
            <div className="bg-blue-50 p-2 rounded-lg"><MapPin size={18} className="text-blue-600" /></div>
            <div>
              <div className="font-bold text-gray-900">Delivery Location</div>
              <div className="text-gray-600">{requirement.district}, {requirement.state}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-700 bg-white border border-gray-200 p-4 rounded-xl">
            <div className="bg-amber-50 p-2 rounded-lg"><Calendar size={18} className="text-amber-600" /></div>
            <div>
              <div className="font-bold text-gray-900">Required By</div>
              <div className="text-gray-600">{formatDate(new Date(Date.now() + 86400000 * 7).toISOString())}</div>
            </div>
          </div>
        </div>

        {!isOfferView && (
          <div className="mb-2">
            <h4 className="text-sm font-black text-gray-900 mb-4">Why this matches your lot ({matchedLot.id})</h4>
            <MatchIndicators score={opportunity.matchScore} />
          </div>
        )}
      </div>
      
      <div className="p-5 border-t border-gray-100 bg-gray-50 flex gap-3 sticky bottom-0 z-10">
        <Button onClick={onClose} variant="secondary" className="flex-1 bg-white">
          Close
        </Button>
        {!isOfferView && (
          <Button onClick={onRespond} className="flex-1">
            Respond to Buyer
          </Button>
        )}
      </div>
    </div>
  );
};
