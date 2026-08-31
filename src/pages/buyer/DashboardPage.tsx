import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Globe2, MapPin, Mic, Plus, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import type { BuyerDashboardData } from '../../data/mockBuyerDashboard';
import { buyerMarketplaceApi } from '../../services/buyerMarketplaceApi';
import styles from './DashboardPage.module.css';

const SectionTitle: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
  <div className={styles.sectionTitle}><h2>{icon}{children}</h2><div /></div>
);

export const BuyerDashboardPage: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<BuyerDashboardData>({
    priorityRequirement: { name: 'No active requirement', need: 'Create a requirement to discover matching supply.', lotsFound: '0 suitable lots found', fpoMatch: 'No FPO matches yet' },
    activeRequirement: { produce: 'No active requirement', quantity: '—', grade: '—' },
    supplySnapshot: [{ label: 'Matching Lots', value: '0' }, { label: 'Supply', value: '0 kg' }, { label: 'Nearest', value: '—' }, { label: 'FPO Matches', value: '0' }],
    matchingLots: [], summaries: [{ label: 'Offers Awaiting Response', value: '0', tone: 'success' }, { label: 'Active Transaction', value: '0', tone: 'info' }],
  });
  const firstName = profile?.full_name?.split(' ')[0] || 'Buyer';
  const location = profile?.district ? `${profile.district}, ${profile.state || 'India'}` : 'Nashik, Maharashtra';
  useEffect(() => {
    const load = async () => {
      const requirements = await buyerMarketplaceApi.getRequirements();
      const active = requirements.find((item) => item.status === 'ACTIVE') ?? requirements[0];
      const matches = active ? await buyerMarketplaceApi.getMatches(active.id) : [];
      const offers = await buyerMarketplaceApi.getOffersByBuyer();
      const transactions = await buyerMarketplaceApi.getTransactionsByBuyer();
      const totalSupply = matches.reduce((sum, item) => sum + item.lot.quantity, 0);
      setData({
        priorityRequirement: active ? { name: `${active.crop} Requirement`, need: `Need: ${active.quantityRequired.toLocaleString()} ${active.quantityUnit} • Grade ${active.acceptedQualityGrades.join('/')}`, lotsFound: `${matches.length} suitable lots found`, fpoMatch: 'FPO aggregation is not yet available' } : data.priorityRequirement,
        activeRequirement: active ? { produce: active.crop, quantity: `${active.quantityRequired.toLocaleString()} ${active.quantityUnit}`, grade: `Grade ${active.acceptedQualityGrades.join('/')}` } : data.activeRequirement,
        supplySnapshot: [{ label: 'Matching Lots', value: String(matches.length) }, { label: 'Supply', value: `${totalSupply.toLocaleString()} kg` }, { label: 'Nearest', value: '—' }, { label: 'FPO Matches', value: '0' }],
        matchingLots: matches.slice(0, 3).map(({ lot }) => ({ id: lot.id, produce: lot.crop, quantity: `${lot.quantity.toLocaleString()} ${lot.unit}`, grade: `Grade ${lot.qualityGrade}`, location: lot.district, emoji: lot.crop.toLowerCase() === 'onion' ? '🧅' : lot.crop.toLowerCase() === 'potato' ? '🥔' : '🌱' })),
        summaries: [{ label: 'Offers Awaiting Response', value: String(offers.filter((item) => item.status === 'SENT').length), tone: 'success' }, { label: 'Active Transaction', value: String(transactions.filter((item) => item.transactionStatus !== 'COMPLETED').length), tone: 'info' }],
      });
    };
    load().catch(() => undefined);
  }, []);
  return <div className={styles.dashboard}>
    <header className={styles.header}><div><h1>Good morning, {firstName} 👋</h1><p>Here's what needs your attention today.</p><span className={styles.location}><MapPin size={16} />{location}</span></div><div className={styles.quickActions}><Badge variant="info" className={styles.quickAction}><Globe2 size={16} />English</Badge><Badge variant="info" className={styles.quickAction}><Mic size={16} />Voice Assistant</Badge><button className={styles.profileButton} aria-label="Profile"><UserCircle size={20} /></button></div></header>
    <div className={styles.primaryAction}><Button variant="primary" size="large" onClick={() => navigate('/buyer/requirements')}><Plus size={22} />Create New Buying Requirement</Button></div>
    <section><SectionTitle icon="⭐">Your Priority Action</SectionTitle><Card className={styles.priorityCard}><div className={styles.priorityTop}><div className={styles.produceIcon}>🧅</div><div><h3>{data.priorityRequirement.name}</h3><p>{data.priorityRequirement.need}</p><div className={styles.priorityLines}><span><CheckCircle2 size={16} />{data.priorityRequirement.lotsFound}</span><span><CheckCircle2 size={16} />{data.priorityRequirement.fpoMatch}</span></div></div></div><div className={styles.priorityBottom}><div><p>Matching supply available</p><strong>{data.supplySnapshot[1].value}</strong></div><Button variant="primary" onClick={() => navigate('/buyer/matches')}>View Matching Supply <ArrowRight size={18} /></Button></div></Card></section>
    <div className={styles.twoColumn}><section><SectionTitle icon="📋">Active Requirement</SectionTitle><Card className={styles.panelCard}><div className={styles.requirementIcon}>🧅</div><div><p className={styles.eyebrow}>Produce</p><h3>{data.activeRequirement.produce}</h3><dl className={styles.requirementDetails}><div><dt>Quantity</dt><dd>{data.activeRequirement.quantity}</dd></div><div><dt>Quality</dt><dd>{data.activeRequirement.grade}</dd></div></dl></div></Card></section><section><SectionTitle icon="📊">Supply Snapshot</SectionTitle><Card className={styles.panelCard}><div className={styles.stats}>{data.supplySnapshot.map((stat) => <div key={stat.label}><span>{stat.label}</span><strong>{stat.value}</strong></div>)}</div></Card></section></div>
    <section><SectionTitle icon="🧅">New Matching Lots</SectionTitle><Card className={styles.lotsCard}>{data.matchingLots.map((lot) => <div className={styles.lotRow} key={lot.id}><span className={styles.lotEmoji}>{lot.emoji}</span><div className={styles.lotDetails}><strong>{lot.id} · {lot.produce}</strong><span>{lot.quantity} · {lot.grade} · {lot.location}</span></div><Button variant="secondary" onClick={() => navigate('/buyer/matches')}>View <ArrowRight size={16} /></Button></div>)}</Card></section>
    <section><SectionTitle icon="🤝">Offers & Transactions</SectionTitle><Card className={styles.summaryCard}>{data.summaries.map((item) => <div key={item.label} className={styles.summaryItem}><span>{item.label}</span><strong>{item.value}</strong></div>)}</Card></section>
  </div>;
};
