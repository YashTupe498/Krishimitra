import React, { useState } from 'react';
import { MapPin, Calendar, Tag } from 'lucide-react';
import { Button } from '../../ui/Button';
import type { BuyerOpportunity } from '../../../services/offerDemoService';
import { MatchIndicators } from './MatchIndicators';
import { BuyerVerificationBadge } from '../../buyer/BuyerVerificationBadge';
import { BuyerTrustModal } from './BuyerTrustModal';

export const BuyerOpportunityCard: React.FC<{
  opportunity: BuyerOpportunity;
  onViewDetails: (opp: BuyerOpportunity) => void;
  onRespond: (opp: BuyerOpportunity) => void;
}> = ({ opportunity, onViewDetails, onRespond }) => {
  const { requirement, matchedLot, buyerProfile, isDemo } = opportunity;
  
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Flexible';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const [isTrustModalOpen, setIsTrustModalOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-5 border-b border-gray-100 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BuyerVerificationBadge buyerId={opportunity.requirement.buyerId} showText={true} />
            {isDemo && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Demo
              </span>
            )}
          </div>
          <h3 className="font-bold text-gray-900 text-lg">{buyerProfile.name}</h3>
        </div>
        <button onClick={() => setIsTrustModalOpen(true)} className="text-[10px] font-bold uppercase tracking-widest text-brand-primary hover:text-brand-deep transition-colors bg-[#F4F9F5] px-2 py-1 rounded">
          View Buyer
        </button>
      </div>
      
      <div className="p-5">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <div className="text-xs text-gray-500 mb-1">Requirement</div>
            <div className="font-bold text-gray-900">{requirement.crop} • Grade {requirement.acceptedQualityGrades[0] || 'Any'}</div>
            <div className="text-sm text-gray-600">{requirement.quantityRequired.toLocaleString()} {requirement.quantityUnit.toLowerCase()}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Target Price</div>
            <div className="font-bold text-green-700 flex items-center gap-1">
              <Tag size={14} /> 
              ₹{requirement.pricePerQuintal ? requirement.pricePerQuintal.toLocaleString() : '4,350'}/q
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin size={16} className="text-gray-400" />
            {requirement.district}, {requirement.state}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={16} className="text-gray-400" />
            Required by {formatDate(new Date(Date.now() + 86400000 * 7).toISOString())}
          </div>
        </div>

        <MatchIndicators score={opportunity.matchScore} />
        
        <div className="text-xs text-gray-500 mt-3 flex items-center gap-1">
          Matched with your lot: <span className="font-bold text-gray-700">{matchedLot.id}</span>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 border-t border-gray-100 flex gap-3">
        <Button onClick={() => onViewDetails(opportunity)} variant="secondary" className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border-gray-200">
          View Details
        </Button>
        <Button onClick={() => onRespond(opportunity)} className="flex-1">
          Respond
        </Button>
      </div>

      <BuyerTrustModal 
        buyerId={opportunity.requirement.buyerId} 
        buyerName={buyerProfile.name} 
        isOpen={isTrustModalOpen} 
        onClose={() => setIsTrustModalOpen(false)} 
      />
    </div>
  );
};
