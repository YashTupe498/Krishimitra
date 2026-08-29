import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, TrendingUp, TrendingDown, Minus, Info, Calendar, 
  Package, AlertCircle, RefreshCw 
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import type { MarketIntelligenceData } from '../../types/market';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { mockLots } from '../../data/mockLots';

export const MarketIntelligencePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [data, setData] = useState<MarketIntelligenceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Resolve Lot ID: from URL query param, fallback to the first available lot
  const lotIdParam = searchParams.get('lotId');
  const allLotIds = Object.keys(mockLots);
  const id = lotIdParam || (allLotIds.length > 0 ? allLotIds[0] : null);
  
  const lotContext = id ? mockLots[id] : null;

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    if (!id) {
      setError('Please create a lot in "My Lots" first to view your personalized market intelligence.');
      setLoading(false);
      return;
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      
      let url = `http://localhost:8000/api/v1/market-intelligence/${id}`;
      // Fallback defaults if lotContext is missing (e.g. page refreshed and mock lot lost)
      const queryParams = new URLSearchParams({
        crop: lotContext?.crop || 'Onion',
        district: lotContext?.location?.split(',')[0]?.trim() || lotContext?.district || 'Nashik',
        state: lotContext?.state || 'Maharashtra'
      }).toString();
      url += `?${queryParams}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        let errMsg = `Error ${response.status}: Failed to fetch`;
        try {
          const errBody = await response.json();
          errMsg = `Error ${response.status}: ${errBody.detail || JSON.stringify(errBody)}`;
        } catch (e) {
          // Ignore
        }
        throw new Error(errMsg);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'We couldn\'t load market information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse p-8">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-32 bg-gray-200 rounded w-full"></div>
        <div className="h-64 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center p-12 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">We couldn't load market information.</h2>
        <p className="text-sm text-gray-500 max-w-md break-words">{error}</p>
        <Button onClick={fetchData} className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" /> Retry
        </Button>
        <Button variant="secondary" className="mt-4" onClick={() => navigate(`/farmer/lots/${id}`)}>
          Go Back
        </Button>
      </div>
    );
  }

  if (!data.snapshot && data.data_freshness === 'OUTDATED') {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center p-12 text-center bg-gray-50 rounded-xl mt-8">
        <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">MARKET DATA UNAVAILABLE</h2>
        <p className="text-gray-600 mb-6">Market information is currently unavailable for this crop and location.</p>
        <Button variant="secondary" onClick={() => navigate(id ? `/farmer/lots/${id}` : '/farmer/lots')}>
          Return to Lot
        </Button>
      </div>
    );
  }

  const getTrendIcon = (direction: string) => {
    switch(direction) {
      case 'UP': return <TrendingUp className="text-green-600 w-5 h-5" />;
      case 'DOWN': return <TrendingDown className="text-red-600 w-5 h-5" />;
      default: return <Minus className="text-gray-500 w-5 h-5" />;
    }
  };

  const getPressureEmoji = (pressure: string) => {
    switch(pressure) {
      case 'LOW': return '🟢';
      case 'HIGH': return '🔴';
      case 'MODERATE': return '🟡';
      default: return '⚪';
    }
  };

  const getWindowEmoji = (window: string) => {
    if (window.includes('FAVORABLE')) return '🟢';
    if (window.includes('WAITING')) return '🟡';
    return '⚪';
  };
  
  const formatWindowText = (window: string) => {
    if (window === 'FAVORABLE_NOW') return 'CURRENT WINDOW LOOKS FAVORABLE';
    if (window === 'CONSIDER_WAITING') return 'CONSIDER WAITING';
    if (window === 'NEUTRAL') return 'NEUTRAL';
    return 'INSUFFICIENT DATA';
  };

  const getFreshnessEmoji = (fresh: string) => {
    if (fresh === 'CURRENT') return '🟢';
    if (fresh === 'STALE') return '🟡';
    return '🔴';
  };

  const chartData = [...data.history].reverse().map(h => ({
    date: h.date,
    price: h.modal_price
  })).filter(h => h.price !== null);

  const currentArrival = data.history.length > 0 ? data.history[0].arrival_quantity : null;
  const recentArrivals = data.history.slice(1, 5).map(h => h.arrival_quantity).filter(a => a !== null) as number[];
  const avgArrival = recentArrivals.length > 0 ? recentArrivals.reduce((a, b) => a + b, 0) / recentArrivals.length : null;
  const arrivalChange = currentArrival && avgArrival ? (((currentArrival - avgArrival) / avgArrival) * 100).toFixed(1) : null;

  return (
    <div className="max-w-4xl mx-auto pb-12 p-4 md:p-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" className="p-2 mr-2" onClick={() => navigate(id ? `/farmer/lots/${id}` : '/farmer/lots')}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">Market Intelligence</h1>
          <p className="text-sm text-gray-500">Understand recent market conditions for your produce.</p>
        </div>
        <Button variant="secondary" className="ml-auto flex items-center" onClick={fetchData}>
          <RefreshCw size={16} className="mr-2" /> Refresh
        </Button>
      </div>

      <Card className="mb-6 p-4 border border-brand-light bg-brand-light/10">
        <div className="flex flex-wrap gap-4 items-center text-sm font-medium text-gray-800">
          <div className="flex items-center"><Package className="w-4 h-4 mr-2 text-brand-primary"/> {data.crop}</div>
          {lotContext && <div className="flex items-center text-gray-600">• {lotContext.quantity} {lotContext.unit}</div>}
          {lotContext?.qualityGrade && <Badge variant="info" className="ml-2">{lotContext.qualityGrade}</Badge>}
          <div className="flex items-center ml-auto text-gray-600"><MapPin className="w-4 h-4 mr-1 text-gray-400"/> {data.location.district}, {data.location.state}</div>
        </div>
      </Card>

      <Card className="mb-6 p-5">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Market Data Status</h2>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center font-bold text-gray-900">
            {getFreshnessEmoji(data.data_freshness)} <span className="ml-2">{data.data_freshness}</span>
          </div>
          <div className="h-10 w-px bg-gray-200 hidden md:block"></div>
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">Latest observation:</span> {data.observation_date}
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">Source:</span> {data.source_name}
          </div>
        </div>
        {data.data_freshness !== 'CURRENT' && (
          <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded-md text-sm border border-yellow-200 flex items-start">
            <Info className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            Market data is slightly old and may not reflect today's exact market conditions.
          </div>
        )}
      </Card>

      <div className="mb-6">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Market</h2>
        <select className="p-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium w-full md:w-64 outline-none focus:ring-2 focus:ring-brand-primary">
          <option>{data.snapshot?.market_name || 'Unknown Market'}</option>
        </select>
      </div>

      <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 mt-8">Today's Market Snapshot</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-5 flex flex-col justify-between">
          <div className="text-xs font-bold text-gray-500 uppercase mb-1">Minimum Price</div>
          <div className="text-2xl font-bold text-gray-900">₹{data.snapshot?.min_price || '--'} <span className="text-sm font-normal text-gray-500">/ {data.snapshot?.price_unit || 'q'}</span></div>
        </Card>
        <Card className="p-5 flex flex-col justify-between border-2 border-brand-primary/20 bg-brand-light/5 shadow-sm">
          <div className="text-xs font-bold text-brand-primary uppercase mb-1 flex items-center">
            Modal Price <Info className="w-3.5 h-3.5 ml-1 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900">₹{data.snapshot?.modal_price || '--'} <span className="text-sm font-normal text-gray-500">/ {data.snapshot?.price_unit || 'q'}</span></div>
          <div className="text-xs text-gray-500 mt-2">Most commonly reported price</div>
        </Card>
        <Card className="p-5 flex flex-col justify-between">
          <div className="text-xs font-bold text-gray-500 uppercase mb-1">Maximum Price</div>
          <div className="text-2xl font-bold text-gray-900">₹{data.snapshot?.max_price || '--'} <span className="text-sm font-normal text-gray-500">/ {data.snapshot?.price_unit || 'q'}</span></div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-5">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Recent Price Trend</h2>
          <div className="flex items-center mb-6">
            {getTrendIcon(data.trend.direction)}
            <span className="ml-2 font-bold text-lg text-gray-900">{data.trend.direction}</span>
            {data.trend.percentage_change !== null && (
              <span className="ml-3 text-sm text-gray-500 font-medium">
                {data.trend.percentage_change > 0 ? '+' : ''}{data.trend.percentage_change}%
              </span>
            )}
          </div>
          
          {chartData.length > 2 ? (
            <div className="h-48 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{fontSize: 10, fill: '#888'}} tickMargin={10} minTickGap={30} />
                  <YAxis domain={['auto', 'auto']} tick={{fontSize: 10, fill: '#888'}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [`₹${value}`, 'Modal Price']}
                    labelStyle={{ color: '#666', marginBottom: '4px' }}
                  />
                  <Line type="monotone" dataKey="price" stroke="#16a34a" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#16a34a' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-sm text-gray-500">Not enough historical data for chart.</p>
            </div>
          )}
          
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
            {data.trend.direction === 'UP' && "Recent observed prices are moving upward."}
            {data.trend.direction === 'DOWN' && "Recent observed prices are moving downward."}
            {data.trend.direction === 'STABLE' && "Recent observed prices have remained relatively stable."}
            {data.trend.direction === 'INSUFFICIENT_DATA' && "Not enough recent observations are available to identify a clear trend."}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Market Arrivals</h2>
          {currentArrival !== null ? (
            <div className="space-y-6">
              <div>
                <div className="text-sm text-gray-500 mb-1">Latest arrival ({data.observation_date})</div>
                <div className="text-2xl font-bold text-gray-900">{currentArrival.toLocaleString()} <span className="text-sm font-normal text-gray-500">q</span></div>
              </div>
              
              {avgArrival !== null && (
                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Recent average</div>
                    <div className="text-lg font-semibold text-gray-800">{Math.round(avgArrival).toLocaleString()} <span className="text-sm font-normal text-gray-500">q</span></div>
                  </div>
                  {arrivalChange && (
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">Change</div>
                      <div className={`text-lg font-bold ${Number(arrivalChange) > 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                        {Number(arrivalChange) > 0 ? '+' : ''}{arrivalChange}%
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[120px] flex items-center justify-center">
              <p className="text-sm text-gray-500">Arrival information is currently unavailable.</p>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-5">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Market Pressure</h2>
          <div className="flex items-center mb-4">
            <span className="text-lg mr-2">{getPressureEmoji(data.pressure.pressure)}</span>
            <span className="font-bold text-lg text-gray-900">{data.pressure.pressure}</span>
          </div>
          
          <div className="mt-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Why?</p>
            <ul className="space-y-2">
              {data.pressure.reasons.map((reason, idx) => (
                <li key={idx} className="flex items-start text-sm text-gray-600">
                  <span className="text-gray-400 mr-2 mt-0.5">•</span> {reason}
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-brand-primary bg-gradient-to-r from-brand-light/10 to-transparent">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Sale Window Insight</h2>
          <div className="flex items-center mb-4">
            <span className="text-lg mr-2">{getWindowEmoji(data.sale_window.window)}</span>
            <span className="font-bold text-lg text-gray-900">{formatWindowText(data.sale_window.window)}</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed mt-2 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            {data.sale_window.advice}
          </p>
        </Card>
      </div>

      <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 mt-10">What Does This Mean?</h2>
      <Card className="p-6 bg-gray-900 text-white shadow-lg">
        <p className="text-sm text-gray-300 mb-6 italic">This is an explanation of observed data, NOT a final selling decision.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start">
            <div className="bg-gray-800 p-2 rounded mr-3"><TrendingUp className="w-5 h-5 text-gray-300" /></div>
            <div>
              <h3 className="font-semibold text-white mb-1">Prices</h3>
              <p className="text-sm text-gray-400">
                {data.trend.direction === 'UP' && "Recent prices are moving upward."}
                {data.trend.direction === 'DOWN' && "Recent prices are moving downward."}
                {data.trend.direction === 'STABLE' && "Recent prices are relatively stable."}
                {data.trend.direction === 'INSUFFICIENT_DATA' && "Price trend is currently unclear."}
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-gray-800 p-2 rounded mr-3"><Package className="w-5 h-5 text-gray-300" /></div>
            <div>
              <h3 className="font-semibold text-white mb-1">Arrivals</h3>
              <p className="text-sm text-gray-400">
                {currentArrival && avgArrival && currentArrival > avgArrival * 1.1 ? "Arrivals are above the recent average." : 
                 currentArrival && avgArrival && currentArrival < avgArrival * 0.9 ? "Arrivals are below the recent average." :
                 currentArrival ? "Arrivals are steady." : "Arrival data is currently unavailable."}
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-gray-800 p-2 rounded mr-3"><Activity className="w-5 h-5 text-gray-300" /></div>
            <div>
              <h3 className="font-semibold text-white mb-1">Market pressure</h3>
              <p className="text-sm text-gray-400 capitalize">{data.pressure.pressure.toLowerCase()}.</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-gray-800 p-2 rounded mr-3"><Calendar className="w-5 h-5 text-gray-300" /></div>
            <div>
              <h3 className="font-semibold text-white mb-1">Sale window</h3>
              <p className="text-sm text-gray-400">
                {data.sale_window.window === 'FAVORABLE_NOW' && "Current conditions appear favorable."}
                {data.sale_window.window === 'CONSIDER_WAITING' && "Consider waiting for better conditions."}
                {data.sale_window.window === 'NEUTRAL' && "Market conditions are neutral."}
                {data.sale_window.window === 'INSUFFICIENT_DATA' && "Insufficient data for a clear sale window."}
              </p>
            </div>
          </div>
        </div>
      </Card>
      
      <div className="mt-8 text-center text-xs text-gray-400">
        <p>Data Type: {data.source_type}</p>
        <p>Source: {data.source_name}</p>
      </div>
    </div>
  );
};

const Activity = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
);
