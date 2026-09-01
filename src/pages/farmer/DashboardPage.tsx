import React from 'react';
import { 
  Plus, 
  MapPin, 
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Globe2,
  Mic,
  UserCircle,
  TrendingDown,
  CircleCheckBig,
  BarChart4
} from 'lucide-react';
import { useAuth } from '../../app/providers/AuthProvider';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { mockDashboardData } from '../../data/mockFarmerDashboard';
import { useNavigate } from 'react-router-dom';
import { farmerLotsApi } from '../../services/farmerLotsApi';
import type { Lot } from '../../types/lot';

import { useTranslation } from 'react-i18next';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

export const FarmerDashboardPage: React.FC = () => {
  const { profile, session } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [showLangMenu, setShowLangMenu] = React.useState(false);
  const [lots, setLots] = React.useState<Lot[]>([]);
  const { activeDecision, marketSnapshot, marketPressure, saleWindow, actionItems } = mockDashboardData;
  const firstName = profile?.full_name?.split(' ')[0] || 'Farmer';
  const location = profile?.district ? `${profile.district}, ${profile.state || 'India'}` : 'Nashik, Maharashtra';

  React.useEffect(() => {
    const token = session?.access_token;
    if (!token) return;
    farmerLotsApi.list(token).then(setLots).catch(() => setLots([]));
  }, [session?.access_token]);

  const activeLots = lots.map(lot => ({
    id: lot.id,
    crop: lot.crop,
    quantity: `${lot.quantity} ${lot.unit}`,
    quality: lot.qualityGrade ? `Grade ${lot.qualityGrade}` : 'Pending Quality',
    location: lot.village || lot.location,
    status: lot.status,
    emoji: lot.crop === 'Onion' ? '🧅' : lot.crop === 'Potato' ? '🥔' : '🍅'
  }));

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('preferred_language', lang);
    setShowLangMenu(false);
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20 md:pb-8">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#14532D] font-display">
            {t('dashboard.goodMorning', 'Good morning')}, {firstName} 👋
          </h1>
          <p className="text-sm text-gray-600 mt-1">{t('dashboard.greetingSub', "Here's what matters for your produce today.")}</p>
          <div className="flex items-center gap-2 mt-2 text-sm font-medium text-gray-600">
            <MapPin size={16} className="text-brand-primary" />
            <span>{t(`data.locations.${location.split(',')[0]}`, location.split(',')[0])}{location.includes(',') ? ', ' + location.split(',')[1].trim() : ''}</span>
          </div>
        </div>
        
        {/* Top Right Quick Actions */}
        <div className="flex items-center gap-3 self-start relative z-50">
          <div className="relative">
            <Badge 
              variant="info" 
              className="bg-white border border-gray-200 shadow-sm px-3 py-1.5 flex items-center gap-1.5 text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setShowLangMenu(!showLangMenu)}
            >
              <Globe2 size={16} className="text-brand-primary" /> 
              <span className="font-semibold">{i18n.language === 'mr' ? 'मराठी' : i18n.language === 'hi' ? 'हिंदी' : 'English'}</span>
            </Badge>
            
            {showLangMenu && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-100 py-2 w-32 z-50">
                <button onClick={() => changeLanguage('en')} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${i18n.language === 'en' ? 'text-brand-primary font-bold' : 'text-gray-700'}`}>
                  English
                </button>
                <button onClick={() => changeLanguage('hi')} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${i18n.language === 'hi' ? 'text-brand-primary font-bold' : 'text-gray-700'}`}>
                  हिंदी
                </button>
                <button onClick={() => changeLanguage('mr')} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${i18n.language === 'mr' ? 'text-brand-primary font-bold' : 'text-gray-700'}`}>
                  मराठी
                </button>
              </div>
            )}
          </div>
          <Badge variant="info" className="bg-white border border-gray-200 shadow-sm px-3 py-1.5 flex items-center gap-1.5 text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors" title={t('dashboard.voiceAssistantHover', 'Ask in English, हिंदी or मराठी')}>
            <Mic size={16} className="text-brand-primary" /> 
            <span className="font-semibold">{t('farmerNav.voiceAssistant', 'Voice')}</span>
          </Badge>
          <button className="w-9 h-9 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center hover:bg-brand-primary/20 transition-colors">
            <UserCircle size={20} />
          </button>
        </div>
      </div>

      {/* 2. PRIMARY ACTION - CREATE NEW LOT */}
      <div className="flex justify-center py-2">
        <Button 
          variant="primary" 
          size="large"
          className="w-full md:max-w-md shadow-md hover:shadow-lg transition-shadow group py-4 text-lg flex-col gap-1 items-center"
          onClick={() => navigate('/farmer/lots/new')}
        >
          <div className="flex items-center gap-2">
            <Plus size={22} className="group-hover:scale-110 transition-transform" />
            {t('dashboard.createNewLot', 'CREATE NEW LOT')}
          </div>
        </Button>
      </div>

      {/* 3. ACTIVE DECISION (HERO) */}
      {activeDecision && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <span className="text-brand-deep text-lg">⭐</span> {t('dashboard.priorityAction', 'YOUR PRIORITY ACTION')}
            </h2>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>
          
          <Card className="border border-brand-primary shadow-sm relative overflow-hidden bg-white group">
            
            <div className="p-6 border-b border-gray-100 relative z-10 flex flex-col md:flex-row justify-between gap-6">
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 rounded-2xl bg-brand-primary/5 border border-brand-primary/10 flex items-center justify-center text-3xl overflow-hidden shrink-0">
                  <span>🧅</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {t(`data.crops.${activeDecision.crop}`, activeDecision.crop)}
                  </h3>
                  <p className="text-sm text-gray-600 font-medium mb-3">
                    {activeDecision.quantity} • {activeDecision.quality} • {t(`data.locations.${location.split(',')[0]}`, location.split(',')[0])}
                  </p>
                  <div className="flex items-center gap-2 bg-green-50 text-green-800 px-3 py-1.5 rounded-lg border border-green-100 w-fit">
                    <CheckCircle2 size={16} />
                    <span className="text-sm font-bold">
                      {t('dashboard.recommendedSellingOp', 'Recommended: Sell through')} {t(`data.locations.${activeDecision.recommendedDestination}`, activeDecision.recommendedDestination)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-gray-50/50 relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
                    {t('dashboard.estimatedNetRealization', 'Estimated Net Realization')}
                  </p>
                  <p className="text-4xl font-display font-bold text-brand-primary numeric">
                    {formatCurrency(activeDecision.netRealization)}
                  </p>
                </div>
                <div className="w-full md:w-auto shrink-0">
                  <Button variant="primary" className="w-full md:w-auto font-bold px-8 py-3 h-auto text-base shadow-sm" onClick={() => navigate(`/farmer/decisions/${activeDecision.id}`)}>
                    {t('dashboard.viewFullDecision', 'VIEW FULL DECISION')} <ArrowRight size={20} className="ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* 4. WHY NOT HIGHEST PRICE & MARKET SNAPSHOT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        
        {/* WHY NOT THE HIGHEST PRICE? */}
        {activeDecision && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('dashboard.whyNotHighestPriceTitle', '🤔 WHY NOT THE HIGHEST PRICE?')}</h2>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>
            <Card className="border border-amber-200/60 shadow-sm h-[calc(100%-2.5rem)] bg-white relative overflow-hidden">
              <div className="p-6 h-full flex flex-col">
                <div className="mb-5 border-b border-gray-100 pb-4">
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">{t('dashboard.institutionalBuyer', 'Institutional Buyer')}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-medium text-gray-600">{t('dashboard.headlineValue', 'Headline Value')}:</p>
                    <p className="text-xl font-bold text-gray-400 line-through numeric">{formatCurrency(activeDecision.highestHeadlinePrice)}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-5 flex-1">
                  {activeDecision.consOfHighest.map((con, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-amber-50/50 p-3 rounded-lg border border-amber-100/50">
                      <span className="text-amber-600 font-bold mt-0.5">⚠️</span>
                      <span className="text-sm text-gray-700 font-medium leading-relaxed">{t(`data.decisions.${activeDecision.id}.con${idx+1}`, con)}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 mb-5">
                  <p className="text-xs text-gray-500 mb-1">{t('dashboard.yourRequirement', 'Your requirement')}: <span className="font-bold text-gray-700">≤ 7 days</span></p>
                  <div className="flex items-center gap-1.5 text-green-600 text-sm font-bold">
                    <CheckCircle2 size={16} /> {t('dashboard.fitsRequirement', '✓')}
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <p className="text-sm font-bold text-amber-700">
                    {t('dashboard.notFeasibleResult', 'Not feasible for your needs')}
                  </p>
                  <Button variant="secondary" className="text-brand-primary font-semibold w-full sm:w-auto" onClick={() => navigate(`/farmer/decisions/${activeDecision.id}`)}>
                    {t('dashboard.compareOptions', 'Compare Options')}
                  </Button>
                </div>
              </div>
            </Card>
          </section>
        )}

        {/* MARKET SNAPSHOT */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('dashboard.marketSnapshot', '📊 TODAY\'S MARKET SNAPSHOT')}</h2>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>
          <Card className="border border-gray-200 shadow-sm h-[calc(100%-2.5rem)] bg-white">
            <div className="p-6 flex flex-col h-full space-y-4">
              {marketSnapshot.map((item) => {
                const isSuccess = item.id === 'ms-2'; // Best Net Option is success
                const isInfo = item.id === 'ms-1'; // Best Price is info
                const isWarning = item.id === 'ms-3'; // Arrivals is warning
                
                return (
                  <div 
                    key={item.id} 
                    className={`p-5 rounded-xl border flex-1 flex flex-col justify-center ${
                      isSuccess ? 'bg-green-50/40 border-green-200/60' : 
                      isWarning ? 'bg-amber-50/40 border-amber-200/60' : 
                      'bg-blue-50/40 border-blue-200/60'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`mt-0.5 p-2 rounded-xl ${
                        isSuccess ? 'bg-green-100 text-green-700' : 
                        isWarning ? 'bg-amber-100 text-amber-700' : 
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {isSuccess && <CircleCheckBig size={20} />}
                        {isWarning && <TrendingDown size={20} />}
                        {isInfo && <BarChart4 size={20} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">{t(`data.marketSnapshot.${item.id}.label`, item.label)}</p>
                          {isSuccess && <span className="text-brand-deep text-xs">⭐</span>}
                        </div>
                        <p className={`font-display text-2xl font-bold mt-1 numeric ${
                          isSuccess ? 'text-green-800' : 
                          isWarning ? 'text-amber-800' : 
                          'text-blue-800'
                        }`}>
                          {t(`data.marketSnapshot.${item.id}.value`, item.value)}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">{t(`data.marketSnapshot.${item.id}.explanation`, item.explanation)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </section>

      </div>

      {/* 5. MARKET PRESSURE + SALE WINDOW */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('dashboard.marketPressureTitle', '📊 MARKET PRESSURE + SALE WINDOW')}</h2>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>
        <Card className="border border-gray-200 shadow-sm bg-white overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            
            {/* Market Pressure */}
            <div className="p-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">{t('dashboard.marketPressureLabel', 'MARKET PRESSURE')}</h3>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-xl font-bold text-gray-900">{t(`dashboard.pressureLevel.${marketPressure.level}`, marketPressure.level)}</span>
                <span className="text-2xl">🟡</span>
              </div>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="font-medium text-gray-800">{t('dashboard.arrivalsLabel', 'Arrivals')}:</span>
                  <span>{t('dashboard.arrivalsValue', marketPressure.arrivalsText)}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-medium text-gray-800">{t('dashboard.priceTrendLabel', 'Price trend')}:</span>
                  <span>{t('dashboard.priceTrendValue', marketPressure.priceTrendText)}</span>
                </li>
              </ul>
            </div>

            {/* Sale Window */}
            <div className="p-6 bg-gradient-to-br from-transparent to-green-50/50 flex flex-col">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">{t('dashboard.saleWindowLabel', 'SALE WINDOW')}</h3>
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl">🟢</span>
                <span className="text-lg font-bold text-green-800 leading-tight">{t('dashboard.saleWindowStatus', saleWindow.message)}</span>
              </div>
              <p className="text-base font-medium text-gray-700 mb-6 flex-1">
                {t('dashboard.saleWindowRecommendation', saleWindow.recommendation)}
              </p>
              <Button variant="secondary" className="self-start text-brand-primary font-semibold" onClick={() => navigate('/farmer/market')}>
                {t('dashboard.viewMarketAnalysis', 'VIEW MARKET ANALYSIS')} <ArrowRight size={18} className="ml-2" />
              </Button>
            </div>

          </div>
        </Card>
      </section>

      {/* 6. ACTION ITEMS */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('dashboard.yourActionItems', 'YOUR ACTION ITEMS')}</h2>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>
        <Card className="border border-gray-200 shadow-sm flex flex-col bg-white">
          <div className="p-6 flex-1 space-y-4">
            {actionItems.map((item) => {
              const isSuccess = item.type === 'success';
              const isWarning = item.type === 'warning';
              
              return (
                <div 
                  key={item.id} 
                  className={`p-4 rounded-xl flex items-center gap-4 cursor-pointer transition-all hover:bg-gray-50 bg-white border ${
                    isSuccess ? 'border-green-200' : 
                    isWarning ? 'border-amber-200' : 
                    'border-blue-200'
                  }`}
                  onClick={() => item.link && navigate(item.link)}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                    isSuccess ? 'bg-green-100 text-green-700' : 
                    isWarning ? 'bg-amber-100 text-amber-700' : 
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {isSuccess ? <CheckCircle2 size={24} /> : isWarning ? <TrendingDown size={24} /> : <BarChart4 size={24} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-bold text-gray-900 leading-tight mb-1">{t(`data.actionItems.${item.id}.title`, item.title)}</p>
                    <p className="text-sm text-gray-600">{t(`data.actionItems.${item.id}.description`, item.description)}</p>
                  </div>
                  <div className="text-gray-400 bg-gray-50 rounded-full p-2">
                    <ChevronRight size={20} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      {/* 7. ACTIVE LOTS */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('dashboard.yourActiveLots', 'YOUR ACTIVE LOTS')}</h2>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeLots.length > 0 ? (
            activeLots.map((lot) => (
              <Card key={lot.id} interactive className="p-5 flex flex-col justify-between hover:border-brand-primary/50 transition-colors shadow-sm bg-white border border-gray-200" onClick={() => navigate(`/farmer/lots/${lot.id}`)}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gray-50 border border-gray-100 text-3xl flex items-center justify-center rounded-2xl shrink-0">
                    {lot.emoji}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 leading-tight text-lg mb-1">{t(`data.crops.${lot.crop}`, lot.crop)} <span className="text-gray-400 font-normal">· {lot.quantity}</span></h4>
                    <p className="text-sm text-gray-600">
                      {lot.quality} · {t(`data.locations.${lot.location}`, lot.location)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {lot.status === 'DECISION_READY' ? '🟢' : '🟡'}
                    </span>
                    <span className="text-sm font-bold text-gray-700">{t(`data.status.${lot.status}`, lot.status)}</span>
                  </div>
                  <div className="bg-gray-50 rounded-full p-1.5 text-gray-400 hover:text-brand-primary transition-colors">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full p-8 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
              {t('dashboard.noActiveLots', 'No active lots yet')}
            </div>
          )}
          
          <div className="col-span-full mt-4 flex justify-center">
            <Button variant="secondary" className="text-brand-primary font-bold shadow-sm bg-white px-8 py-3 h-auto" onClick={() => navigate('/farmer/lots')}>
              {t('dashboard.viewAllLots', '[ VIEW ALL LOTS ]')}
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
};
