import React from 'react';
import { Info, ShieldCheck } from 'lucide-react';
import { Card } from '../../ui/Card';

export const ENWRAwareness: React.FC = () => {
  return (
    <Card className="bg-blue-50/50 border-blue-100 overflow-hidden">
      <div className="p-6 md:p-8 flex items-start gap-4">
        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
          <Info size={24} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider flex items-center gap-2 mb-2">
            <ShieldCheck size={16} /> e-NWR Awareness
          </h3>
          <p className="text-sm text-blue-800 leading-relaxed mb-3">
            If eligible produce is stored in a participating warehouse, an electronic Negotiable Warehouse Receipt (e-NWR) may provide a digital record of stored produce and may support eligible financing.
          </p>
          <div className="bg-white rounded-xl p-3 border border-blue-100 inline-block">
            <span className="text-xs font-bold text-gray-700">Check warehouse and bank eligibility before use.</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
