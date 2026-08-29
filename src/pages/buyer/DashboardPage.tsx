import React from 'react';
import { ArrowRight, CheckCircle2, Globe2, MapPin, Mic, Plus, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { mockBuyerDashboard } from '../../data/mockBuyerDashboard';
import styles from './DashboardPage.module.css';

const SectionTitle: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
  <div className={styles.sectionTitle}><h2>{icon}{children}</h2><div /></div>
);

export const BuyerDashboardPage: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const data = mockBuyerDashboard;
  const firstName = profile?.full_name?.split(' ')[0] || 'Buyer';
  const location = profile?.district ? `${profile.district}, ${profile.state || 'India'}` : 'Nashik, Maharashtra';
  return <div className={styles.dashboard}>
    <header className={styles.header}><div><h1>Good morning, {firstName} 👋</h1><p>Here's what needs your attention today.</p><span className={styles.location}><MapPin size={16} />{location}</span></div><div className={styles.quickActions}><Badge variant="info" className={styles.quickAction}><Globe2 size={16} />English</Badge><Badge variant="info" className={styles.quickAction}><Mic size={16} />Voice Assistant</Badge><button className={styles.profileButton} aria-label="Profile"><UserCircle size={20} /></button></div></header>
    <div className={styles.primaryAction}><Button variant="primary" size="large" onClick={() => navigate('/buyer/requirements')}><Plus size={22} />Create New Buying Requirement</Button></div>
    <section><SectionTitle icon="⭐">Your Priority Action</SectionTitle><Card className={styles.priorityCard}><div className={styles.priorityTop}><div className={styles.produceIcon}>🧅</div><div><h3>{data.priorityRequirement.name}</h3><p>{data.priorityRequirement.need}</p><div className={styles.priorityLines}><span><CheckCircle2 size={16} />{data.priorityRequirement.lotsFound}</span><span><CheckCircle2 size={16} />{data.priorityRequirement.fpoMatch}</span></div></div></div><div className={styles.priorityBottom}><div><p>Matching supply available</p><strong>{data.supplySnapshot[1].value}</strong></div><Button variant="primary" onClick={() => navigate('/buyer/matches')}>View Matching Supply <ArrowRight size={18} /></Button></div></Card></section>
    <div className={styles.twoColumn}><section><SectionTitle icon="📋">Active Requirement</SectionTitle><Card className={styles.panelCard}><div className={styles.requirementIcon}>🧅</div><div><p className={styles.eyebrow}>Produce</p><h3>{data.activeRequirement.produce}</h3><dl className={styles.requirementDetails}><div><dt>Quantity</dt><dd>{data.activeRequirement.quantity}</dd></div><div><dt>Quality</dt><dd>{data.activeRequirement.grade}</dd></div></dl></div></Card></section><section><SectionTitle icon="📊">Supply Snapshot</SectionTitle><Card className={styles.panelCard}><div className={styles.stats}>{data.supplySnapshot.map((stat) => <div key={stat.label}><span>{stat.label}</span><strong>{stat.value}</strong></div>)}</div></Card></section></div>
    <section><SectionTitle icon="🧅">New Matching Lots</SectionTitle><Card className={styles.lotsCard}>{data.matchingLots.map((lot) => <div className={styles.lotRow} key={lot.id}><span className={styles.lotEmoji}>{lot.emoji}</span><div className={styles.lotDetails}><strong>{lot.id} · {lot.produce}</strong><span>{lot.quantity} · {lot.grade} · {lot.location}</span></div><Button variant="secondary" onClick={() => navigate('/buyer/matches')}>View <ArrowRight size={16} /></Button></div>)}</Card></section>
    <section><SectionTitle icon="🤝">Offers & Transactions</SectionTitle><Card className={styles.summaryCard}>{data.summaries.map((item) => <div key={item.label} className={styles.summaryItem}><span>{item.label}</span><strong>{item.value}</strong></div>)}</Card></section>
  </div>;
};
