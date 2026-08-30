import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, MapPin, CheckCircle2, ChevronRight, ArrowRight
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { mockDashboardData } from '../../data/mockFarmerDashboard';
import type { Lot, LotStatus } from '../../types/lot';
import { useAuth } from '../../app/providers/AuthProvider';
import { farmerLotsApi } from '../../services/farmerLotsApi';

const STATUS_ORDER: LotStatus[] = [
  'DRAFT',
  'QUALITY_PENDING',
  'MARKET_ANALYSIS_READY',
  'DECISION_READY',
  'OFFER_RECEIVED',
  'TRANSACTION_ACTIVE',
  'COMPLETED'
];

export const LotDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { session } = useAuth();
  const [lot, setLot] = useState<Lot | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = session?.access_token;
    if (!id || !token) return;
    setIsLoading(true);
    farmerLotsApi.get(token, id).then(setLot).catch(() => setLot(null)).finally(() => setIsLoading(false));
  }, [id, session?.access_token]);

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading lot…</div>;
  }

  if (!lot) {
    return <div className="p-8 text-center text-gray-500">Lot not found</div>;
  }

  const formatCurrency = (val: number) => '₹ ' + val.toLocaleString('en-IN');
  const decision = lot.activeDecisionId === mockDashboardData.activeDecision?.id ? mockDashboardData.activeDecision : null;
  const currentStatusIndex = STATUS_ORDER.indexOf(lot.status);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-28 md:pb-24 max-w-4xl mx-auto">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 border-b border-gray-200 pb-4 pt-4 md:pt-0">
        <button 
          onClick={() => navigate('/farmer/dashboard')}
          className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
          aria-label={t('common.back', 'Back to My Lots')}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
            {t('lotDetails.backLink', 'Back to My Lots')}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">
            {t('lotDetails.title', 'LOT DETAILS')}
          </h1>
        </div>
      </div>

      {/* LOT SUMMARY */}
      <Card className="border border-gray-200 shadow-sm bg-white overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-brand-primary/5 border border-brand-primary/10 flex items-center justify-center text-3xl shrink-0">
                {lot.crop === 'Onion' ? '🧅' : lot.crop === 'Potato' ? '🥔' : '🌾'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {t(`data.crops.${lot.crop}`, lot.crop)}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-sm font-medium text-gray-600">
                  <span>{lot.quantity} {lot.unit}</span>
                  <span>•</span>
                  <span>{lot.qualityGrade ? `Grade ${lot.qualityGrade}` : t('lotDetails.pendingQuality', 'Quality Pending')}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><MapPin size={14} /> {lot.location}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Status</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {currentStatusIndex >= 3 ? '🟢' : '🟡'}
                  </span>
                  <span className="text-sm font-bold text-gray-900">{t(`data.status.${lot.status}`, lot.status.replace(/_/g, ' '))}</span>
                </div>
              </div>
              
              {decision && (
                <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                  <p className="text-xs text-green-700 font-bold uppercase tracking-wider mb-1">Net Realization</p>
                  <p className="text-xl font-bold text-green-800 numeric">{formatCurrency(decision.netRealization)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* STATUS TIMELINE */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('lotDetails.statusTimeline', 'STATUS TIMELINE')}</h2>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>
        <Card className="border border-gray-200 shadow-sm bg-white overflow-hidden p-6">
          <div className="flex flex-col space-y-4 relative">
            <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-gray-100 z-0 hidden sm:block"></div>
            {STATUS_ORDER.map((status, index) => {
              const isCompleted = index < currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              
              if (index > currentStatusIndex + 1) return null; // Only show up to next step
              
              return (
                <div key={status} className="flex items-center gap-4 relative z-10">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 ${
                    isCompleted ? 'bg-green-500 border-green-500 text-white' : 
                    isCurrent ? 'bg-white border-brand-primary text-brand-primary' : 
                    'bg-white border-gray-300'
                  }`}>
                    {isCompleted ? <CheckCircle2 size={14} /> : isCurrent ? <div className="w-2 h-2 rounded-full bg-brand-primary" /> : null}
                  </div>
                  <span className={`text-sm font-medium ${
                    isCompleted ? 'text-gray-600' : 
                    isCurrent ? 'text-gray-900 font-bold' : 
                    'text-gray-400'
                  }`}>
                    {t(`data.status.${status}`, status.replace(/_/g, ' '))}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      {/* QUALITY ASSESSMENT */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('lotDetails.qualityAssessment', 'QUALITY ASSESSMENT')}</h2>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>
        <Card className="border border-gray-200 shadow-sm bg-white p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">{t('lotDetails.currentGrade', 'Current Grade')}</p>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-gray-900">
                  {lot.qualityGrade ? `Grade ${lot.qualityGrade}` : t('lotDetails.notAssessed', 'Not Assessed')}
                </span>
                {lot.qualityGrade && <CheckCircle2 size={20} className="text-green-600" />}
              </div>
            </div>
            <Button variant="secondary" className="w-full md:w-auto text-brand-primary font-semibold" onClick={() => navigate(`/farmer/lots/${lot.id}/quality`)}>
              {lot.qualityGrade ? t('lotDetails.reassessQuality', 'View Quality Assessment') : t('lotDetails.startQuality', 'Start Quality Assessment')} <ChevronRight size={18} className="ml-1" />
            </Button>
          </div>
        </Card>
      </section>

      {/* MARKET ANALYSIS */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('lotDetails.marketAnalysis', 'MARKET ANALYSIS')}</h2>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>
        <Card className="border border-gray-200 shadow-sm bg-white p-6">
          {currentStatusIndex >= STATUS_ORDER.indexOf('MARKET_ANALYSIS_READY') ? (
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">{t('lotDetails.status', 'Status')}</p>
                  <p className="text-sm font-medium text-gray-900">{t('lotDetails.marketAnalysisReady', 'Market Analysis Ready')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">{t('lotDetails.marketPressure', 'Market pressure')}</p>
                  <p className="text-sm font-medium text-gray-900">Moderate 🟡</p>
                </div>
                {decision && (
                  <>
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">{t('lotDetails.bestHeadline', 'Best headline price')}</p>
                      <p className="text-base font-bold text-gray-900 numeric">{formatCurrency(decision.highestHeadlinePrice)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">{t('lotDetails.bestNetOption', 'Best net option')}</p>
                      <p className="text-base font-bold text-green-700 numeric">{formatCurrency(decision.netRealization)}</p>
                    </div>
                  </>
                )}
              </div>
              <Button variant="secondary" className="w-full md:w-auto text-brand-primary font-semibold" onClick={() => navigate(`/farmer/market?lotId=${id}`)}>
                {t('lotDetails.viewMarketAnalysis', 'View Market Analysis')} <ChevronRight size={18} className="ml-1" />
              </Button>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              {t('lotDetails.completeQualityFirst', 'Complete quality assessment to unlock market analysis.')}
            </div>
          )}
        </Card>
      </section>

      {/* DECISION */}
      {decision && currentStatusIndex >= STATUS_ORDER.indexOf('DECISION_READY') && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-sm font-bold text-brand-deep uppercase tracking-wider flex items-center gap-2">⭐ {t('lotDetails.decision', 'RECOMMENDED ACTION')}</h2>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>
          <Card className="border border-brand-primary shadow-sm bg-white p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <p className="text-sm font-bold text-brand-primary uppercase tracking-wider mb-1">{t('lotDetails.sellThrough', 'Sell through')}</p>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{t(`data.locations.${decision.recommendedDestination}`, decision.recommendedDestination)}</h3>
                
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Why?</p>
                <ul className="text-sm text-gray-700 font-medium space-y-1">
                  <li className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-green-600" /> Lower transport</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-green-600" /> Payment fits requirement</li>
                </ul>
              </div>
              <div className="flex flex-col items-start md:items-end w-full md:w-auto gap-4">
                <div className="bg-green-50/80 border border-green-200 rounded-xl px-5 py-3 w-full md:w-auto text-left md:text-right">
                  <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">{t('lotDetails.estimatedNet', 'Estimated Net Realization')}</p>
                  <p className="text-3xl font-bold text-green-800 numeric">{formatCurrency(decision.netRealization)}</p>
                </div>
                <Button variant="primary" className="w-full md:w-auto px-6 font-bold shadow-sm" onClick={() => navigate(`/farmer/decisions/${decision.id}`)}>
                  {t('lotDetails.viewFullDecision', 'View Full Decision')} <ArrowRight size={18} className="ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* FARMER SELLING REQUIREMENTS */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('lotDetails.sellingRequirements', 'YOUR SELLING REQUIREMENTS')}</h2>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>
        <Card className="border border-gray-200 shadow-sm bg-white p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('lotDetails.payment', 'Payment')}</p>
              <p className="text-sm font-medium text-gray-900">{t(`data.constraints.${lot.constraints.paymentRequirement.replace(/\s+/g, '')}`, lot.constraints.paymentRequirement)}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('lotDetails.transport', 'Transport')}</p>
              <p className="text-sm font-medium text-gray-900">{t(`data.constraints.${lot.constraints.transportCapability.replace(/\s+/g, '')}`, lot.constraints.transportCapability)}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('lotDetails.storage', 'Storage')}</p>
              <p className="text-sm font-medium text-gray-900">{t(`data.constraints.${lot.constraints.storageCapability.replace(/\s+/g, '')}`, lot.constraints.storageCapability)}</p>
            </div>
          </div>
        </Card>
      </section>

      {/* OFFERS & TRANSACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('lotDetails.offers', 'OFFERS')}</h2>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>
          <Card className="border border-gray-200 shadow-sm bg-white p-6 h-[calc(100%-2.5rem)] flex items-center justify-center">
             <div className="text-center text-gray-500">
              {t('lotDetails.noOffers', 'No offers yet. Your lot is available for matching opportunities.')}
            </div>
          </Card>
        </section>
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('lotDetails.transaction', 'TRANSACTION')}</h2>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>
          <Card className="border border-gray-200 shadow-sm bg-white p-6 h-[calc(100%-2.5rem)] flex items-center justify-center">
             <div className="text-center text-gray-500">
              {t('lotDetails.noTransaction', 'No transaction yet')}
            </div>
          </Card>
        </section>
      </div>

    </div>
  );
};
