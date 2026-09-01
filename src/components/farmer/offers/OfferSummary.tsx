import React from 'react';
import { Sparkles, MessageCircle, Clock, CheckCircle2 } from 'lucide-react';

type SummaryMetrics = {
  activeOpportunities: number;
  offersReceived: number;
  pendingResponse: number;
  accepted: number;
};

export const OfferSummary: React.FC<{ metrics: SummaryMetrics }> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 text-green-700 mb-2">
          <Sparkles size={16} />
          <h3 className="text-xs font-bold uppercase tracking-wider">Opportunities</h3>
        </div>
        <div className="text-2xl font-black text-gray-900">{metrics.activeOpportunities}</div>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 text-purple-700 mb-2">
          <MessageCircle size={16} />
          <h3 className="text-xs font-bold uppercase tracking-wider">Received</h3>
        </div>
        <div className="text-2xl font-black text-gray-900">{metrics.offersReceived}</div>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 text-amber-600 mb-2">
          <Clock size={16} />
          <h3 className="text-xs font-bold uppercase tracking-wider">Pending</h3>
        </div>
        <div className="text-2xl font-black text-gray-900">{metrics.pendingResponse}</div>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 text-blue-600 mb-2">
          <CheckCircle2 size={16} />
          <h3 className="text-xs font-bold uppercase tracking-wider">Accepted</h3>
        </div>
        <div className="text-2xl font-black text-gray-900">{metrics.accepted}</div>
      </div>
    </div>
  );
};
