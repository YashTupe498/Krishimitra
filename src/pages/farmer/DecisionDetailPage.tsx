import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, 
  MapPin, 
  TrendingUp, 
  Truck, 
  Receipt, 
  CheckCircle2,
  AlertTriangle,
  Calculator,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  CalendarClock,
  FileCheck
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import type { ActiveDecision } from '../../data/mockFarmerDashboard';

const getUnavailableDecision = (): ActiveDecision | null => null;

export const DecisionDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Decision records are not yet persisted by the backend. Do not render a mock decision as real advice.
  const decision = getUnavailableDecision();

  if (!decision) {
    return <div className="p-8">Decision not found</div>;
  }

  // Demo values reflecting the explicit arithmetic constraint
  const grossSaleValue = 112000;
  const transportCost = 1500;
  const handlingCost = 2000;
  const netRealization = 108500;

  const formatCurrency = (val: number) => {
    return '₹ ' + val.toLocaleString('en-IN');
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-28 md:pb-24 max-w-4xl mx-auto">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 border-b border-gray-200 pb-4 pt-4 md:pt-0">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
          aria-label={t('common.back', 'Back')}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
            {t('decisions.headerTag', 'Active Decision')}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">
            {t('decisions.title', 'Where should you sell?')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t('decisions.subtitle', 'Compare the likely outcome, costs and constraints before deciding.')}
          </p>
        </div>
      </div>

      {/* LOT SUMMARY */}
      <Card className="border-gray-200 shadow-sm bg-white overflow-hidden">
        <div className="p-5 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-3xl shrink-0">
              🧅
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {t(`data.crops.${decision.crop}`, decision.crop)}
              </h2>
              <div className="flex items-center gap-2 mt-1 text-sm font-medium text-gray-600">
                <span>{decision.quantity}</span>
                <span>•</span>
                <span>{decision.quality}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><MapPin size={12} /> {t(`data.locations.${decision.location}`, decision.location)}</span>
              </div>
            </div>
          </div>
          <Badge variant="success" className="px-3 py-1 bg-green-100 text-green-800 border-green-200 uppercase tracking-wider font-bold">
            🟢 {t('decisions.status.feasible', 'Feasible')}
          </Badge>
        </div>
      </Card>

      {/* RECOMMENDED ACTION */}
      <Card className="border border-brand-primary shadow-sm overflow-hidden relative group bg-white">
        <div className="p-6 md:p-8 relative z-10 flex flex-col items-center sm:items-start text-center sm:text-left">
          <div className="flex items-center gap-2 mb-3 bg-brand-primary/10 text-brand-primary px-3 py-1.5 rounded-full border border-brand-primary/20 w-fit mx-auto sm:mx-0">
            <CheckCircle2 size={18} />
            <span className="text-sm font-bold uppercase tracking-wider">
              {t('decisions.recommendedAction', 'Recommended Action')}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mt-2 mb-2">
            {t('decisions.sellAt', 'Sell at')} <span className="text-brand-primary">{t(`data.locations.${decision.recommendedDestination}`, decision.recommendedDestination)}</span>
          </h2>
          <p className="text-gray-600 font-medium text-lg mt-1 mb-6">
            {t('decisions.recommendedContext', 'Best feasible option for your current lot.')}
          </p>
          <ul className="flex flex-col sm:flex-row flex-wrap justify-center sm:justify-start gap-x-8 gap-y-3 mt-2 text-base text-gray-700 font-medium w-full border-t border-gray-100 pt-6">
            <li className="flex items-center justify-center sm:justify-start gap-2"><CheckCircle2 size={20} className="text-green-600" /> {t('decisions.benefit1', 'Fits payment requirements')}</li>
            <li className="flex items-center justify-center sm:justify-start gap-2"><CheckCircle2 size={20} className="text-green-600" /> {t('decisions.benefit2', 'Lower transport burden')}</li>
          </ul>
        </div>
      </Card>

      {/* TRANSPARENT CALCULATION WATERFALL */}
      <section className="mt-12 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('decisions.calculationTitle', 'How this estimate is calculated')}</h2>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        <div className="space-y-3 relative">
          
          {/* Vertical connecting line */}
          <div className="absolute left-8 top-10 bottom-10 w-0.5 bg-gray-200 z-0 hidden sm:block"></div>

          {/* 1. GROSS SALE VALUE */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0">
                <TrendingUp size={20} className="text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('decisions.grossSaleValue', 'Gross Sale Value')}</p>
                <p className="text-sm font-medium text-gray-600 mt-0.5">{t('decisions.grossSaleContext', 'Applicable opportunity value')}</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 ml-16 sm:ml-0 numeric">
              {formatCurrency(grossSaleValue)}
            </div>
          </div>

          <div className="py-1 pl-24 hidden sm:block relative z-10">
            <ArrowDownIcon className="text-gray-300 w-5 h-5" />
          </div>

          {/* 2. QUALITY */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5 shadow-sm relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ml-0 sm:ml-12">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 text-gray-600 border border-gray-200">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="text-base font-bold text-gray-900">{t('decisions.qualityAdjustment', 'Quality')}</p>
                <p className="text-sm text-gray-500 font-medium">{decision.quality}</p>
              </div>
            </div>
            <div className="text-sm font-bold text-gray-400 ml-14 sm:ml-0">
              {t('decisions.noAdjustment', 'No demo adjustment')}
            </div>
          </div>

          <div className="py-2 pl-24 hidden sm:block relative z-10 text-xs font-bold text-gray-400 uppercase tracking-widest">
            {t('decisions.actualCosts', 'Actual Costs')}
          </div>

          {/* 3. Transport Cost */}
          <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 md:p-5 shadow-sm relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ml-0 sm:ml-12">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0 text-red-600">
                <Truck size={18} />
              </div>
              <div>
                <p className="text-base font-bold text-red-900">{t('decisions.transport', 'Transport')}</p>
                <p className="text-sm text-red-700/80 font-medium">{t('decisions.transportContext', 'Estimated transport cost')}</p>
              </div>
            </div>
            <div className="text-xl font-bold text-red-700 ml-14 sm:ml-0 flex items-center gap-2 numeric">
              <TrendingDown size={18} />
              - {formatCurrency(transportCost)}
            </div>
          </div>

          {/* 4. Handling Cost */}
          <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 md:p-5 shadow-sm relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ml-0 sm:ml-12">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0 text-red-600">
                <Receipt size={18} />
              </div>
              <div>
                <p className="text-base font-bold text-red-900">{t('decisions.handling', 'Handling & Other Charges')}</p>
                <p className="text-sm text-red-700/80 font-medium">{t('decisions.handlingContext', 'Applicable market charges')}</p>
              </div>
            </div>
            <div className="text-xl font-bold text-red-700 ml-14 sm:ml-0 flex items-center gap-2 numeric">
              <TrendingDown size={18} />
              - {formatCurrency(handlingCost)}
            </div>
          </div>

          <div className="py-1 pl-24 hidden sm:block relative z-10">
            <ArrowDownIcon className="text-gray-300 w-6 h-6" />
          </div>

          {/* 5. NET REALIZATION (Final) */}
          <div className="bg-green-50/80 border-2 border-green-500 rounded-2xl p-6 md:p-8 shadow-md relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-green-600 text-white shadow-sm flex items-center justify-center shrink-0">
                <Calculator size={28} />
              </div>
              <div>
                <p className="text-sm font-bold text-green-700 uppercase tracking-widest mb-1">{t('decisions.estimatedNetRealization', 'Estimated Net Realization')}</p>
                <p className="text-sm font-medium text-green-800/80">{t('decisions.netRealizationContext', 'Estimated amount after applicable costs')}</p>
              </div>
            </div>
            <div className="text-4xl md:text-5xl font-sans font-bold text-green-800 relative z-10 whitespace-nowrap numeric">
              {formatCurrency(netRealization)}
            </div>
          </div>
        </div>
      </section>

      {/* CONSTRAINTS & COMPARISONS */}
      <section className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Payment Requirement */}
        <Card className="bg-white border-gray-200 shadow-sm h-full overflow-hidden">
          <div className="p-6 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-5 border-b border-gray-100 pb-4">
              <CalendarClock size={20} className="text-brand-deep" />
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('decisions.paymentRequirementTitle', 'Your Payment Requirement')}</h3>
            </div>
            <div className="flex-1 flex flex-col">
              <p className="text-2xl font-bold text-gray-900 mb-6">{t('decisions.paymentRequirement', 'Within 7 days')}</p>
              
              <div className="bg-green-50/50 rounded-xl p-4 border border-green-100 mb-4 flex-1">
                <p className="text-sm text-gray-600 mb-1">{t('decisions.recommendedOpportunity', 'Opportunity payment:')}</p>
                <p className="text-lg font-bold text-green-900 flex flex-wrap items-center gap-2">
                  {t('decisions.paymentDays5', '5 days')} 
                  <span className="text-green-700 bg-green-100/50 px-2 py-0.5 rounded text-xs flex items-center gap-1 ml-auto"><CheckCircle2 size={14}/> {t('decisions.fitsRequirement', 'Fits your requirement')}</span>
                </p>
              </div>
              
              <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100 flex-1">
                <p className="text-sm text-gray-600 mb-1">{t('decisions.alternativeOpportunity', 'Alternative (Highest price):')}</p>
                <p className="text-lg font-bold text-amber-900 flex flex-wrap items-center gap-2">
                  {t('decisions.paymentDays14', '7-14 days')} 
                  <span className="text-amber-700 bg-amber-100/50 px-2 py-0.5 rounded text-xs flex items-center gap-1 ml-auto"><AlertTriangle size={14}/> {t('decisions.violatesRequirement', 'May not fit requirement')}</span>
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Why Not Highest */}
        <Card className="bg-white border-amber-200/60 shadow-sm h-full overflow-hidden">
          <div className="p-6 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-5 border-b border-gray-100 pb-4">
              <AlertTriangle size={20} className="text-amber-600" />
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('decisions.whyNotHighestTitle', 'Why not the highest headline price?')}</h3>
            </div>
            <div className="flex-1">
              <p className="text-base text-gray-600 mb-5">
                {t('decisions.alternativeHeadline', 'Alternative opportunity headline value:')} <span className="font-bold text-gray-400 line-through decoration-gray-400 numeric ml-2 text-xl">₹ 1,18,000</span>
              </p>
              <ul className="space-y-4">
                <li className="text-base font-medium text-gray-800 flex items-start gap-3 bg-amber-50/50 p-4 rounded-xl border border-amber-100/50">
                  <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                  <span>{t('decisions.conTransport', 'Higher transport cost to distant market')}</span>
                </li>
                <li className="text-base font-medium text-gray-800 flex items-start gap-3 bg-amber-50/50 p-4 rounded-xl border border-amber-100/50">
                  <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                  <span>{t('decisions.conPayment', 'Longer payment period (violates constraints)')}</span>
                </li>
              </ul>
              <div className="mt-8 pt-5 border-t border-gray-100">
                <p className="text-base font-bold text-amber-700">
                  {t('decisions.notRecommended', 'Not recommended for this lot.')}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* DECISION BASIS / EVIDENCE */}
      <section className="mt-10">
        <Card className="bg-white border-gray-200">
          <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <FileCheck size={18} className="text-brand-deep" />
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{t('decisions.decisionBasis', 'Decision Basis')}</h3>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> {t('decisions.basisMarket', 'Market info: Demo')}</div>
              <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> {t('decisions.basisTerms', 'Opportunity terms: Demo data')}</div>
              <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> {t('decisions.basisQuality', 'Quality: Grade B')}</div>
              <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> {t('decisions.basisTransport', 'Transport: Estimated')}</div>
            </div>
          </div>
        </Card>
      </section>

      {/* ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 md:left-[260px] bg-white border-t border-gray-200 p-4 px-6 md:px-8 flex items-center justify-between shadow-[0_-4px_24px_rgba(0,0,0,0.06)] z-40">
        <Button variant="ghost" onClick={() => navigate(-1)} className="hidden sm:flex text-gray-600">
          {t('common.back', 'Back')}
        </Button>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button variant="secondary" className="flex-1 sm:flex-none">
            {t('decisions.contactBuyer', 'Contact Buyer')}
          </Button>
          <Button variant="primary" icon={<ArrowRight size={18} />} iconPosition="right" className="flex-1 sm:flex-none px-6 md:px-8 shadow-sm">
            {t('decisions.acceptProceed', 'Accept & Proceed')}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Helper component for the down arrow in the waterfall
function ArrowDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      {...props} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </svg>
  );
}
