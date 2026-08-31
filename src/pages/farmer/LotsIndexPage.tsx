import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Package, MapPin, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import type { Lot } from '../../types/lot';
import { useAuth } from '../../app/providers/AuthProvider';
import { farmerLotsApi } from '../../services/farmerLotsApi';

export const LotsIndexPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { session } = useAuth();
  const [lots, setLots] = useState<Lot[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = session?.access_token;
    if (!token) return;
    farmerLotsApi.list(token).then(setLots).catch((cause) => setError(cause instanceof Error ? cause.message : 'Unable to load lots.'));
  }, [session?.access_token]);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-28 md:pb-24 max-w-5xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4 pt-4 md:pt-0">
        <div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
            {t('farmerNav.dashboard', 'Dashboard')} / {t('farmerNav.myLots', 'My Lots')}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">
            {t('farmerNav.myLots', 'MY LOTS')}
          </h1>
        </div>
        <Button variant="primary" className="font-bold shadow-sm flex items-center gap-2" onClick={() => navigate('/farmer/lots/new')}>
          <Plus size={18} />
          {t('lots.createNew', 'CREATE NEW LOT')}
        </Button>
      </div>

      {error && <Card className="p-4 border border-red-200 bg-red-50 text-red-800">{error}</Card>}
      {/* LOTS GRID */}
      {lots.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lots.map((lot: Lot) => {
            const emoji = lot.crop === 'Onion' ? '🧅' : lot.crop === 'Potato' ? '🥔' : '🌾';
            
            return (
              <Card 
                key={lot.id} 
                interactive 
                className="p-5 flex flex-col justify-between hover:border-brand-primary/50 transition-colors shadow-sm bg-white border border-gray-200"
                onClick={() => navigate(`/farmer/lots/${lot.id}`)}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 bg-gray-50 border border-gray-100 text-3xl flex items-center justify-center rounded-2xl shrink-0">
                    {emoji}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">
                      {t(`data.crops.${lot.crop}`, lot.crop)}
                    </h3>
                    <div className="text-sm font-medium text-gray-500 mt-1 flex flex-col gap-1">
                      <span className="flex items-center gap-1.5"><Package size={14} /> {lot.quantity} {lot.unit}</span>
                      <span className="flex items-center gap-1.5"><MapPin size={14} /> {lot.location}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex flex-col gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</span>
                    <span className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                      {lot.status === 'DECISION_READY' || lot.status === 'COMPLETED' || lot.status === 'TRANSACTION_ACTIVE' ? (
                        <CheckCircle2 size={16} className="text-green-600" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      )}
                      {t(`data.status.${lot.status}`, lot.status.replace(/_/g, ' '))}
                    </span>
                  </div>
                  
                  <Button variant="secondary" className="w-full justify-center text-brand-primary font-bold border-brand-primary/20 hover:border-brand-primary/50" onClick={(e) => {
                    e.stopPropagation();
                    if (lot.status === 'DRAFT') {
                       navigate('/farmer/lots/new'); 
                    } else if (lot.status === 'QUALITY_PENDING') {
                       navigate(`/farmer/lots/${lot.id}/quality`);
                    } else if (lot.status === 'MARKET_ANALYSIS_READY') {
                       navigate(`/farmer/lots/${lot.id}`);
                    } else if (lot.status === 'DECISION_READY') {
                       navigate(lot.activeDecisionId ? `/farmer/decisions/${lot.activeDecisionId}` : `/farmer/lots/${lot.id}`);
                    } else {
                       navigate(`/farmer/lots/${lot.id}`);
                    }
                  }}>
                    {lot.status === 'DRAFT' && 'Continue Lot'}
                    {lot.status === 'QUALITY_PENDING' && 'Complete Quality'}
                    {lot.status === 'MARKET_ANALYSIS_READY' && 'View Market Analysis'}
                    {lot.status === 'DECISION_READY' && 'View Decision'}
                    {lot.status === 'OFFER_RECEIVED' && 'View Offer'}
                    {lot.status === 'TRANSACTION_ACTIVE' && 'Track Transaction'}
                    {lot.status === 'COMPLETED' && 'View Summary'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 flex flex-col items-center justify-center text-center bg-gray-50 border border-dashed border-gray-300 shadow-none">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
            <Package size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No active lots found</h2>
          <p className="text-gray-500 mb-6 max-w-md">You haven't created any produce lots yet. Create a new lot to get market analysis and matching buyers.</p>
          <Button variant="primary" className="font-bold flex items-center gap-2" onClick={() => navigate('/farmer/lots/new')}>
            <Plus size={18} />
            CREATE NEW LOT
          </Button>
        </Card>
      )}

    </div>
  );
};
