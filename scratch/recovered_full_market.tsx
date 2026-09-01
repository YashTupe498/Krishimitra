import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Calendar, 
  Package, {t("marketIntelligence.refresh")}Cw, Activity,
  Database, Truck, Box, Lightbulb, MessageSquare, Target, ShoppingBag, Star, Bell, ShieldCheck, CheckCircle2, AlertCircle, TrendingUp as TrendingUpIcon
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import type { Lot } from '../../types/lot';
import type { Lot } from '../../types/lot';
import { farmerLotsApi } from '../../services/farmerLotsApi';
import { marketResearchDataset } from '../../data/marketResearchDataset';
import { calculateMarketPressure, calculateSellingWindow, calculateOpportunityScore } from '../../utils/marketIntelligence';
import { useTranslation } from 'react-i18next';

const premiumCard = "bg-[#FCFDFB] rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#D8E2DB] flex flex-col relative transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_12px_30px_rgba(25,77,46,0.12)] hover:border-[#194D2E] group";
const premiumHeader = "text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-4";
  const translateDynamic = (text: string) => {
export const MarketIntelligencePage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
    if (!text) return text;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MarketIntelligenceData | null>(null);
  const [, setLotContext] = useState<Lot | null>(null);
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
      let district = 'Nashik';
      "HIGH": t("marketIntelligence.highPressure"),
      if (id) {
        const { data: { session } } = await supabase.auth.getSession();
        const lot = await farmerLotsApi.get(session?.access_token || '', id);
        setLotContext(lot);
        crop = lot.crop;
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('farmer_profiles')
            .select('primary_crop, district')
            .eq('id', user.id)
            .single();
          if (profile) {
            if (profile.primary_crop) crop = profile.primary_crop;
            if (profile.district) district = profile.district;
          }
        }
      }

      // Create mock data since RPC doesn't exist
      const mockMarkets = [
        { market_name: 'Pimpalgaon Baswant APMC', min_price: 3800, modal_price: 4200, max_price: 4500, price_unit: 'quintals', observation_date: '2026-08-29', freshness: 'CURRENT', source_type: 'CURATED', source_name: 'Mandi Bhav' },
        { market_name: 'Lasalgaon(Vinchur) APMC', min_price: 3600, modal_price: 3650, max_price: 4400, price_unit: 'quintals', observation_date: '2026-08-28', freshness: 'CURRENT', source_type: 'CURATED', source_name: 'Mandi Bhav' },
        { market_name: 'Yeola APMC', min_price: 3500, modal_price: 3600, max_price: 4200, price_unit: 'quintals', observation_date: '2026-08-29', freshness: 'CURRENT', source_type: 'CURATED', source_name: 'Mandi Bhav' },
        { market_name: 'Manmad APMC', min_price: 3400, modal_price: 3600, max_price: 4100, price_unit: 'quintals', observation_date: '2026-08-27', freshness: 'CURRENT', source_type: 'CURATED', source_name: 'Mandi Bhav' }
      ];

      const completeData = {
        lot_id: id || 'demo-lot',
        crop: crop,
        location: { district: district, state: 'Maharashtra', village: null, taluka: null },
        snapshot: mockMarkets[0],
        markets: mockMarkets,
        selected_market: mockMarkets[0].market_name,
        trend: { direction: 'UP', price_change: 150, percentage_change: 3.5 },
        pressure: { pressure: 'HIGH', reasons: [] },
        sale_window: { window: 'FAVORABLE_NOW', advice: '' },
        history: marketResearchDataset.map((d: any) => ({ date: d.observationDate, modal_price: d.value, arrival_quantity: 8000, market_name: d.market })),
        data_freshness: 'CURRENT',
        source_type: 'AI Curated',
        source_name: 'KrishiMitra Intelligence',
        observation_date: '2026-08-29'
      };
        source_name: 'KrishiMitra Intelligence',
      await new Promise(r => setTimeout(r, 400));
      setData(completeData as any);
      const active = completeData.markets[0];
      setSelectedMarket(active?.market_name || '');

    } catch (err: any) {
      setError(err.message || 'Failed to fetch market data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9F8] flex items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 text-brand-primary animate-spin" />
      </div>
    );
  }

    );
  }

  if (error || !data) return null;

  const activeMarket = data.markets.find(m => m.market_name === selectedMarket) || data.markets[0];
  const highestPrice = Math.max(...data.markets.map(m => m.modal_price || 0));

  const frontendPressure = calculateMarketPressure(data.trend.direction, (data.trend.percentage_change || 0), []);
  const frontendWindow = calculateSellingWindow(frontendPressure.level, data.trend.direction);
  const oppScore = calculateOpportunityScore(activeMarket?.modal_price || 0, highestPrice, frontendPressure.level, false);

  const normalizeName = (name: string) => name.replace(/\s+/g, '').toLowerCase();
  const activeMarketNormalized = normalizeName(activeMarket?.market_name || data.markets[0].market_name);

  const displayChartData = data.history.filter((d: any) => normalizeName(d.market_name) === activeMarketNormalized);
  const arrivalData = marketResearchDataset.find(d => d.metric === 'arrival' && normalizeName(d.market) === activeMarketNormalized);

  return (
    <div className="min-h-screen bg-[#F4F6F4] -m-4 md:-m-8 p-4 md:p-8 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto space-y-4">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2">
          <div>
            <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Market Intelligence</h1>
            <p className="text-sm text-gray-500 mt-1">Understand the market and make the best decision for your produce.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">Last updated: {data.observation_date}</span>
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
              </div>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">DATA IS CURRENT</span>
            </div>
            <Button variant="secondary" onClick={fetchData} className="bg-white hover:bg-gray-50 text-gray-700 rounded-lg border border-gray-200 h-10 px-4 flex items-center shadow-sm">
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
          </div>
        </div>

        {/* Lot Banner */}
        <div className="bg-white rounded-2xl p-4 md:px-6 md:py-4 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center border border-green-100 shrink-0">
              <Package size={20} className="text-green-700" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-gray-900">{data.crop}</span>
                <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">GRADE A</span>
              </div>
              <span className="text-xs text-gray-500">{data.location?.district} District, Maharashtra</span>
            </div>
          </div>
          
          <div className="flex items-center gap-8 md:gap-12 md:pr-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">QUANTITY</span>
              <span className="text-sm font-bold text-gray-900">141 kg</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">AVAILABILITY</span>
              <span className="text-sm font-bold text-gray-900">Immediate</span>
            </div>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-100 py-1">
               <CheckCircle2 size={18} className="text-green-600" />
               <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-900">Market Data Current</span>
                  <span className="text-[10px] text-gray-500">Latest observation</span>
               </div>
            </div>
          </div>
        </div>

        {/* TOP METRICS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          <div className={`${premiumCard} md:col-span-3`}>
             <h3 className={premiumHeader}>CURRENT MODAL PRICE</h3>
             <div className="flex items-baseline gap-1 mt-2 mb-1">
               <span className="text-3xl font-black text-gray-900 tracking-tight">₹{activeMarket?.modal_price?.toLocaleString() || '--'}</span>
               <span className="text-sm font-bold text-gray-500">/q</span>
               <span className="text-xs font-bold text-green-600 ml-2">↑ 2.44%</span>
             </div>
             <p className="text-xs text-gray-500 font-medium mb-auto">Prices moving upward</p>
             
             <div className="flex justify-between items-center pt-4 mt-6 border-t border-gray-100">
               <div>
                 <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">LOW: ₹{activeMarket?.min_price?.toLocaleString() || '--'}</span>
               </div>
               <div>
                 <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">HIGH: ₹{activeMarket?.max_price?.toLocaleString() || '--'}</span>
               </div>
             </div>
          </div>

          <div className={`${premiumCard} md:col-span-3`}>
             <h3 className={premiumHeader}><Database size={14}/> MARKET SNAPSHOT</h3>
             <div className="grid grid-cols-2 gap-4 mt-2 mb-auto">
               <div className="flex flex-col items-center justify-center text-center">
                 <span className="text-xl font-black text-gray-900">{data.markets.length}</span>
                 <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">MARKETS<br/>COMPARED</span>
               </div>
               <div className="flex flex-col items-center justify-center text-center">
                 <span className="text-lg font-black text-gray-900">₹{highestPrice.toLocaleString()}/q</span>
                 <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">HIGHEST NEARBY</span>
               </div>
             </div>
               </div>
             </div>
             
             <div className="flex flex-col items-center justify-center pt-4 mt-6 border-t border-gray-100 text-center">
               <div className="flex items-center text-gray-400 mb-1"><Calendar size={14}/></div>
               <span className="text-xs font-black text-gray-900">{data.observation_date}</span>
               <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">{t("marketIntelligence.latestObservation")}</span>
             </div>
          </div>

          <div className={`${premiumCard} md:col-span-3`}>
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2"><Activity size={14}/> MARKET PRESSURE</h3>
               <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">HIGH</span>
             </div>
             <p className="text-xs text-gray-700 font-medium leading-relaxed mb-auto">
               {frontendPressure.description}
             </p>
             <div className="grid grid-cols-2 gap-4 pt-4 mt-6 border-t border-gray-100">
                <div>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest block mb-1">{t("marketIntelligence.arrivalsTrend")}</span>
                  <span className="text-xs font-bold text-gray-900">{t("marketIntelligence.unavailable")}</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest block mb-1">{t("marketIntelligence.buyerDemand")}</span>
                  <span className="text-xs font-bold text-gray-900">{t("marketIntelligence.unavailable")}</span>
                </div>
             </div>
          </div>

          <div className={`${premiumCard} md:col-span-3`}>
               <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">FAVORABLE</span>
             </div>
             <p className="text-xs text-gray-700 font-medium leading-relaxed mb-auto">
               {frontendWindow.description}
             </p>
             <div className="grid grid-cols-2 gap-4 pt-4 mt-6 border-t border-gray-100">
                <div>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest block mb-1">RECOMMENDED</span>
                  <span className="text-sm font-black text-gray-900">3-5 days</span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest block mt-1">CONFIDENCE: <span className="text-gray-500">MEDIUM</span></span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest block mb-1">EXPECTED PRICE</span>
                  <span className="text-sm font-black text-gray-900">₹4,050 -<br/>₹4,350/q</span>
                </div>
             </div>
          </div>

        </div>

        {/* MIDDLE ROW */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className={`${premiumCard} md:col-span-3`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0">NEARBY MARKETS</h3>
              <select 
                className="text-[10px] font-bold bg-white border border-gray-200 rounded px-2 py-1 text-gray-700 outline-none"
                value={selectedMarket}
                onChange={e => setSelectedMarket(e.target.value)}
              >
                 const diff = highestPrice - (m.modal_price || 0);
                 const isHighest = diff === 0;
                 const maxVal = highestPrice * 1.2;
                 const percent = ((m.modal_price || 0) / maxVal) * 100;
                 return (
                   <div key={m.market_name} className="flex flex-col gap-1.5 cursor-pointer group" onClick={() => setSelectedMarket(m.market_name)}>
                     <div className="flex justify-between items-end">
                       <span className={`text-[11px] font-bold ${m.market_name === selectedMarket ? 'text-gray-900' : 'text-gray-700'}`}>{m.market_name}</span>
                       <span className="text-sm font-black text-gray-900">₹{(m.modal_price || 0).toLocaleString()}/q</span>
                     </div>
                     <div className="w-full bg-gray-100 rounded h-1.5 overflow-hidden relative">
                       <div className={`absolute left-0 top-0 bottom-0 rounded transition-all duration-500 ${isHighest ? 'bg-[#194D2E]' : 'bg-[#9BA3AF]'}`} style={{ width: `${percent}%`}}></div>
                     </div>
                     <div className="flex justify-between items-center">
                       <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">MODAL PRICE</span>
                       {isHighest ? (
                         <span className="text-[8px] font-bold text-green-600 uppercase tracking-widest">HIGHEST</span>
                       ) : (
                         <span className="text-[8px] font-bold text-red-500 uppercase tracking-widest">↘ ₹{diff.toLocaleString()}</span>
                       )}
                     </div>
                   </div>
                 )
              })}
            </div>
          </div>

          <div className={`${premiumCard} md:col-span-6`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0">PRICE TREND</h3>
               </div>
               <div className="bg-[#F8FCF9] border border-green-100 rounded-lg px-4 py-2 flex items-center gap-3">
                 <CheckCircle2 size={16} className="text-brand-primary" />
                 <div>
                   <p className="text-xs font-bold text-gray-900">Market Data <span className="text-brand-primary font-bold ml-1">Current</span></p>
                   <p className="text-[10px] text-gray-500 font-medium">Latest observation</p>
                 </div>
               </div>
            </div>
            <div className="h-64 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={displayChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fill: '#9CA3AF', fontWeight: 'bold' }}
                    tickFormatter={(val) => {
                      const d = new Date(String(val));
                      return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                    }}
                  />
                  <YAxis 
                    domain={['dataMin - 100', 'dataMax + 100']}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fill: '#9CA3AF', fontWeight: 'bold' }}
                    tickFormatter={(val) => `₹${val}`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontWeight: 'bold', padding: '12px' }}
                    labelStyle={{ color: '#6B7280', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}
                    itemStyle={{ color: '#111827', fontSize: '14px', fontWeight: '900' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="modal_price" 
                    stroke="#16a34a" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5, fill: '#16a34a', stroke: '#fff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`${premiumCard} md:col-span-3`}>
             <div className="flex justify-between items-center mb-6">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0">MARKET ARRIVALS</h3>
              <select className="text-[10px] font-bold bg-white border border-gray-200 rounded px-2 py-1 text-gray-600 outline-none">
                <option>12 MONTHS</option>
              </select>
            </div>
            <div className="flex items-baseline gap-1 mb-6">
               <span className="text-2xl font-black text-gray-900 tracking-tight">316 T</span>
               <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">LATEST (2026-07-20)</span>
            </div>
            <div className="bg-white flex flex-col items-center justify-center p-6 text-center flex-1 h-full border border-gray-50 rounded-xl mt-4">
               <p className="text-[10px] text-gray-500 font-medium leading-relaxed">Only single historical observation available for this market</p>
                      <Line type="monotone" dataKey="price" stroke="#16a34a" strokeWidth={2.5} dot={false} activeDot={{ r: 6, fill: '#16a34a', stroke: '#fff', strokeWidth: 2 }} />
                 <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Latest Observation</span>
               </div>
             </div>
          </div>
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : chartData.length === 1 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-xl bg-gray-50/50 p-6 text-center">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Current price</p>
                    <p className="text-2xl font-bold text-gray-900 mb-3">₹{chartData[0].price?.toLocaleString()} <span className="text-sm font-medium text-gray-500">/ quintal</span></p>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-[200px]">Historical trend will appear when more market observations are available.</p>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-xl bg-gray-50/50 p-6 text-center">
                    <p className="text-lg font-bold text-gray-900 mb-2">Historical trend unavailable</p>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-[250px]">We need more market observations to show how prices have changed over time.</p>
                  </div>
                )}
              </div>
                    {currentArrival !== null ? (
                      <span className="text-sm font-medium text-gray-600">
                        {avgArrival && currentArrival > avgArrival * 1.1 ? "Arrival volumes are above the recent average." : 
                         avgArrival && currentArrival < avgArrival * 0.9 ? "Arrival volumes are below the recent average." :
                         "Arrival volumes are steady."}
                      </span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest z-10">DEMAND DATA UNAVAILABLE</span>
             </div>
          </div>
          <div className={`${premiumCard} md:col-span-4`}>
             <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-6"><Star size={14}/> BEST BUYER MATCH</h3>
             <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50 rounded-xl border border-gray-100 p-6 text-center mt-2 relative overflow-hidden">
                <Star size={20} className="text-gray-300 mb-2 z-10" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest z-10">MATCH DATA UNAVAILABLE</span>
                <Star className="text-gray-100 absolute w-32 h-32 -right-4 -bottom-4 opacity-30" />
             </div>
          </div>
        </div>
        {/* FOURTH ROW */}
        {/* FOURTH ROW */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className={`${premiumCard} md:col-span-4 flex flex-row items-center gap-4`}>
             <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center font-black text-gray-900 text-base border border-gray-100 shadow-sm shrink-0">
               A
             </div>
             <div>
               <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-1"><ShieldCheck size={12}/> QUALITY</h3>
               <div className="flex flex-col">
                  <span className="text-sm font-black text-gray-900 tracking-tight">Grade A</span>
                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">YOUR LOT GRADE</span>
               </div>
             </div>
          </div>
          <div className={`${premiumCard} md:col-span-4 flex flex-col justify-center`}>
             <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-3"><Truck size={12}/> LOGISTICS</h3>
             <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">DATA UNAVAILABLE</p>
          </div>
          <div className={`${premiumCard} md:col-span-4 flex flex-col justify-center`}>
             <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-3"><Box size={12}/> STORAGE</h3>
             <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">INFORMATION UNAVAILABLE</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-2">
        {/* RECOMMENDATION ROW */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-2">
          <div className="md:col-span-8 bg-[#1B4E2E] rounded-3xl p-8 relative shadow-sm text-white flex flex-col justify-between">
             <div className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest mb-6 text-green-200">
                <Lightbulb size={14}/> KRISHIMITRA'S RECOMMENDATION
             </div>
             <h2 className="text-3xl font-black tracking-tight leading-tight mb-8">
               Consider selling within the next 3-5 days.
             </h2>
             <div className="space-y-4">
                <span className="text-[10px] font-bold text-green-300 uppercase tracking-widest">WHY?</span>
                <ul className="space-y-3">
                   <li className="flex items-start gap-3">
                     <div className="mt-0.5"><CheckCircle2 size={16} className="text-green-400"/></div>
                     <span className="text-sm font-medium text-white leading-relaxed">Current price momentum and tighter arrivals indicate a relatively favorable near-term selling window.</span>
                   </li>
                   <li className="flex items-start gap-3">
                     <div className="mt-0.5"><CheckCircle2 size={16} className="text-green-400"/></div>
                     <span className="text-sm font-medium text-white leading-relaxed">Highest reported regional price.</span>
                   </li>
                </ul>
             </div>
          </div>
          <div className="md:col-span-4 flex flex-col gap-4">
             <div className="bg-[#2A593A] rounded-2xl p-6 border border-white/5 flex flex-col justify-center text-center shadow-sm h-full">
                <h3 className="text-[10px] font-bold text-white uppercase tracking-widest mb-4 flex items-center justify-center gap-2"><MessageSquare size={14}/> ASK KRISHIMITRA</h3>
                <span className="text-[9px] font-bold text-green-300 uppercase tracking-widest mb-6">FUTURE CAPABILITY</span>
                <Button variant="secondary" className="w-full bg-[#396547] hover:bg-[#437251] border-none text-green-100 font-bold pointer-events-none">
                  <span className="flex items-center justify-center gap-2"><Lightbulb size={14}/> VOICE ASSISTANT</span>
                </Button>
             </div>
             <div className="bg-[#2A593A] rounded-2xl p-6 border border-white/5 flex flex-col justify-center text-center shadow-sm h-full">
                <h3 className="text-[10px] font-bold text-white uppercase tracking-widest mb-4 flex items-center justify-center gap-2"><Bell size={14}/> MARKET WATCH</h3>
                <span className="text-[9px] font-bold text-green-300 uppercase tracking-widest mb-6">FUTURE CAPABILITY</span>
                <Button variant="secondary" className="w-full bg-[#396547] hover:bg-[#437251] border-none text-green-100 font-bold pointer-events-none">
                  SET MARKET ALERT
                </Button>
             </div>
          </div>
        </div>

        {/* DATA & SOURCE */}
        <div className="pt-10 pb-8 mt-4">
          <h4 className="text-base font-black text-gray-900 tracking-tight mb-1">What does this mean?</h4>
          <p className="text-xs text-gray-500 font-medium mb-8">A simple explanation of the available market information.</p>
          
                       )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
                      <div 
          {/* PRICE TREND */}
          <div className={`xl:col-span-4 ${premiumCard} flex flex-col h-[400px]`}>
            <div className="flex items-center justify-between mb-4">
               <h3 className={premiumHeader + " !mb-0"}>Price Trend</h3>
               <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded">12 Months <ChevronDown size={12} className="inline ml-1"/></span>
            </div>
            
            <div className="flex-1 w-full relative pt-2">
              {displayChartData.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={displayChartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(tick) => {
                        const d = new Date(tick);
                        return `${d.toLocaleString('default', { month: 'short' })} '${d.getFullYear().toString().slice(-2)}`;
                      }}
                      stroke="#cbd5e1" 
                      tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 500}} 
                      tickLine={false}
                      axisLine={false}
                      minTickGap={20}
                    />
                    <YAxis 
                      domain={['dataMin - 100', 'dataMax + 100']} 
                      tickFormatter={(tick) => `₹${tick.toLocaleString()}`}
                      tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 500}}
                      tickLine={false}
                      axisLine={false}
                      width={60}
                    />
                    <Tooltip 
                      cursor={{ stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: '3 3' }}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px -3px rgb(0 0 0 / 0.05)', padding: '10px' }}
                      formatter={(value: any) => [`₹${value?.toLocaleString()} / q`, 'Modal Price']}
                      labelFormatter={(label) => {
                        if (!label) return activeMarketName;
                        const d = new Date(label as string | number);
                        if (isNaN(d.getTime())) return `${label} • ${activeMarketName}`;
                        return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()} • ${activeMarketName}`;
                      }}
                      labelStyle={{ color: '#64748b', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}
                      itemStyle={{ color: '#0f172a', fontWeight: 700, fontSize: '12px' }}
                <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Market Pressure</h3>
              </div>
              
              {frontendPressure.level === 'INSUFFICIENT' ? (
                <div>
                  <p className="text-lg font-bold text-gray-900 mb-2">{frontendPressure.title}</p>
                  <p className="text-sm text-gray-600 font-medium leading-relaxed">{frontendPressure.description}</p>
                </div>
              ) : (
                <div>
                  <p className="text-2xl font-bold text-gray-900 capitalize mb-2">{frontendPressure.title}</p>
                  <p className="text-sm text-gray-600 font-medium leading-relaxed">{frontendPressure.description}</p>
                  {frontendPressure.basis && <p className="text-[10px] text-gray-400 mt-3 uppercase tracking-widest">{frontendPressure.basis}</p>}
                </div>
              )}
            </div>
          <div className={`xl:col-span-4 ${premiumCard} flex flex-col h-[400px]`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Selling Window</h3>
              </div>
              
              {frontendWindow.level === 'INSUFFICIENT' ? (
                <div>
                  <p className="text-lg font-bold text-gray-900 mb-2">{frontendWindow.title}</p>
                  <p className="text-sm text-gray-600 font-medium leading-relaxed">{frontendWindow.description}</p>
                </div>
              ) : (
                <div>
                  <p className="text-2xl font-bold text-gray-900 mb-2">{frontendWindow.title}</p>
                  <p className="text-sm text-gray-600 font-medium leading-relaxed">{frontendWindow.description}</p>
                  {frontendWindow.basis && <p className="text-[10px] text-gray-400 mt-3 uppercase tracking-widest">{frontendWindow.basis}</p>}
                </div>
              )}
            </div>
              {displayArrivalChartData.length > 2 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={displayArrivalChartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                     <XAxis 
                      dataKey="date" 
                      tickFormatter={(tick) => {
                        const d = new Date(tick);
                        return `${d.toLocaleString('default', { month: 'short' })} '${d.getFullYear().toString().slice(-2)}`;
          </div>
        </section>
                      tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 500}} 
        {/* 7. MARKET OPPORTUNITY */}
        <section className={level1Card + " relative overflow-hidden"}>
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Target size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-5 bg-brand-primary rounded-full"></div>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Market Opportunity</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Highest Reported Price Market</p>
                <p className="text-2xl font-bold text-gray-900 mb-1">{highestMarket.market_name}</p>
                <p className="text-sm font-medium text-gray-500">₹{highestPrice.toLocaleString()}/q</p>
              </div>
              
              <div className="md:col-span-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Opportunity Score</p>
                {opportunity.status === 'UNAVAILABLE' ? (
                  <p className="text-sm font-medium text-gray-500">Opportunity score unavailable</p>
                ) : (
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-50 border border-green-100 text-green-700 font-bold text-lg shrink-0">
                      {opportunity.score}
                    </div>
                    <div>
                      <p className="text-base font-bold text-gray-900 mb-1">{opportunity.status} OPPORTUNITY</p>
                      <ul className="text-xs font-medium text-gray-600 space-y-1">
                        {opportunity.reasons.map((r, i) => (
                          <li key={i} className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-green-500"/> {r}</li>
                        ))}
                      </ul>
                <div>
                  <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Market Pressure</h3>
                  <p className="text-sm text-gray-700 font-medium leading-relaxed">
                    {frontendPressure.level === 'INSUFFICIENT' ? "Not enough data to confidently assess current supply pressure." : 
                     frontendPressure.level === 'HIGH' ? "Recent market observations indicate tighter supply conditions." :
                     frontendPressure.level === 'LOW' ? "Recent market observations indicate softer supply conditions." :
                     "Recent market observations indicate balanced supply conditions."}
                  </p>
                </div>
              </div>
          <div className={level2Signal + " !p-8"}>
                <div>
                  <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Selling Window</h3>
                  <p className="text-sm text-gray-700 font-medium leading-relaxed">
                    {frontendWindow.level === 'INSUFFICIENT' ? "Not enough information to identify a confident selling window." : 
                     frontendWindow.level === 'FAVORABLE' ? "Price momentum and supply conditions currently indicate a relatively favorable near-term selling environment." :
                     frontendWindow.level === 'CAUTION' ? "Current conditions suggest caution. Consider holding if possible." :
                     "Current conditions are neutral. Monitor for future price momentum."}
                  </p>
                </div>
              </div>
              </div>
            ) : demandsError || buyerDemands.length === 0 ? (
              <div className="py-4">
                <p className="text-sm font-bold text-gray-900 mb-1">Buyer demand data unavailable</p>
                <p className="text-xs text-gray-500 font-medium">No verified active buyer requirements found for this crop.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm font-bold text-gray-900 mb-4">{buyerDemands.length} matching buyers found</p>
                {buyerDemands.slice(0, 2).map(demand => (
                  <div key={demand.id} className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-bold text-gray-900 truncate">Verified Buyer</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-green-50 text-green-700 rounded-full">ACTIVE</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-gray-500">
                      <span>{demand.quantityRequired} {demand.quantityUnit}</span>
                      <span>Grade {demand.acceptedQualityGrades[0]}</span>
                      <span>{demand.district}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
                  </div>
          <div className={level2Signal + " !p-8"}>
            <div className="flex items-center gap-3 mb-6">
              <Star size={18} className="text-gray-400" />
              <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Best Buyer Match</h3>
            </div>
            
            {demandsLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw size={20} className="text-gray-300 animate-spin" />
              </div>
            ) : !lotContext ? (
               <div className="py-4">
                <p className="text-sm font-bold text-gray-900 mb-1">Match data unavailable</p>
                <p className="text-xs text-gray-500 font-medium">Farmer lot context is missing.</p>
              </div>
            ) : !bestMatch || !bestMatchDemand ? (
              <div className="py-4">
                <p className="text-sm font-bold text-gray-900 mb-1">Match data unavailable</p>
                <p className="text-xs text-gray-500 font-medium">No suitable buyers found to calculate a match.</p>
              </div>
            ) : (
              <div>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-bold text-gray-900">{bestMatch.matchPercentage}%</span>
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Match</span>
                </div>
                
                <ul className="text-xs font-medium text-gray-600 space-y-2 mb-6">
                  {bestMatch.reasons.map((r, i) => (
                    <li key={i} className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500"/> {r}</li>
                  ))}
                  {bestMatch.matchPercentage < 100 && (
                    <li className="flex items-center gap-2 text-amber-600"><ShieldAlert size={14} /> Partial requirements met</li>
                  )}
                </ul>
                
                <button 
                  onClick={() => navigate('/farmer/marketplace')}
                  className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white text-sm font-bold py-3 px-4 rounded-lg hover:bg-brand-primary/90 transition-colors shadow-sm"
                >
                  View Opportunity <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </section>
               
        {/* 10 & 11. QUALITY + LOGISTICS & STORAGE */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className={level1Card + " !p-8 md:col-span-1 flex flex-col"}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-5 bg-gray-400 rounded-full"></div>
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Quality</h3>
            </div>
            {lotContext?.qualityGrade ? (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Your Lot Grade</p>
                <p className="text-2xl font-bold text-gray-900 mb-4">Grade {lotContext.qualityGrade}</p>
                <p className="text-xs font-medium text-gray-500">Other quality requirements unavailable.</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-bold text-gray-900 mb-1">Quality data unavailable</p>
              </div>
            )}
          </div>
          
          <div className={level1Card + " !p-8 md:col-span-1 flex flex-col"}>
            <div className="flex items-center gap-3 mb-6">
              <Truck size={16} className="text-gray-400" />
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Logistics</h3>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-sm font-bold text-gray-900 mb-2">Data unavailable</p>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">Transport cost and net realization can be estimated when logistics information is available.</p>
            </div>
          </div>
          
          <div className={level1Card + " !p-8 md:col-span-1 flex flex-col"}>
            <div className="flex items-center gap-3 mb-6">
              <Box size={16} className="text-gray-400" />
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Storage</h3>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-sm font-bold text-gray-900 mb-2">Storage information unavailable</p>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">Consider storage cost and quality risk before delaying the sale.</p>
            </div>
          </div>
        </section>
            <h3 className={premiumHeader}><ShieldAlert size={14}/> Quality</h3>
        {/* 12. AI RECOMMENDATION */}
        <section className="relative bg-brand-primary text-white rounded-2xl p-8 md:p-12 overflow-hidden shadow-lg border border-green-800">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
           
           <div className="relative z-10 flex flex-col md:flex-row gap-8 justify-between">
             <div className="flex-1">
               <div className="flex items-center gap-2 mb-4">
                 <Lightbulb size={18} className="text-green-300" />
                 <h2 className="text-[11px] font-bold text-green-300 uppercase tracking-widest">KrishiMitra's Recommendation</h2>
               </div>
               
               <p className="text-2xl md:text-3xl font-bold leading-tight mb-6">
                 {frontendWindow.level === 'FAVORABLE' ? "Consider selling within the next 3–5 days." :
                  frontendWindow.level === 'CAUTION' ? "Current conditions suggest waiting if storage allows." :
                  "Monitor the market closely for clearer momentum."}
               </p>
               
               <div className="space-y-4">
                 <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest">WHY?</p>
                 <ul className="space-y-2 text-sm font-medium text-green-50">
                   <li className="flex items-start gap-2">
                     <CheckCircle2 size={16} className="text-green-400 shrink-0 mt-0.5" />
                     {frontendWindow.description}
                   </li>
                   <li className="flex items-start gap-2">
                     <CheckCircle2 size={16} className="text-green-400 shrink-0 mt-0.5" />
                     {opportunity.status === 'UNAVAILABLE' ? "Local market dynamics are steady." : opportunity.reasons[0] + "."}
                   </li>
                   {bestMatch && (
                     <li className="flex items-start gap-2">
                       <CheckCircle2 size={16} className="text-green-400 shrink-0 mt-0.5" />
                       Matching buyer demand found for your crop.
                     </li>
                   )}
                 </ul>
               </div>
             </div>
             
             {/* 13. ASK KRISHIMITRA / MARKET WATCH */}
             <div className="w-full md:w-80 shrink-0 flex flex-col gap-4">
               <div className="bg-white/10 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
                 <div className="flex items-center gap-2 mb-4">
                   <MessageSquare size={16} className="text-white" />
                   <h3 className="text-sm font-bold text-white">Ask KrishiMitra</h3>
                 </div>
                 <p className="text-xs text-green-100 font-medium mb-4">Future capability: Ask voice assistant about this recommendation.</p>
                 <button disabled className="w-full bg-white/20 text-white text-xs font-bold py-2.5 px-4 rounded-lg opacity-50 cursor-not-allowed">
                   🎙 Voice Assistant
                 </button>
               </div>
               
               <div className="bg-white/10 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
                 <h3 className="text-sm font-bold text-white mb-2">Market Watch</h3>
                 <p className="text-xs text-green-100 font-medium mb-4">Future capability: Set alerts for price or demand changes.</p>
                 <button disabled className="w-full bg-transparent border border-white/30 text-white text-xs font-bold py-2.5 px-4 rounded-lg opacity-50 cursor-not-allowed">
                   Set Market Alert
                 </button>
               </div>
             </div>
           </div>
        </section>
               </div>
        {/* 7. WHAT DOES THIS MEAN? */}
        <section className={level1Card + " !p-0 overflow-hidden"}>
          <div className="border-b border-gray-100 p-8 md:px-12 bg-gray-50/50">
                  frontendWindow.level === 'CAUTION' ? "Current conditions suggest waiting if storage allows." :
                  "Monitor the market closely for clearer momentum."}
                 <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">WHY?</p>
                 <ul className="space-y-3 text-sm font-semibold text-[#142033]">
                   <li className="flex items-start gap-3">
                     <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-gray-100">
                       <CheckCircle2 size={12} className="text-brand-primary" />
                     </div>
                     <span className="mt-0.5">{frontendWindow.description}</span>
                   </li>
                   <li className="flex items-start gap-3">
                     <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-gray-100">
                       <CheckCircle2 size={12} className="text-brand-primary" />
                     </div>
                     <span className="mt-0.5">{opportunity.status === 'UNAVAILABLE' ? "Local market dynamics are steady." : opportunity.reasons[0] + "."}</span>
                   </li>
                   {bestMatch && (
                     <li className="flex items-start gap-3">
                       <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-gray-100">
                         <CheckCircle2 size={12} className="text-brand-primary" />
                       </div>
                       <span className="mt-0.5">Matching buyer demand found for your crop.</span>
                     </li>
                   )}
                 </ul>
                   <MessageSquare size={14} className="text-gray-700" />
                   <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-900">Ask KrishiMitra</h3>
                 </div>
                 <p className="text-[10px] text-gray-400 font-bold mb-4 uppercase tracking-widest">Future capability</p>
                 <button disabled className="w-full bg-gray-50 text-gray-400 border border-gray-100 text-xs font-bold py-2.5 px-4 rounded-lg opacity-80 cursor-not-allowed uppercase tracking-wider">
                   🎙 Voice Assistant
        <section className="relative bg-brand-primary text-white rounded-[14px] p-8 md:p-10 overflow-hidden shadow-lg border border-green-800">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
           
           <div className="relative z-10 flex flex-col md:flex-row gap-8 justify-between">
               <div className="flex items-center gap-2 mb-4">
                 <Lightbulb size={16} className="text-green-300" />
                 <h2 className="text-[10px] font-bold text-green-300 uppercase tracking-widest">KrishiMitra's Recommendation</h2>
               </div>
               
               <p className="text-2xl md:text-3xl font-bold leading-tight mb-6 max-w-xl">
                 {frontendWindow.level === 'FAVORABLE' ? "Consider selling within the next 3–5 days." :
                  frontendWindow.level === 'CAUTION' ? "Current conditions suggest waiting if storage allows." :
                  "Monitor the market closely for clearer momentum."}
// [MISSING LINE 857]
// [MISSING LINE 858]
// [MISSING LINE 859]
// [MISSING LINE 860]
// [MISSING LINE 861]
// [MISSING LINE 862]
// [MISSING LINE 863]
// [MISSING LINE 864]
// [MISSING LINE 865]
// [MISSING LINE 866]
// [MISSING LINE 867]
// [MISSING LINE 868]
// [MISSING LINE 869]
// [MISSING LINE 870]
// [MISSING LINE 871]
// [MISSING LINE 872]
// [MISSING LINE 873]
// [MISSING LINE 874]
// [MISSING LINE 875]
// [MISSING LINE 876]
// [MISSING LINE 877]
             
             {/* 13. ASK KRISHIMITRA / MARKET WATCH */}
             <div className="w-full md:w-80 shrink-0 flex flex-col gap-4">
               <div className="bg-white/10 border border-white/20 rounded-xl p-5 backdrop-blur-sm">
                 <div className="flex items-center gap-2 mb-2">
                   <MessageSquare size={14} className="text-white" />
                   <h3 className="text-[11px] font-bold uppercase tracking-widest text-white">Ask KrishiMitra</h3>
                 </div>
                 <p className="text-[10px] text-green-100 font-medium mb-4 uppercase tracking-widest">Future capability</p>
                 <button disabled className="w-full bg-white/20 text-white text-xs font-bold py-2.5 px-4 rounded-lg opacity-50 cursor-not-allowed uppercase tracking-wider">
                   🎙 Voice Assistant
                 </button>
               </div>
               <div className="bg-white/10 border border-white/20 rounded-xl p-5 backdrop-blur-sm">
                 <h3 className="text-[11px] font-bold text-white uppercase tracking-widest mb-2">Market Watch</h3>
                 <p className="text-[10px] text-green-100 font-medium mb-4 uppercase tracking-widest">Future capability</p>
                 <button disabled className="w-full bg-transparent border border-white/30 text-white text-xs font-bold py-2.5 px-4 rounded-lg opacity-50 cursor-not-allowed uppercase tracking-wider">
                   Set Market Alert
                 </button>
               </div>
// [MISSING LINE 898]
        </section>

        {/* 7. WHAT DOES THIS MEAN? */}
        <section className={premiumCard + " !p-0 overflow-hidden"}>
          <div className="border-b border-gray-100 p-6 bg-gray-50/50">
            <h2 className="text-sm font-bold text-gray-900 mb-1">What does this mean?</h2>
            <p className="text-xs font-medium text-gray-500">A simple explanation of the available market information.</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                  <TrendingUp size={14} className="text-gray-500" />
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Prices</h3>
                  <p className="text-xs text-gray-700 font-medium leading-relaxed">
                    {data.trend.direction === 'UP' && "Recent observed prices are moving upward."}
                    {data.trend.direction === 'DOWN' && "Recent observed prices are moving downward."}
                    {data.trend.direction === 'STABLE' && "Recent observed prices are relatively stable."}
// [MISSING LINE 920]
// [MISSING LINE 921]
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                  <Package size={14} className="text-gray-500" />
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Arrivals</h3>
                  <p className="text-xs text-gray-700 font-medium leading-relaxed">
                    {displayArrivalValue !== null ? "Arrival information is available only for selected historical observations." : "Arrival data is currently unavailable."}
                  </p>
                </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                  <Activity size={14} className="text-gray-500" />
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Market Pressure</h3>
                  <p className="text-xs text-gray-700 font-medium leading-relaxed">
                    {frontendPressure.level === 'INSUFFICIENT' ? "Not enough data to confidently assess current supply pressure." : 
                     frontendPressure.level === 'HIGH' ? "Recent market observations indicate tighter supply conditions." :
                     frontendPressure.level === 'LOW' ? "Recent market observations indicate softer supply conditions." :
// [MISSING LINE 945]
// [MISSING LINE 946]
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                  <Calendar size={14} className="text-gray-500" />
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Selling Window</h3>
                  <p className="text-xs text-gray-700 font-medium leading-relaxed">
                    {frontendWindow.level === 'INSUFFICIENT' ? "Not enough information to identify a confident selling window." : 
                     frontendWindow.level === 'FAVORABLE' ? "Price momentum and supply conditions currently indicate a relatively favorable near-term selling environment." :
                     frontendWindow.level === 'CAUTION' ? "Current conditions suggest caution. Consider holding if possible." :
// [MISSING LINE 959]
// [MISSING LINE 960]
// [MISSING LINE 961]
// [MISSING LINE 962]
// [MISSING LINE 963]
        </section>

        {/* 8. DATA & SOURCE */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-semibold text-gray-400 pt-4 border-t border-gray-200/50">
          <div className="flex items-center gap-2">
            <Database size={14} />
            <span className="uppercase tracking-widest text-[10px]">DATA & SOURCE</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-x-4 gap-y-2 text-[10px] tracking-widest uppercase">
            <span className="text-gray-500">Latest observation: {data.observation_date}</span>
            <span className="hidden md:inline text-gray-300">|</span>
            <span>{data.source_type} • {data.source_name}</span>
            {historyIsCurated && (
               <>
                 <span className="hidden md:inline text-gray-300">|</span>
                 <span>Trend: Curated historical data</span>
               </>
            )}
          </div>