import React, { useEffect } from 'react';
import { X, Box, CheckCircle2, ShieldCheck } from 'lucide-react';
import type { StorageDemoData } from '../../../data/marketStorageDemo';
import type { SellVsStoreResult } from '../../../utils/marketIntelligence';

interface StorageDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  storage: StorageDemoData | null;
  sellVsStore: SellVsStoreResult | null;
}

export const StorageDetailsModal: React.FC<StorageDetailsModalProps> = ({ isOpen, onClose, storage, sellVsStore }) => {
  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isOpen, onClose]);
  if (!isOpen || !storage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Box size={18} className="text-gray-500" />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">STORAGE DETAILS</h3>
          </div>
          <button type="button" aria-label="Close storage details" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#194D2E]">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Facility</span>
              <span className="text-sm font-bold text-gray-900">{storage.centerName}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Distance</span>
                <span className="text-sm font-bold text-gray-900">{storage.distanceKm} km</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Available capacity</span>
                <span className="text-sm font-bold text-gray-900">{storage.availableCapacityTonnes} tonnes</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Storage cost</span>
                <span className="text-sm font-bold text-gray-900">₹{storage.costPerTonnePerDayRs}/tonne/day</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Availability</span>
                <span className={`text-sm font-bold ${storage.availability === 'AVAILABLE' ? 'text-green-600' : 'text-orange-500'}`}>
                  {storage.availability === 'AVAILABLE' ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Produce suitability</span>
                <span className="text-sm font-bold text-gray-900">{storage.suitableFor.join(', ')}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Recommended holding</span>
                <span className="text-sm font-bold text-gray-900">30 days</span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-100">
               <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck size={14} className="text-green-600"/>
                  <span className="text-sm font-bold text-gray-900">Quality risk: Low</span>
               </div>
            </div>

            {sellVsStore && (
              <div className="bg-gray-50 rounded-xl p-4 mt-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-3">SELL VS STORE CALCULATION</span>
                
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-gray-600">Sell Now Net</span>
                  <span className="text-sm font-bold text-gray-900">₹{sellVsStore.sellNowNetRs.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
                  <span className="text-xs font-medium text-gray-600">Storage Cost (30 days)</span>
                  <span className="text-sm font-bold text-gray-900">-₹{sellVsStore.storeCostRs.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-900">Estimated store net</span>
                  <span className="text-sm font-black text-gray-900">₹{sellVsStore.storeNetRs.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest flex items-center justify-center gap-1 ${sellVsStore.signal === 'CONSIDER_STORAGE' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                    <CheckCircle2 size={12}/>
                    {sellVsStore.signal === 'STORE' ? 'Storage may be worthwhile' : sellVsStore.signal === 'CONSIDER_STORAGE' ? 'Storage may be worth considering' : 'Selling is currently favorable'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Source</span>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-widest">
            {storage.sourceType === 'CURATED_DEMO' ? 'CURATED DEMO DATA' : storage.sourceType}
          </span>
        </div>
      </div>
    </div>
  );
};
