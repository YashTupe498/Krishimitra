import React from 'react';
import { Sprout, TrendingUp, Handshake, Wallet, Landmark, Truck, PackageOpen, Droplets, Bug, AlertTriangle } from 'lucide-react';
import type { GrievanceCategory } from '../../../types/grievance';

interface IssueCategoriesProps {
  onSelectCategory: (category: GrievanceCategory) => void;
}

const CATEGORIES = [
  { id: 'CROP', label: 'Crop / Farming', icon: Sprout, desc: 'Report crop-related problems', color: 'text-green-600', bg: 'bg-green-50' },
  { id: 'MARKET', label: 'Market Price', icon: TrendingUp, desc: 'Report APMC price issues', color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'BUYER', label: 'Buyer', icon: Handshake, desc: 'Report issues with buyers', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { id: 'PAYMENT', label: 'Payment', icon: Wallet, desc: 'Report delayed payments', color: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 'GOVERNMENT_SCHEME', label: 'Gov Scheme', icon: Landmark, desc: 'Report subsidy issues', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'LOGISTICS', label: 'Logistics', icon: Truck, desc: 'Report transport issues', color: 'text-orange-600', bg: 'bg-orange-50' },
  { id: 'INPUTS', label: 'Inputs / Seed', icon: PackageOpen, desc: 'Report fertilizer/seed issues', color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'IRRIGATION', label: 'Irrigation', icon: Droplets, desc: 'Report water supply issues', color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { id: 'PEST_DISEASE', label: 'Pest / Disease', icon: Bug, desc: 'Report crop disease outbreaks', color: 'text-rose-600', bg: 'bg-rose-50' },
  { id: 'OTHER', label: 'Other', icon: AlertTriangle, desc: 'Any other problems', color: 'text-gray-600', bg: 'bg-gray-50' }
] as const;

export const IssueCategories: React.FC<IssueCategoriesProps> = ({ onSelectCategory }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="mb-8 flex flex-col items-start text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[11px] font-black uppercase tracking-widest mb-3 border border-green-100">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
          Issue Categories
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">What type of problem are you facing?</h2>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id as GrievanceCategory)}
              className="relative flex flex-col items-start p-5 rounded-2xl bg-white border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-xl hover:-translate-y-1 hover:border-green-200 transition-all duration-300 text-left group overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-transparent to-gray-50/80 rounded-bl-full -z-10 group-hover:to-green-50 transition-colors duration-500"></div>
              
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${cat.bg} border border-white shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={24} className={cat.color} />
              </div>
              <span className="text-[15px] font-black text-gray-800 mb-1 group-hover:text-green-700 transition-colors tracking-tight">{cat.label}</span>
              <span className="text-[11px] font-semibold text-gray-500 leading-relaxed">{cat.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
