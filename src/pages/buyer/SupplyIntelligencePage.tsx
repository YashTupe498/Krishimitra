import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMarketplace } from '../../hooks/useMarketplace';
import { marketResearchDataset } from '../../data/marketResearchDataset';
import { 
  TrendingUp,
  PackageSearch,
  Scale,
  MapPin,
  Clock,
  Info,
  CheckCircle2,
  AlertTriangle,
  Truck,
  Warehouse,
  ChevronDown,
  Activity,
  Lightbulb
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import styles from './SupplyIntelligencePage.module.css';

// Type representing intelligence source provenance
type DataSourceType = "LIVE" | "PROJECT_DATA" | "CURATED_DEMO" | "UNAVAILABLE";

// Quantity normalizer
const normalizeToKg = (value: number, unit: string) => {
  if (unit === 'QUINTAL' || unit === 'quintals') return value * 100;
  if (unit === 'TONNE' || unit === 'tonnes') return value * 1000;
  return value;
};

export const SupplyIntelligencePage: React.FC = () => {
  const navigate = useNavigate();
  const { requirements, service } = useMarketplace();
  
  // Only consider active requirements
  const activeRequirements = requirements.filter(r => r.status === 'ACTIVE');
  const [selectedReqId, setSelectedReqId] = useState<string | null>(null);
  
  // State for resolved data
  const [matches, setMatches] = useState<Awaited<ReturnType<typeof service.getMatches>>>([]);
  const [loading, setLoading] = useState(false);

  // Set default requirement
  useEffect(() => {
    if (activeRequirements.length > 0 && !selectedReqId) {
      setSelectedReqId(activeRequirements[0].id);
    }
  }, [activeRequirements, selectedReqId]);

  const requirement = useMemo(() => {
    return activeRequirements.find(r => r.id === selectedReqId) || null;
  }, [activeRequirements, selectedReqId]);

  // Fetch matches whenever requirement changes
  useEffect(() => {
    if (requirement) {
      setLoading(true);
      service.getMatches(requirement?.id).then((result) => {
        setMatches(result);
        setLoading(false);
      });
    } else {
      setMatches([]);
    }
  }, [requirement, service]);

  // Derived Intelligence Calculations
  const intelligence = useMemo(() => {
    if (!requirement) return null;
    
    const requiredKg = normalizeToKg(requirement?.quantityRequired, requirement?.quantityUnit);
    
    // 1. Analyze Real Compatible Lots
    let compatibleLots = matches.filter(m => 
      m.lot.crop === requirement?.crop &&
      (requirement?.acceptedQualityGrades || []).includes(m.lot.qualityGrade as any) &&
      m.lot.status === 'AVAILABLE'
    ).map(m => ({ ...m, kg: normalizeToKg(m.lot.quantity, m.lot.quantityUnit) }));

    let dataSource: DataSourceType = 'LIVE';
    
    // 2. DEMO FALLBACK LAYER
    // If there is literally 0 real matching supply, we inject a deterministic demo scenario
    // to ensure the UI has meaningful data for SIH presentation.
    if (compatibleLots.length === 0) {
      dataSource = 'CURATED_DEMO';
      // Deterministic demo generation based on requirement
      const demoBase = requiredKg * 0.96; // 96% coverage
      compatibleLots = [
        {
          match: { totalScore: 98, distanceScore: 100, qualityScore: 100, priceScore: 100, quantityScore: 90, matchesRequired: true, reasons: [] },
          kg: Math.round(demoBase * 0.25),
          lot: { id: `DEMO-${requirement?.crop.toUpperCase()}-1`, crop: requirement?.crop, qualityGrade: requirement.acceptedQualityGrades[0], quantity: Math.round(demoBase * 0.25), quantityUnit: 'KG', district: 'Pune', status: 'AVAILABLE', farmerId: 'F1', pricePerQuintal: 2500, createdAt: new Date().toISOString() }
        },
        {
          match: { totalScore: 94, distanceScore: 90, qualityScore: 100, priceScore: 95, quantityScore: 85, matchesRequired: true, reasons: [] },
          kg: Math.round(demoBase * 0.33),
          lot: { id: `DEMO-${requirement?.crop.toUpperCase()}-2`, crop: requirement?.crop, qualityGrade: requirement.acceptedQualityGrades[0], quantity: Math.round(demoBase * 0.33), quantityUnit: 'KG', district: 'Nashik', status: 'AVAILABLE', farmerId: 'F2', pricePerQuintal: 2400, createdAt: new Date().toISOString() }
        },
        {
          match: { totalScore: 91, distanceScore: 100, qualityScore: 100, priceScore: 80, quantityScore: 80, matchesRequired: true, reasons: [] },
          kg: Math.round(demoBase * 0.22),
          lot: { id: `DEMO-${requirement?.crop.toUpperCase()}-3`, crop: requirement?.crop, qualityGrade: requirement.acceptedQualityGrades[0], quantity: Math.round(demoBase * 0.22), quantityUnit: 'KG', district: 'Pune', status: 'AVAILABLE', farmerId: 'F3', pricePerQuintal: 2550, createdAt: new Date().toISOString() }
        },
        {
          match: { totalScore: 85, distanceScore: 90, qualityScore: 100, priceScore: 85, quantityScore: 70, matchesRequired: true, reasons: [] },
          kg: Math.round(demoBase * 0.20),
          lot: { id: `DEMO-${requirement?.crop.toUpperCase()}-4`, crop: requirement?.crop, qualityGrade: requirement.acceptedQualityGrades[0], quantity: Math.round(demoBase * 0.20), quantityUnit: 'KG', district: 'Nashik', status: 'AVAILABLE', farmerId: 'F4', pricePerQuintal: 2450, createdAt: new Date().toISOString() }
        }
      ];
    }

    const totalCompatibleSupplyKg = compatibleLots.reduce((sum, m) => sum + m.kg, 0);
    const coveragePercent = Math.min(100, Math.round((totalCompatibleSupplyKg / requiredKg) * 100));
    const supplyGapKg = Math.max(0, requiredKg - totalCompatibleSupplyKg);
    
    // Group by market
    const marketGroups = compatibleLots.reduce((acc, m) => {
      const market = m.lot.district;
      if (!acc[market]) acc[market] = { totalKg: 0, lots: [] };
      acc[market].totalKg += m.kg;
      acc[market].lots.push(m);
      return acc;
    }, {} as Record<string, { totalKg: number, lots: typeof compatibleLots }>);

    const marketsList = Object.entries(marketGroups)
      .map(([name, data]) => ({ name, ...(data as any) }))
      .sort((a, b) => b.totalKg - a.totalKg);

    // Group by grade
    const sourceLotsForGrade = dataSource === 'CURATED_DEMO' ? compatibleLots : matches; 
    const gradeGroups = sourceLotsForGrade.filter(m => m.lot.crop === requirement?.crop && m.lot.status === 'AVAILABLE').reduce((acc, m) => {
      const grade = m.lot.qualityGrade;
      const kg = m.kg || normalizeToKg(m.lot.quantity, m.lot.quantityUnit);
      if (!acc[grade]) acc[grade] = { totalKg: 0, count: 0 };
      acc[grade].totalKg += kg;
      acc[grade].count += 1;
      return acc;
    }, {} as Record<string, { totalKg: number, count: number }>);

    // Aggregation logic
    const sortedLotsDesc = [...compatibleLots].sort((a, b) => b.kg - a.kg);
    let aggSum = 0;
    let aggCount = 0;
    for (const lot of sortedLotsDesc) {
      if (aggSum >= requiredKg) break;
      aggSum += lot.kg;
      aggCount++;
    }
    
    const canAggregate = aggSum >= requiredKg && aggCount > 1;

    // Market Prices (find latest price for this crop)
    const marketPrices = marketResearchDataset
      .filter(r => r.crop === requirement?.crop && r.metric === 'price')
      .sort((a, b) => new Date(b.observationDate || 0).getTime() - new Date(a.observationDate || 0).getTime());
    
    const latestPrice = marketPrices.length > 0 ? marketPrices[0] : null;
    
    // Top opportunities
    const topOpportunities = [...compatibleLots].sort((a, b) => b.match.totalScore - a.match.totalScore).slice(0, 3);

    // Supply Pressure
    let supplyPressure = 'MODERATE';
    if (coveragePercent >= 100) supplyPressure = 'HIGH SUPPLY';
    if (coveragePercent < 50) supplyPressure = 'LIMITED';

    return {
      requiredKg,
      totalCompatibleSupplyKg,
      coveragePercent,
      supplyGapKg,
      marketsList,
      gradeGroups,
      compatibleLots,
      topOpportunities,
      latestPrice,
      canAggregate,
      aggSum,
      aggCount,
      dataSource,
      supplyPressure
    };
  }, [requirement, matches]);

  // --- EMPTY STATES ---
  if (activeRequirements.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className="text-[#14532D]">Supply Intelligence</h1>
          <p>Understand available supply, market conditions, and sourcing opportunities.</p>
        </div>
        <div className={styles.emptyState}>
          <AlertTriangle size={48} className="text-gray-300 mb-4" />
          <h2 className="h3">No active requirement</h2>
          <p className="body-base mt-2 mb-6">Create a buying requirement to see compatible supply and sourcing intelligence.</p>
          <Button onClick={() => navigate('/buyer/requirements/new')}>Create Requirement</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className="text-[#14532D]">Supply Intelligence</h1>
        <p>Understand available supply, market conditions, and sourcing opportunities.</p>
      </div>

      {/* Requirement Focus Selector */}
      <div className={styles.selectorCard}>
        <div>
          <span className={styles.selectorLabel}>Requirement Focus</span>
          {activeRequirements.length > 1 ? (
            <div className="relative">
              <select 
                className={styles.selectorSelect}
                value={selectedReqId || ''}
                onChange={(e) => setSelectedReqId(e.target.value)}
              >
                {activeRequirements.map(req => (
                  <option key={req.id} value={req.id}>
                    {req.crop} · {req.quantityRequired} {req.quantityUnit} · Grade {req.acceptedQualityGrades.join('/')}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 text-gray-500 pointer-events-none" size={16} />
            </div>
          ) : requirement ? (
            <div>
              <div className="text-lg font-bold text-gray-900">
                {requirement?.crop} · {requirement?.quantityRequired} {requirement?.quantityUnit} · Grade {requirement.acceptedQualityGrades.join('/')}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Delivery Preference: {requirement?.deliveryPreference.replace('_', ' ')} · Payment: {requirement?.paymentTimelineDays} days
              </div>
            </div>
          ) : null}
        </div>
        <Button variant="secondary" onClick={() => navigate('/buyer/requirements')}>Manage Requirements</Button>
      </div>

      {loading || !intelligence ? (
        <div className="animate-pulse space-y-8">
          <div className="h-24 bg-gray-200 rounded-lg w-full"></div>
          <div className="grid grid-cols-3 gap-4"><div className="h-32 bg-gray-200 rounded-lg"></div><div className="h-32 bg-gray-200 rounded-lg"></div><div className="h-32 bg-gray-200 rounded-lg"></div></div>
        </div>
      ) : (
        <>
          {/* KPI Summary Row */}
          <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
              <span className={styles.kpiLabel}><PackageSearch size={14}/> Supply Available</span>
              <span className={styles.kpiValue}>{intelligence.totalCompatibleSupplyKg.toLocaleString()} kg</span>
              <span className={styles.kpiSub}>Across {intelligence.compatibleLots.length} lots</span>
            </div>
            <div className={styles.kpiCard}>
              <span className={styles.kpiLabel}><Activity size={14}/> Coverage</span>
              <span className={styles.kpiValue}>{intelligence.coveragePercent}%</span>
              <span className={styles.kpiSub}>{intelligence.totalCompatibleSupplyKg} / {intelligence.requiredKg} kg</span>
            </div>
            <div className={styles.kpiCard}>
              <span className={styles.kpiLabel}><AlertTriangle size={14}/> Supply Gap</span>
              <span className={styles.kpiValue}>{intelligence.supplyGapKg.toLocaleString()} kg</span>
              <span className={styles.kpiSub}>{intelligence.supplyGapKg > 0 ? 'Action required' : 'Met'}</span>
            </div>
            <div className={styles.kpiCard}>
              <span className={styles.kpiLabel}><TrendingUp size={14}/> Market Price</span>
              <span className={styles.kpiValue}>{intelligence.latestPrice ? `₹${intelligence.latestPrice.value?.toLocaleString()}` : '--'}</span>
              <span className={styles.kpiSub}>{intelligence.latestPrice ? `Modal / ${intelligence.latestPrice.unit}` : 'Unavailable'}</span>
            </div>
          </div>

          {/* Main Intelligence Grid using independent flex columns */}
          <div className={styles.mainGrid}>
            
            {/* LEFT COLUMN */}
            <div className={styles.column}>
              
              {/* Coverage Progress */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <PackageSearch size={20} className={styles.cardIcon} />
                  <h3 className={styles.cardTitle}>Supply Coverage</h3>
                </div>
                <div className={styles.coverageStats}>
                  <span>{intelligence.requiredKg.toLocaleString()} kg required</span>
                  <span>{intelligence.totalCompatibleSupplyKg.toLocaleString()} kg available</span>
                </div>
                <div className={styles.coverageBarBg}>
                  <div 
                    className={`${styles.coverageBarFill} ${intelligence.coveragePercent >= 100 ? styles.full : intelligence.coveragePercent < 50 ? styles.warning : ''}`} 
                    style={{ width: `${intelligence.coveragePercent}%` }}
                  ></div>
                </div>
                <div className="text-sm font-semibold text-gray-800 mt-2">
                  {intelligence.coveragePercent === 0 
                    ? "No compatible supply is currently visible." 
                    : intelligence.coveragePercent < 100 
                      ? `Additional supply is required to close the ${intelligence.supplyGapKg} kg gap.` 
                      : "Your requirement is fully covered."}
                </div>
              </div>

              {/* Farmer Supply Activity */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <Clock size={20} className={styles.cardIcon} />
                  <h3 className={styles.cardTitle}>Active Farmer Supply</h3>
                </div>
                {intelligence.compatibleLots.length > 0 ? (
                  <div className="space-y-0">
                    {intelligence.compatibleLots.slice(0, 4).map((m, i) => (
                      <div key={i} className={styles.listRow}>
                        <div className={styles.listCol}>
                          <span className={styles.listLabel}>Lot #{m.lot.id.substring(0,12)}</span>
                          <span className={styles.listSub}>{m.lot.crop} · Grade {m.lot.qualityGrade} · {m.lot.district} · Selling in 1-3 days</span>
                        </div>
                        <div className={styles.listCol} style={{ alignItems: 'flex-end' }}>
                          <span className={styles.listValue}>{m.kg} kg</span>
                          <span className={styles.listTag}>Farmer Lot</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 py-4">No active compatible lots found.</p>
                )}
                
                <div className={styles.sourceMetadata}>
                  <Info size={12} /> Source: {intelligence.dataSource === 'CURATED_DEMO' ? <span className={styles.demoBadge}>Curated Demo</span> : 'Live Project Data'}
                </div>
              </div>

              {/* Aggregation Opportunity */}
              {intelligence.canAggregate && (
                <div className={`${styles.card} ${styles.aggregationCard}`}>
                  <div className={styles.cardHeader} style={{ borderBottomColor: 'rgba(20,83,45,0.1)' }}>
                    <CheckCircle2 size={20} className="text-green-700" />
                    <h3 className={styles.cardTitle}>Aggregation Opportunity</h3>
                  </div>
                  <p className="font-semibold text-gray-900 mb-2">
                    {intelligence.aggCount} compatible lots can collectively meet your requirement.
                  </p>
                  <p className="text-sm text-gray-700 mb-6">
                    Potential supply: {intelligence.aggSum.toLocaleString()} kg. Combining these lots closes your supply gap.
                  </p>
                  <Button onClick={() => navigate(`/buyer/matching-lots?requirementId=${requirement?.id}`)}>View Aggregation Options</Button>
                </div>
              )}

              {/* Top Opportunities */}
              {intelligence.topOpportunities.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Top Sourcing Opportunities</h3>
                  <div className={styles.opportunityGrid}>
                    {intelligence.topOpportunities.map((m, i) => (
                      <div key={i} className={styles.opportunityCard}>
                        <div className={styles.oppHeader}>
                          <div>
                            <span className="text-sm font-bold block">{m.lot.district}</span>
                            <span className="text-xs text-gray-500">{m.lot.crop} · Grade {m.lot.qualityGrade}</span>
                          </div>
                          <span className={styles.oppScore}>{m.match.totalScore}% Match</span>
                        </div>
                        <div className="text-xl font-bold text-gray-900">{m.kg.toLocaleString()} kg</div>
                        <div className={styles.oppAction}>
                          <Button 
                            variant="secondary" 
                            className="w-full text-xs py-2"
                            onClick={() => navigate(`/buyer/lots/${m.lot.id}?requirementId=${requirement?.id}`)}
                          >
                            View Lot Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT COLUMN */}
            <div className={styles.column}>
              
              {/* Supply By Market (Horizontal Bars) */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <MapPin size={20} className={styles.cardIcon} />
                  <h3 className={styles.cardTitle}>Supply by Market</h3>
                </div>
                {intelligence.marketsList.length > 0 ? (
                  <div>
                    {intelligence.marketsList.map((m, i) => {
                      const maxKg = Math.max(...intelligence.marketsList.map(l => l.totalKg));
                      const percent = Math.round((m.totalKg / maxKg) * 100);
                      return (
                        <div key={i} className={styles.marketBarRow}>
                          <div className={styles.marketBarLabel}>
                            <span>{m.name} <span className="text-gray-400 font-normal ml-1">({m.lots.length} lots)</span></span>
                            <span>{m.totalKg.toLocaleString()} kg</span>
                          </div>
                          <div className={styles.marketBarBg}>
                            <div className={styles.marketBarFill} style={{ width: `${percent}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 py-2">No location data available.</p>
                )}
              </div>

              {/* Quality Availability */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <Scale size={20} className={styles.cardIcon} />
                  <h3 className={styles.cardTitle}>Quality Availability</h3>
                </div>
                <div className="space-y-1">
                  {Object.entries(intelligence.gradeGroups).map(([grade, data], i) => {
                    const isCompatible = (requirement?.acceptedQualityGrades || []).includes(grade as any);
                    return (
                      <div key={i} className={styles.listRow}>
                        <div className={styles.listCol}>
                          <span className={styles.listLabel}>Grade {grade}</span>
                          {isCompatible ? (
                            <span className="text-xs text-green-700 font-bold">Compatible requirement</span>
                          ) : (
                            <span className="text-xs text-gray-400">Incompatible with requirement</span>
                          )}
                        </div>
                        <div className={styles.listCol} style={{ alignItems: 'flex-end' }}>
                          <span className={styles.listValue}>{(data as any).totalKg.toLocaleString()} kg</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Supply Pressure */}
              <div className={styles.card}>
                 <div className={styles.cardHeader}>
                  <Activity size={20} className={styles.cardIcon} />
                  <h3 className={styles.cardTitle}>Supply Pressure</h3>
                </div>
                <div className="text-lg font-bold text-gray-900 mb-1">{intelligence.supplyPressure}</div>
                <p className="text-sm text-gray-600">
                  {intelligence.supplyPressure === 'HIGH SUPPLY' ? 'Visible compatible supply easily covers your requirement.' :
                   intelligence.supplyPressure === 'MODERATE' ? 'Visible compatible supply covers most of the requirement, while some quantity remains to be sourced.' :
                   'Limited compatible supply exists. Sourcing may require flexibility.'}
                </p>
              </div>

              {/* Market Intelligence Context */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <TrendingUp size={20} className={styles.cardIcon} />
                  <h3 className={styles.cardTitle}>Market Price Context</h3>
                </div>
                {intelligence.latestPrice ? (
                  <div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">₹{intelligence.latestPrice.value?.toLocaleString()} <span className="text-sm font-normal text-gray-500">/{intelligence.latestPrice.unit}</span></div>
                    <div className="text-sm text-gray-700 font-semibold mb-1">{intelligence.latestPrice.market} (Modal)</div>
                    <div className="text-xs text-gray-500">Observed: {intelligence.latestPrice.observationDate}</div>
                    <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      Historical trend will appear when enough observations are available.
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 py-2">No price data available.</p>
                )}
                <div className={styles.sourceMetadata}>
                  <Info size={12} /> Source: {intelligence.latestPrice?.sourceType === 'CURATED' || intelligence.latestPrice?.sourceType === 'CURATED_DEMO' ? <span className={styles.demoBadge}>Project Dataset</span> : 'Live'}
                </div>
              </div>

              {/* Logistics & Storage (Estimated / Demo) */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <Truck size={20} className={styles.cardIcon} />
                  <h3 className={styles.cardTitle}>Logistics</h3>
                </div>
                {intelligence.marketsList.length > 0 ? (
                  <div className="space-y-3">
                    <div className="text-sm flex justify-between">
                      <span className="text-gray-600">Origin:</span>
                      <span className="font-bold text-gray-900">{intelligence.marketsList[0].name}</span>
                    </div>
                    <div className="text-sm flex justify-between">
                      <span className="text-gray-600">Destination:</span>
                      <span className="font-bold text-gray-900">{requirement?.district || 'Buyer Location'}</span>
                    </div>
                    <div className="text-sm flex justify-between">
                      <span className="text-gray-600">Estimated Transport:</span>
                      <span className="font-bold text-gray-900 font-mono">₹2,850</span>
                    </div>
                    <div className="mt-2 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded inline-block uppercase">Estimated Only</div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Logistics unavailable.</p>
                )}
                
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Warehouse size={20} className={styles.cardIcon} />
                    <h3 className={styles.cardTitle}>Storage & e-NWR</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Eligible produce stored at participating warehouses may be associated with an electronic Negotiable Warehouse Receipt, subject to eligibility and warehouse/bank conditions.
                  </p>
                  <Button variant="secondary" className="w-full text-xs">Learn More</Button>
                </div>
                <div className={styles.sourceMetadata}>
                  <Info size={12} /> Source: <span className={styles.demoBadge}>Curated Demo</span>
                </div>
              </div>

            </div>
          </div>

          {/* New Refined Recommendation Card */}
          <div className={styles.recommendationCard}>
            <div className={styles.recommendationText}>
              <div className={styles.recIcon}>
                <Lightbulb size={24} />
              </div>
              <div>
                <h2>Sourcing Recommendation</h2>
                <p>
                  {intelligence.coveragePercent === 0 
                    ? "No compatible supply is currently visible. Consider reviewing nearby markets or adjusting sourcing parameters."
                    : intelligence.coveragePercent >= 100 
                      ? "Your requirement is fully covered by currently visible compatible supply."
                      : `Your requirement is ${intelligence.coveragePercent}% covered. Additional lots or aggregation may close the remaining gap.`
                  }
                </p>
              </div>
            </div>
            <div className={styles.recommendationAction}>
              <Button onClick={() => navigate(`/buyer/matching-lots?requirementId=${requirement?.id}`)}>
                {intelligence.coveragePercent === 0 ? 'Review Requirements' : 'View Matching Lots'}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
