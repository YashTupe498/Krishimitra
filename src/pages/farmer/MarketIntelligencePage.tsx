import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Calendar, Package, RefreshCw, Activity, MapPin,
  Truck, Box, Lightbulb, MessageSquare, Target, ShoppingBag, Star, Bell, ShieldCheck, CheckCircle2, AlertCircle, TrendingUp as TrendingUpIcon
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { farmerLotsApi } from '../../services/farmerLotsApi';
import { getMarketIntelligence } from '../../services/marketIntelligence/marketIntelligenceResolver';
import type { UnifiedMarketIntelligence } from '../../services/marketIntelligence/marketIntelligenceResolver';
import { LogisticsDetailsModal } from '../../components/farmer/market/LogisticsDetailsModal';
import { StorageDetailsModal } from '../../components/farmer/market/StorageDetailsModal';
import { useTranslation } from 'react-i18next';
import { BuyerTrustModal } from '../../components/farmer/offers/BuyerTrustModal';

const premiumCard = "bg-[#FCFDFB] rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#D8E2DB] flex flex-col relative transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_12px_30px_rgba(25,77,46,0.12)] hover:border-[#194D2E] group";
const premiumHeader = "text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-4";

export const MarketIntelligencePage: React.FC = () => {
  const { t } = useTranslation();

  /* ── dynamic translation helper for backend-generated English strings ── */
  const translateDynamic = (text: string) => {
    if (!text) return text;
    const map: Record<string, string> = {
      "Recent arrival quantity data is unavailable to assess pressure.": t("marketIntelligence.unavailablePressureDesc"),
      "Arrivals are tightening while prices are moving upward, indicating stronger near-term supply pressure.": t("marketIntelligence.highPressureDesc"),
      "Supply appears adequate as prices trend downward.": t("marketIntelligence.lowPressureDesc"),
      "Market forces appear balanced with mixed or steady price and arrival signals.": t("marketIntelligence.moderatePressureDesc"),
      "Market conditions are relatively stable. Monitor for future price momentum.": t("marketIntelligence.unavailableWindowDesc"),
      "Current price momentum and tighter arrivals indicate a relatively favorable near-term selling window.": t("marketIntelligence.reason1"),
      "Declining prices suggest a cautious approach. Consider waiting if quality allows.": t("marketIntelligence.cautionWindowDesc"),
      "Insufficient price trends or arrival data prevents a confident assessment.": t("marketIntelligence.insufficientWindowDesc"),
      "Only single historical observation available for this market": t("marketIntelligence.onlySingleHistorical"),
      "Highest reported regional price": t("marketIntelligence.reason2"),
      "Highly competitive price": t("marketIntelligence.reason3"),
      "Price is below regional maximum": t("marketIntelligence.reason4"),
      "Strong market demand pressure": t("marketIntelligence.reason5"),
      "Verified buyer demand available": t("marketIntelligence.reason6"),
      "STRONG": t("marketIntelligence.strongOpportunity"),
      "GOOD": t("marketIntelligence.goodOpportunity"),
      "FAIR": t("marketIntelligence.fairOpportunity"),
      "HIGH": t("marketIntelligence.highPressure"),
      "MODERATE": t("marketIntelligence.moderatePressure"),
      "LOW": t("marketIntelligence.lowPressure"),
      "Onion": t("marketIntelligence.onion"),
      "Pimpalgaon Baswant APMC": t("marketIntelligence.pimpalgaon"),
      "Lasalgaon(Vinchur) APMC": t("marketIntelligence.lasalgaon"),
      "Yeola APMC": t("marketIntelligence.yeola"),
      "Manmad APMC": t("marketIntelligence.manmad"),
      "Showing market-wide arrivals across all commodities (not onion-specific).": t("marketIntelligence.allCommoditiesNote") || "Showing market-wide arrivals across all commodities (not onion-specific).",
      "Nashik, Maharashtra": t("marketIntelligence.nashikMaharashtra") || "Nashik, Maharashtra",
      "Mini Truck (1.5T)": t("marketIntelligence.miniTruck") || "Mini Truck (1.5T)",
      "Nashik Farm": t("marketIntelligence.nashikFarm") || "Nashik Farm",
      "Pimpalgaon Cold Chain & Warehousing": t("marketIntelligence.pimpalgaonColdChain") || "Pimpalgaon Cold Chain & Warehousing"
    };
    return map[text] || text;
  };

  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMarket, setSelectedMarket] = useState('pimpalgaon-baswant');
  const [isTrustModalOpen, setIsTrustModalOpen] = useState(false);
  const [intelligence, setIntelligence] = useState<UnifiedMarketIntelligence | null>(null);
  const [isLogisticsModalOpen, setIsLogisticsModalOpen] = useState(false);
  const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let lot: any = {
          id: id || 'demo-lot',
          crop: 'Onion',
          quantity: '141',
          unit: 'kg',
          location: 'Nashik, Maharashtra', district: 'Nashik', state: 'Maharashtra', qualityGrade: 'A',
          farmerId: 'demo-farmer-id', status: 'MARKET_ANALYSIS_READY', qualityAssessment: null,
          constraints: { paymentRequirement: 'Flexible', transportCapability: 'Available', storageCapability: 'Available' },
          createdAt: '', updatedAt: ''
        };

        if (id) {
          const { data: { session } } = await supabase.auth.getSession();
          lot = await farmerLotsApi.get(session?.access_token || '', id);
        } else {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase
              .from('farmer_profiles')
              .select('primary_crop, district')
              .eq('id', user.id)
              .single();
            if (profile) {
              if (profile.primary_crop) lot.crop = profile.primary_crop;
              if (profile.district) lot.district = profile.district;
            }
          }
        }

        const resolvedData = await getMarketIntelligence(lot, selectedMarket);
        setIntelligence(resolvedData);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch market data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, selectedMarket]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-40 bg-gray-200 rounded-2xl"></div>)}</div>
        <div className="h-64 bg-gray-200 rounded-2xl"></div>
      </div>
    );
  }

  if (error || !intelligence) {
    return (
      <div className="max-w-6xl mx-auto flex flex-col items-center justify-center p-16 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">{t("marketIntelligence.dataUnavailable")}</h2>
        <p className="text-sm text-gray-500 max-w-md break-words">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-6"><RefreshCw size={14} className="mr-2" /> {t("marketIntelligence.refresh")}</Button>
      </div>
    );
  }

  /* ── Computed Data ── */
  const active = intelligence.snapshot;
  const highestPrice = intelligence.highestNearbyPrice;
  const priceHistory = intelligence.priceHistory;
  const arrivalHistory = intelligence.arrivalHistory;
  const computedDirection = intelligence.trend.direction;
  const computedPct = intelligence.trend.percentage_change;
  const frontendPressure = intelligence.pressure;
  const frontendWindow = intelligence.sellingWindow;
  const oppScore = { status: intelligence.opportunityStatus, score: intelligence.opportunityScore, reasons: intelligence.opportunityReasons };
  const logisticsData = intelligence.logistics;
  const storageData = intelligence.storage;
  const netRealization = intelligence.netRealizationPerQuintal;
  const isNetRealizationFavorable = intelligence.sellVsStore?.isFavorable ?? true;
  const arrivalData = arrivalHistory.length > 0 ? arrivalHistory[arrivalHistory.length - 1] : null;
  const formattedArrivalHistory = arrivalHistory.map(a => ({ date: a.date, arrival: a.arrival_quantity, fullDate: (a as any).fullDate }));
  const data = { crop: intelligence.lot.crop, location: { district: intelligence.lot.district, state: intelligence.lot.state }, observation_date: intelligence.observationDate, markets: intelligence.nearbyMarkets };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 pb-16 pt-4">

      {/* ── PAGE TITLE ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-[#14532D] tracking-tight">{t("marketIntelligence.title")}</h1>
          <p className="text-sm text-gray-500 mt-1">{t("marketIntelligence.subtitle")}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-gray-500 font-medium">{t("marketIntelligence.lastUpdated")} {data.observation_date}</span>
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full ml-2"></span>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t("marketIntelligence.dataCurrent")}</p>
          </div>
          <Button variant="secondary" className="flex items-center gap-2 text-xs" onClick={() => window.location.reload()}>
            <RefreshCw size={12} /> {t("marketIntelligence.refresh")}
          </Button>
        </div>
      </div>

      {/* ── CROP INFO BAR ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#EDF2EE] flex items-center justify-center"><Package size={18} className="text-[#194D2E]" /></div>
          <div>
            <span className="text-base font-bold text-gray-900">{translateDynamic(data.crop)}</span>
            <span className="ml-2 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">{t("marketIntelligence.gradeLabel")} {intelligence.lot.qualityGrade || '—'}</span>
            <p className="text-xs text-gray-500 mt-0.5">{translateDynamic(`${data.location.district}, ${data.location.state}`)}</p>
          </div>
        </div>
        <div className="flex items-center gap-8 text-xs text-gray-500">
          <div className="text-center"><span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">{t("marketIntelligence.quantity")}</span><span className="font-bold text-gray-900 text-sm">{intelligence.lot.quantity} {intelligence.lot.unit}</span></div>
          <div className="text-center"><span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">{t("marketIntelligence.availability")}</span><span className="font-bold text-gray-900 text-sm">{t("marketIntelligence.immediate")}</span></div>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-green-600" />
          <div><span className="text-xs font-bold text-gray-900">{t("marketIntelligence.marketDataCurrent")}</span><br/><span className="text-[10px] text-gray-500">{t("marketIntelligence.latestObservation")}</span></div>
        </div>
      </div>

      {/* ── ROW 1: Price · Markets · Pressure · Window ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">

        {/* Current Modal Price */}
        <div className={`${premiumCard} md:col-span-3`}>
          <h3 className={premiumHeader}><TrendingUpIcon size={14}/> {t("marketIntelligence.currentModalPrice")}</h3>
          <span className="text-4xl font-black text-gray-900 tracking-tight">₹{active?.modal_price?.toLocaleString() || '--'}<span className="text-sm font-bold text-gray-400">/q</span></span>
          <span className={`text-xs font-bold mt-1 ${computedDirection === 'UP' ? 'text-green-600' : computedDirection === 'DOWN' ? 'text-orange-500' : 'text-gray-500'}`}>
            {computedDirection === 'UP' ? '↑' : computedDirection === 'DOWN' ? '↓' : '→'} {computedPct}%
          </span>
          <p className="text-[10px] text-gray-500 font-medium mt-2">{computedDirection === 'UP' ? t("marketIntelligence.pricesMovingUpward") : computedDirection === 'DOWN' ? t("marketIntelligence.pricesTrendingDownward") : t("marketIntelligence.pricesRemainingStable")}</p>
          <div className="flex gap-6 pt-4 mt-auto border-t border-gray-100 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
            <div><span className="block text-xs text-gray-900">₹{active?.min_price?.toLocaleString()}</span>{t("marketIntelligence.low")}:</div>
            <div><span className="block text-xs text-gray-900">₹{active?.max_price?.toLocaleString()}</span>{t("marketIntelligence.high")}:</div>
          </div>
        </div>

        {/* Market Snapshot */}
        <div className={`${premiumCard} md:col-span-3`}>
          <h3 className={premiumHeader}><Calendar size={14}/> {t("marketIntelligence.marketSnapshot")}</h3>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black text-gray-900">{data.markets.length}</span>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <span className="block">{t("marketIntelligence.markets")}</span>
              <span className="block">{t("marketIntelligence.compared")}</span>
            </div>
            <div className="ml-auto text-right">
              <span className="text-lg font-black text-gray-900">₹{highestPrice.toLocaleString()}/q</span>
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">{t("marketIntelligence.highestNearby")}</span>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center pt-4 mt-6 border-t border-gray-100 text-center">
            <div className="flex items-center text-gray-400 mb-1"><Calendar size={14}/></div>
            <span className="text-xs font-black text-gray-900">{data.observation_date}</span>
            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">{t("marketIntelligence.latestObservation")}</span>
          </div>
        </div>

        {/* Market Pressure */}
        <div className={`${premiumCard} md:col-span-3`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2"><Activity size={14}/> {t("marketIntelligence.pressure")}</h3>
            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">{translateDynamic(frontendPressure.level)}</span>
          </div>
          <p className="text-xs text-gray-700 font-medium leading-relaxed mb-auto">
            {translateDynamic(frontendPressure.description)}
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4 mt-6 border-t border-gray-100">
            <div>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest block mb-1">{t("marketIntelligence.arrivalsTrend")}</span>
              <span className="text-xs font-bold text-gray-900">{intelligence.arrivalTrend === 'DECLINING' ? t("marketIntelligence.trendDeclining") : intelligence.arrivalTrend === 'INCREASING' ? t("marketIntelligence.trendIncreasing") : intelligence.arrivalTrend === 'STABLE' ? t("marketIntelligence.trendStable") : t("marketIntelligence.unavailable")}</span>
            </div>
            <div>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest block mb-1">{t("marketIntelligence.buyerDemand")}</span>
              <span className="text-xs font-bold text-gray-900">{t("marketIntelligence.demoDemand")}</span>
            </div>
          </div>
        </div>

        {/* Selling Window */}
        <div className={`${premiumCard} md:col-span-3`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2"><Calendar size={14}/> {t("marketIntelligence.sellingWindow")}</h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${frontendWindow.level === 'FAVORABLE' ? 'text-green-700 bg-green-50' : frontendWindow.level === 'CAUTION' ? 'text-orange-600 bg-orange-50' : 'text-gray-600 bg-gray-50 border border-gray-100'}`}>{frontendWindow.level === 'FAVORABLE' ? t("marketIntelligence.favorable") : frontendWindow.level === 'CAUTION' ? t("marketIntelligence.caution") : t("marketIntelligence.UNAVAILABLE")}</span>
          </div>
          <p className="text-xs text-gray-700 font-medium leading-relaxed mb-auto">
            {translateDynamic(frontendWindow.description)}
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4 mt-6 border-t border-gray-100">
            <div>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest block mb-1">{t("marketIntelligence.recommended")}</span>
              <span className="text-sm font-black text-gray-900">3–5 {t("marketIntelligence.days")}</span>
              <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest block">{t("marketIntelligence.confidence")}: {t("marketIntelligence.medium")}</span>
            </div>
            <div>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest block mb-1">{t("marketIntelligence.expectedPrice")}</span>
              <span className="text-sm font-black text-gray-900">₹4,050 –<br/>₹4,350/q</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 2: Nearby Markets · Price Trend · Market Arrivals ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">

        {/* Nearby Markets */}
        <div className={`${premiumCard} md:col-span-3`}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0">{t("marketIntelligence.nearbyMarkets")}</h3>
            <select aria-label="Select a market" className="text-[10px] border rounded px-2 py-1 bg-white" value={selectedMarket} onChange={e => setSelectedMarket(e.target.value)}>
              {data.markets.map((m: any) => <option key={m.marketId} value={m.marketId}>{translateDynamic(m.market_name)}</option>)}
            </select>
          </div>
          <div className="space-y-3 mt-2">
            {data.markets.map((m: any) => {
              const isSelected = m.marketId === selectedMarket;
              const diff = highestPrice - (m.modal_price || 0);
              const barWidth = highestPrice > 0 ? ((m.modal_price || 0) / highestPrice) * 100 : 0;
              
              const mNet = intelligence.nearbyNetRealizationPerQuintal[m.marketId];

              return (
                <button type="button" key={m.marketId} className="cursor-pointer text-left w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#194D2E] rounded" onClick={() => setSelectedMarket(m.marketId)} aria-pressed={isSelected}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-[11px] font-bold ${isSelected ? 'text-[#194D2E]' : 'text-gray-600'}`}>{translateDynamic(m.market_name)}</span>
                    <span className={`text-sm font-black ${isSelected ? 'text-[#194D2E]' : 'text-gray-800'}`}>₹{(m.modal_price || 0).toLocaleString()}/q</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden mb-1">
                    <div className={`h-full rounded-full transition-all duration-500 ${isSelected ? 'bg-[#194D2E]' : 'bg-[#4A8B6B]'}`} style={{ width: `${barWidth}%` }} />
                  </div>
                  <div className="flex justify-between items-center">
                    {mNet ? (
                      <span className="text-[9px] font-bold text-gray-500">Net: ₹{mNet.toLocaleString(undefined, {maximumFractionDigits: 0})}/q</span>
                    ) : (
                      <span className="text-[9px] font-bold text-gray-400">Net: Unavailable</span>
                    )}
                    {diff === 0 ? <span className="text-[8px] font-bold text-green-600 uppercase tracking-widest">{t("marketIntelligence.highest")}</span>
                    : <span className="text-[8px] font-bold text-red-500 uppercase tracking-widest">↘ ₹{diff.toLocaleString()}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Price Trend */}
        <div className={`${premiumCard} md:col-span-5`}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0">{t("marketIntelligence.priceTrend")}</h3>
            <select aria-label="Price-history period" className="text-[10px] border rounded px-2 py-1 bg-white">
              <option value="1Y">{t("marketIntelligence.twelveMonths")}</option>
            </select>
          </div>
          <div className="flex-1 min-h-[200px] mt-2">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={priceHistory} margin={{ top: 10, right: 10, bottom: 10, left: -10 }}>
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#aaa' }} tickMargin={8} interval={0} angle={-30} textAnchor="end" height={40} />
                <YAxis tick={{ fontSize: 9, fill: '#aaa' }} domain={['auto', 'auto']} axisLine={false} tickLine={false} tickFormatter={(v: number) => `₹${v.toLocaleString()}`} />
                <Tooltip formatter={(value: any) => [`₹${value}`, 'Price']} labelFormatter={(label: any) => `${label}`} />
                <Line type="monotone" dataKey="modal_price" stroke="#16a34a" strokeWidth={2} dot={{ r: 3, fill: '#16a34a', stroke: '#fff', strokeWidth: 1 }} activeDot={{ r: 5, fill: '#16a34a', stroke: '#fff', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Market Arrivals */}
        <div className={`${premiumCard} md:col-span-4`}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0">{t("marketIntelligence.marketArrivals")}</h3>
            <select aria-label="Arrival-history period" className="text-[10px] border rounded px-2 py-1 bg-white"><option>{t("marketIntelligence.twelveMonths")}</option></select>
          </div>
          {arrivalData ? (
            <div className="flex-1 flex flex-col justify-center py-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-gray-900 tracking-tight">
                  {((arrivalData as any).arrival_quantity || 0).toLocaleString()} {((arrivalData as any).unit || 'tonnes') === 'tonnes' ? 'T' : ((arrivalData as any).unit || 'tonnes') === 'quintals' ? 'qtl' : ((arrivalData as any).unit || 'tonnes')}
                </span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{t("marketIntelligence.latestDate")} ({((arrivalData as any).fullDate || '')})</span>
              </div>
              
              {formattedArrivalHistory.length > 1 ? (
                <div className="h-24 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formattedArrivalHistory} margin={{ top: 0, right: 0, bottom: 0, left: -25 }}>
                      <XAxis dataKey="date" tick={{ fontSize: 8, fill: '#aaa' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 8, fill: '#aaa' }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ fontSize: '10px' }} />
                      <Bar dataKey="arrival" fill="#4A8B6B" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-[9px] text-gray-500 font-medium leading-relaxed mt-2">
                    {intelligence.arrivalTrend === 'DECLINING' ? t("marketIntelligence.arrivalsDeclining") : intelligence.arrivalTrend === 'INCREASING' ? t("marketIntelligence.arrivalsIncreasing") : t("marketIntelligence.arrivalsStable")}
                  </p>
                </div>
              ) : (
                <div className="mt-4 border border-dashed border-gray-200 rounded-lg p-3 bg-gray-50">
                  <p className="text-[10px] text-gray-500 font-medium">
                    {t("marketIntelligence.oneHistoricalObs")}
                  </p>
                  <p className="text-[9px] text-gray-400 mt-1">
                    {t("marketIntelligence.moreObsRequired")}
                  </p>
                </div>
              )}
              <div className="mt-4"><span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest bg-[#EDF2EE] px-2 py-1 rounded">{intelligence.sources.arrivals === 'CURATED_DEMO' ? 'CURATED DEMO' : intelligence.sources.arrivals}</span></div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-8">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("marketIntelligence.dataUnavailable")}</p>
              <p className="text-[9px] text-gray-400 font-medium mt-2">{t("marketIntelligence.noArrivalFigure")}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── ROW 3: Opportunity · Buyer Demand · Best Buyer Match ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
        <div className={`${premiumCard} md:col-span-4 ${oppScore.status === 'STRONG' ? 'bg-[#F4F9F5] border-[#C3D9CB]' : oppScore.status === 'GOOD' ? 'bg-[#FCFDFB] border-[#D8E2DB]' : 'bg-[#FFF9F2] border-[#FCECD8]'}`}>
          <h3 className={premiumHeader}><Target size={14}/> {t("marketIntelligence.marketOpportunity")}</h3>
          <div className="flex items-baseline gap-3 mb-4">
            <span className={`text-4xl font-black ${oppScore.status === 'STRONG' ? 'text-green-600' : oppScore.status === 'GOOD' ? 'text-[#194D2E]' : 'text-orange-500'}`}>{oppScore.score ?? '—'}</span>
            <span className="text-base font-black text-gray-900 tracking-tight">{translateDynamic(oppScore.status)} {t("marketIntelligence.opportunity")}</span>
          </div>
          <ul className="space-y-2">
            {oppScore.reasons.map((r: string) => (
              <li key={r} className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                {r.includes('below') ? <AlertCircle size={14} className="text-orange-500 shrink-0" /> : <CheckCircle2 size={14} className="text-green-600 shrink-0" />}
                {translateDynamic(r)}
              </li>
            ))}
          </ul>
        </div>

        <div className={`${premiumCard} md:col-span-4 hover:bg-[#F2F8F5] border-[#E8F2EC]`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <ShoppingBag size={14}/> {t("marketIntelligence.buyerDemand")}</h3>
            <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase">{t("marketIntelligence.curatedDemo")}</span>
          </div>
          <div className="flex-1 flex flex-col py-2 relative">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-2">
              <span className="font-bold text-gray-900 text-sm">{translateDynamic(data.crop)}</span>
              <span className="text-sm font-black text-gray-900">500 kg</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <MapPin size={12} className="text-gray-400" />
              <span className="text-xs text-gray-500 font-medium">{translateDynamic("Nashik, Maharashtra")}</span>
            </div>
            <div className="mt-3">
              <span className="text-[9px] font-bold uppercase tracking-widest text-brand-primary bg-[#F4F9F5] px-2 py-0.5 rounded">{t("marketIntelligence.highDemand")}</span>
            </div>
            <Box className="text-gray-100 absolute w-32 h-32 opacity-30 right-0 bottom-0 pointer-events-none" />
          </div>
        </div>

        <div className={`${premiumCard} md:col-span-4`}>
          <h3 className={premiumHeader}><Star size={14}/> {t("marketIntelligence.bestBuyerMatch")}</h3>
          <div className="flex-1 flex flex-col py-2 relative z-10">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="font-bold text-gray-900 text-sm">{t("marketIntelligence.nashikFreshFoods")}</span>
                <div className="mt-1">
                  <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase">{t("marketIntelligence.buyerDemoProfile")}</span>
                </div>
              </div>
              <span className="text-xs font-black text-green-700 bg-green-50 px-2 py-1 rounded">92% {t("marketIntelligence.buyerMatch")}</span>
            </div>
            <div className="mt-auto pt-4 flex gap-2">
              <Button variant="secondary" onClick={() => setIsTrustModalOpen(true)} className="flex-1 text-xs py-1.5 h-auto bg-gray-50 hover:bg-gray-100 border-none">
                {t("marketIntelligence.buyerViewBuyer")}
              </Button>
            </div>
          </div>
        </div>
        
        <BuyerTrustModal 
          buyerId="buyer-demo-1" 
          buyerName="Nashik Fresh Foods" 
          isOpen={isTrustModalOpen} 
          onClose={() => setIsTrustModalOpen(false)} 
        />
      </div>

      {/* ── ROW 4: Quality · Logistics · Storage ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
        <div className={`${premiumCard} md:col-span-4`}>
          <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-3"><ShieldCheck size={12}/> {t("marketIntelligence.quality")}</h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center font-black text-gray-900 text-base border border-gray-100 shadow-sm shrink-0">A</div>
            <div>
              <span className="text-sm font-black text-gray-900 tracking-tight">{t("marketIntelligence.gradeLabel")} {intelligence.lot.qualityGrade || '—'} · {t("marketIntelligence.qualityCompatible")}</span>
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 block">{t("marketIntelligence.qualityCuratedDemo")} {t("marketIntelligence.gradeLabel")} A</span>
            </div>
          </div>
        </div>

        <div className={`${premiumCard} md:col-span-4 flex flex-col`}>
          <div className="flex justify-between items-center mb-3">
             <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><Truck size={12}/> {t("marketIntelligence.logistics")}</h3>
             {logisticsData && <span className="text-[8px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-widest">{t("marketIntelligence.demo")}</span>}
          </div>
          {logisticsData ? (
             <div className="flex-1 flex flex-col text-sm">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{t("marketIntelligence.logisticsRecommendedRoute")}</span>
                <span className="font-bold text-gray-900 text-xs mb-3">{translateDynamic(logisticsData.route.origin)} → {translateDynamic(logisticsData.route.destination)}</span>
                <div className="grid grid-cols-2 gap-3 mb-auto">
                   <div>
                      <span className="text-[9px] text-gray-400 block">{t("marketIntelligence.logisticsDistance")}</span>
                      <span className="font-bold text-gray-900">{logisticsData.distanceKm} km</span>
                   </div>
                   <div>
                      <span className="text-[9px] text-gray-400 block">{t("marketIntelligence.logisticsEstCost")}</span>
                      <span className="font-bold text-gray-900">₹{logisticsData.estimatedCostRs.toLocaleString()}</span>
                   </div>
                   <div>
                      <span className="text-[9px] text-gray-400 block">{t("marketIntelligence.logisticsTransport")}</span>
                      <span className="font-bold text-gray-900 text-xs truncate block">{translateDynamic(logisticsData.transportType)}</span>
                   </div>
                   <div>
                      <span className="text-[9px] text-gray-400 block">{t("marketIntelligence.logisticsEstTime")}</span>
                      <span className="font-bold text-gray-900">{logisticsData.estimatedTimeMin} min</span>
                   </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                   <span className="text-[10px] font-bold text-green-600 flex items-center gap-1"><CheckCircle2 size={12}/> {t("marketIntelligence.logisticsAvailable")}</span>
                   <span className="text-[10px] font-bold text-[#194D2E] cursor-pointer hover:underline" onClick={() => setIsLogisticsModalOpen(true)}>{t("marketIntelligence.logisticsViewDetails")}</span>
                </div>
             </div>
          ) : (
             <div className="flex-1 flex flex-col justify-center text-center py-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t("marketIntelligence.dataUnavailable")}</p>
                <p className="text-[9px] text-gray-400 font-medium">{t("marketIntelligence.logisticsUnavailableDesc")}</p>
             </div>
          )}
        </div>

        <div className={`${premiumCard} md:col-span-4 flex flex-col`}>
          <div className="flex justify-between items-center mb-3">
             <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><Box size={12}/> {t("marketIntelligence.storage")} & {t("marketIntelligence.decisionLabel")}</h3>
             {storageData && <span className="text-[8px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-widest">{t("marketIntelligence.demo")}</span>}
          </div>
          {storageData ? (
             <div className="flex-1 flex flex-col text-sm">
                <span className="font-bold text-gray-900 text-xs mb-3">{translateDynamic(storageData.centerName)} ({storageData.distanceKm}km)</span>
                
                {/* Sell vs Store Insight */}
                <div className="bg-gray-50 rounded-lg p-3 mb-auto">
                   <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t("marketIntelligence.sellVsStore")}</span>
                   </div>
                   <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">{t("marketIntelligence.sellNowNet")}</span>
                      <span className="font-bold text-gray-900">{netRealization ? `₹${netRealization.toLocaleString(undefined, {maximumFractionDigits: 0})}/q` : t("marketIntelligence.dataUnavailable")}</span>
                   </div>
                   <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">{t("marketIntelligence.storeCost30d")}</span>
                      <span className="font-bold text-gray-900">₹{(storageData.costPerTonnePerDayRs * 30 * (100/1000)).toLocaleString(undefined, {maximumFractionDigits: 0})}/q</span>
                   </div>
                   {intelligence.sellVsStore && <div className="flex justify-between text-xs mb-3">
                      <span className="text-gray-600">{t("marketIntelligence.estimatedStoreNet")}</span>
                      <span className="font-bold text-gray-900">₹{(intelligence.sellVsStore.storeNetRs / (intelligence.normalizedQuantityKg / 100)).toLocaleString(undefined, {maximumFractionDigits: 0})}/q</span>
                   </div>}
                   <div className={`text-[10px] font-bold px-2 py-1 rounded ${netRealization && isNetRealizationFavorable ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                      {netRealization && isNetRealizationFavorable ? t("marketIntelligence.signalStorage") : t("marketIntelligence.signalSelling")}
                   </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                   <span className="text-[10px] font-bold text-green-600 flex items-center gap-1"><CheckCircle2 size={12}/> {t("marketIntelligence.capacityAvailable")}</span>
                   <span className="text-[10px] font-bold text-[#194D2E] cursor-pointer hover:underline" onClick={() => setIsStorageModalOpen(true)}>{t("marketIntelligence.viewStorage")}</span>
                </div>
             </div>
          ) : (
             <div className="flex-1 flex flex-col justify-center text-center py-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t("marketIntelligence.dataUnavailable")}</p>
                <p className="text-[9px] text-gray-400 font-medium">{t("marketIntelligence.storageUnavailableDesc")}</p>
             </div>
          )}
        </div>
      </div>

      {/* ── ROW 5: Recommendation · Ask / Watch ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
        <div className={`${premiumCard} md:col-span-8 bg-gradient-to-br from-[#F4F9F5] to-white border-[#C3D9CB]`}>
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-6">
            <Lightbulb size={14}/> {t("marketIntelligence.kmRecommendation")}
          </div>
          <h2 className="text-3xl font-black text-[#1B4E2E] tracking-tight leading-tight mb-8">
            {frontendWindow.level === 'FAVORABLE' ? t("marketIntelligence.considerSelling") : frontendWindow.level === 'CAUTION' ? t("marketIntelligence.considerWaiting") : t("marketIntelligence.monitorMarket")}
          </h2>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t("marketIntelligence.why")}</span>
          <div className="space-y-3 mt-3">
            {computedDirection === 'UP' && (
              <div className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                <span className="text-sm font-medium text-gray-900 leading-relaxed">{t("marketIntelligence.reasonMovingUp")} ({computedPct}%).</span>
              </div>
            )}
            {((active?.modal_price || 0) >= highestPrice) && highestPrice > 0 && (
              <div className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                <span className="text-sm font-medium text-gray-900 leading-relaxed">{t("marketIntelligence.reasonHighestPrice")}</span>
              </div>
            )}
            {formattedArrivalHistory.length >= 2 && (formattedArrivalHistory[formattedArrivalHistory.length - 1].arrival || 0) < (formattedArrivalHistory[formattedArrivalHistory.length - 2].arrival || 0) && (
              <div className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                <span className="text-sm font-medium text-gray-900 leading-relaxed">{t("marketIntelligence.reasonTightening")}</span>
              </div>
            )}
            {netRealization && isNetRealizationFavorable && (
               <div className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                  <span className="text-sm font-medium text-gray-900 leading-relaxed">{t("marketIntelligence.reasonNetFavorable")}</span>
               </div>
            )}
            {computedDirection === 'DOWN' && (
               <div className="flex items-center gap-3">
                  <AlertCircle size={16} className="text-orange-500 shrink-0" />
                  <span className="text-sm font-medium text-gray-900 leading-relaxed">{t("marketIntelligence.reasonTrendingDown")}</span>
               </div>
            )}
            <div className="flex items-center gap-3">
              <CheckCircle2 size={16} className="text-green-600 shrink-0" />
              <span className="text-sm font-medium text-gray-900 leading-relaxed">{t("marketIntelligence.reasonDemoMatch")}</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-4 flex flex-col gap-6">
          {/* Ask KrishiMitra */}
          <div className={premiumCard}>
            <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-3"><MessageSquare size={14}/> {t("marketIntelligence.askKm")}</h3>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-6">{t("marketIntelligence.futureCapability")}</span>
            <Button variant="secondary" className="w-full mt-auto bg-gray-50 hover:bg-gray-100 border-none text-gray-400 font-bold pointer-events-none">
              <span className="flex items-center justify-center gap-2"><Lightbulb size={14}/> {t("marketIntelligence.voiceAssistant")}</span>
            </Button>
          </div>
          {/* Market Watch */}
          <div className={premiumCard}>
            <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-3"><Bell size={14}/> {t("marketIntelligence.marketWatch")}</h3>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-6">{t("marketIntelligence.futureCapability")}</span>
            <Button variant="secondary" className="w-full bg-gray-50 hover:bg-gray-100 border-none text-gray-400 font-bold pointer-events-none">
              {t("marketIntelligence.setMarketAlert")}
            </Button>
          </div>
        </div>
      </div>

      {/* ── ROW 6: What Does This Mean? ── */}
      <div className={`${premiumCard} mb-8`}>
        <h4 className="text-base font-black text-gray-900 tracking-tight mb-1">{t("marketIntelligence.whatDoesThisMean")}</h4>
        <p className="text-xs text-gray-500 font-medium mb-8">{t("marketIntelligence.simpleExplanation")}</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{t("marketIntelligence.prices")}</h5>
            <p className="text-xs text-gray-700">{t("marketIntelligence.pricesDesc")}</p>
          </div>
          <div>
            <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{t("marketIntelligence.arrivals")}</h5>
            <p className="text-xs text-gray-700">{t("marketIntelligence.arrivalsDesc")}</p>
          </div>
          <div>
            <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{t("marketIntelligence.pressure")}</h5>
            <p className="text-xs text-gray-700">{t("marketIntelligence.marketPressureDesc")}</p>
          </div>
          <div>
            <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{t("marketIntelligence.sellingWindow")}</h5>
            <p className="text-xs text-gray-700">{t("marketIntelligence.sellingWindowDesc")}</p>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap gap-x-5 gap-y-2 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
          <span>{t("marketIntelligence.sourcePrice")} {intelligence.sources.price === 'CURATED_DEMO' ? t("marketIntelligence.curatedDemoLabel") : intelligence.sources.price}</span>
          <span>{t("marketIntelligence.sourceArrivals")} {intelligence.sources.arrivals === 'CURATED_DEMO' ? t("marketIntelligence.curatedDemoLabel") : intelligence.sources.arrivals}</span>
          <span>{t("marketIntelligence.sourceLogistics")} {intelligence.sources.logistics === 'CURATED_DEMO' ? t("marketIntelligence.curatedDemoLabel") : intelligence.sources.logistics}</span>
          <span>{t("marketIntelligence.sourceStorage")} {intelligence.sources.storage === 'CURATED_DEMO' ? t("marketIntelligence.curatedDemoLabel") : intelligence.sources.storage}</span>
        </div>
        <LogisticsDetailsModal isOpen={isLogisticsModalOpen} onClose={() => setIsLogisticsModalOpen(false)} logistics={logisticsData} netImpactPerQuintalRs={logisticsData ? (logisticsData.estimatedCostRs / (intelligence.normalizedQuantityKg/100)) : null} />
      <StorageDetailsModal isOpen={isStorageModalOpen} onClose={() => setIsStorageModalOpen(false)} storage={storageData} sellVsStore={intelligence.sellVsStore} />
      </div>
    </div>
  );
};
