import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Clock3, TrendingDown, TrendingUp } from 'lucide-react';
import { marketResearchDataset } from '../../../data/marketResearchDataset';
import styles from './MarketSignalCard.module.css';

type SignalPoint = {
  date: string;
  label: string;
  price: number;
};

const formatDate = (date: string) => new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
}).format(new Date(`${date}T00:00:00`));

const selectChartPoints = (points: SignalPoint[], targetCount = 5) => {
  if (points.length <= targetCount) return points;

  return Array.from({ length: targetCount }, (_, index) => {
    const pointIndex = Math.round((index * (points.length - 1)) / (targetCount - 1));
    return points[pointIndex];
  });
};

const PriceTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: SignalPoint }> }) => {
  if (!active || !payload?.[0]) return null;

  const point = payload[0].payload;
  return (
    <div className={styles.tooltip}>
      <strong>{point.label}</strong>
      <span>₹{point.price.toLocaleString('en-IN')}/quintal</span>
    </div>
  );
};

export const MarketSignalCard: React.FC = () => {
  const cardRef = useRef<HTMLElement>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const { chartData, latestDate, isBullish } = useMemo(() => {
    const allPoints = marketResearchDataset
      .filter((record) => record.market === 'Pimpalgaon Baswant APMC' && record.metric === 'price' && record.status === 'available' && record.value !== null && record.observationDate)
      .sort((a, b) => (a.observationDate ?? '').localeCompare(b.observationDate ?? ''))
      .map((record) => ({
        date: record.observationDate as string,
        label: formatDate(record.observationDate as string),
        price: record.value as number,
      }));

    const points = selectChartPoints(allPoints);
    const latest = allPoints[allPoints.length - 1];
    const previous = allPoints[allPoints.length - 2];

    return {
      chartData: points,
      latestDate: latest?.date ?? null,
      isBullish: Boolean(latest && previous && latest.price > previous.price),
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotionPreference = () => setReduceMotion(mediaQuery.matches);
    syncMotionPreference();
    mediaQuery.addEventListener('change', syncMotionPreference);

    const card = cardRef.current;
    if (!card || mediaQuery.matches) {
      setHasEntered(true);
      return () => mediaQuery.removeEventListener('change', syncMotionPreference);
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setHasEntered(true);
      observer.disconnect();
    }, { threshold: 0.24 });

    observer.observe(card);
    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', syncMotionPreference);
    };
  }, []);

  const TrendIcon = isBullish ? TrendingUp : TrendingDown;
  const status = isBullish ? 'Bullish' : 'Watchful';
  const trendCopy = isBullish
    ? 'Recent observed prices are strengthening.'
    : 'Recent observed prices need closer monitoring.';

  return (
    <article ref={cardRef} className={styles.card} aria-label={`Market signal: ${status}. ${trendCopy}`}>
      <header className={styles.header}>
        <div className={styles.headingGroup}>
          <span className={styles.icon} aria-hidden="true"><TrendIcon size={22} /></span>
          <div>
            <h3>Market Signal</h3>
            <p>{trendCopy}</p>
          </div>
        </div>
        <span className={`${styles.status} ${isBullish ? styles.bullish : styles.watchful}`}>
          <span aria-hidden="true" />{status}
        </span>
      </header>

      <div className={styles.chartLabel}>Price (₹/quintal)</div>
      <div className={styles.chart} role="img" aria-label="Historical Pimpalgaon Baswant APMC onion prices in rupees per quintal">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 26, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="marketSignalArea" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--market-signal)" stopOpacity={0.19} />
                <stop offset="95%" stopColor="var(--market-signal)" stopOpacity={0.015} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--market-signal-grid)" strokeDasharray="4 5" />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'var(--market-signal-muted)', fontSize: 11 }} tickMargin={10} />
            <YAxis axisLine={false} tickLine={false} width={48} tick={{ fill: 'var(--market-signal-muted)', fontSize: 11 }} tickFormatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} domain={['dataMin - 250', 'dataMax + 250']} tickMargin={6} />
            <Tooltip content={<PriceTooltip />} cursor={{ stroke: 'var(--market-signal-grid)', strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="price"
              stroke="var(--market-signal)"
              strokeWidth={3}
              fill="url(#marketSignalArea)"
              isAnimationActive={hasEntered && !reduceMotion}
              animationDuration={1400}
              animationEasing="ease-out"
              activeDot={{ r: 6, fill: 'var(--market-signal)', stroke: 'var(--surface)', strokeWidth: 3 }}
              dot={(dotProps: { cx?: number; cy?: number; index?: number }) => (
                <circle
                  cx={dotProps.cx}
                  cy={dotProps.cy}
                  r="4.5"
                  className={`${styles.point} ${hasEntered || reduceMotion ? styles.pointVisible : ''}`}
                  style={{ animationDelay: `${(dotProps.index ?? 0) * 220 + 220}ms` }}
                />
              )}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <footer className={styles.footer}>
        <span><Clock3 size={15} aria-hidden="true" />Curated project data{latestDate ? ` · ${formatDate(latestDate)}` : ''}</span>
        <span className={styles.marketName}>Pimpalgaon Baswant APMC</span>
      </footer>
    </article>
  );
};
