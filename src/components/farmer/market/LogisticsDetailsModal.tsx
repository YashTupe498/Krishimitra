import React, { useEffect } from 'react';
import { X, Truck, Clock, MapPin, Navigation } from 'lucide-react';
import type { LogisticsDemoData } from '../../../data/marketLogisticsDemo';

interface LogisticsDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logistics: LogisticsDemoData | null;
  netImpactPerQuintalRs: number | null;
}

export const LogisticsDetailsModal: React.FC<LogisticsDetailsModalProps> = ({ isOpen, onClose, logistics, netImpactPerQuintalRs }) => {
  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isOpen, onClose]);
  if (!isOpen || !logistics) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Truck size={18} className="text-gray-500" />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">LOGISTICS DETAILS</h3>
          </div>
          <button type="button" aria-label="Close logistics details" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#194D2E]">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Route</span>
              <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                <MapPin size={14} className="text-gray-400" /> {logistics.route.origin}
                <span className="text-gray-300">→</span>
                <Navigation size={14} className="text-gray-400" /> {logistics.route.destination}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Transport</span>
                <span className="text-sm font-bold text-gray-900">{logistics.transportType}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Distance</span>
                <span className="text-sm font-bold text-gray-900">{logistics.distanceKm} km</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Estimated travel time</span>
                <div className="flex items-center gap-1.5 text-sm font-bold text-gray-900">
                  <Clock size={14} className="text-gray-400" /> {logistics.estimatedTimeMin} min
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Availability</span>
                <span className={`text-sm font-bold ${logistics.availability === 'AVAILABLE' ? 'text-green-600' : 'text-orange-500'}`}>
                  {logistics.availability === 'AVAILABLE' ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Estimated transport cost</span>
                <span className="text-lg font-black text-gray-900">₹{logistics.estimatedCostRs.toLocaleString()}</span>
              </div>
              {netImpactPerQuintalRs !== null && (
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Impact on realization</span>
                  <span className="text-lg font-black text-red-600">-₹{netImpactPerQuintalRs.toLocaleString(undefined, { maximumFractionDigits: 0 })}/q</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Source</span>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-widest">
            {logistics.sourceType === 'CURATED_DEMO' ? 'CURATED DEMO DATA' : logistics.sourceType}
          </span>
        </div>
      </div>
    </div>
  );
};
