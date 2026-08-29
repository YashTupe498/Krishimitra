import React from 'react';
import { CheckCircle2, CircleDashed, MapPin } from 'lucide-react';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import type { LotMatch, ProduceLot } from '../../../types/marketplace';
import styles from './MatchingLotCard.module.css';

interface MatchingLotCardProps { lot: ProduceLot; match: LotMatch; requirementQuantity: number; onViewDetails: () => void; onMakeOffer: () => void; }
const cropIcon = (crop: string) => crop === 'Onion' ? '🧅' : crop === 'Potato' ? '🥔' : '🌾';

export const MatchingLotCard: React.FC<MatchingLotCardProps> = ({ lot, match, requirementQuantity, onViewDetails, onMakeOffer }) => {
  const partial = match.quantityCompatibility === 'PARTIAL';
  const quantityLabel = partial ? `${lot.quantity.toLocaleString()}/${requirementQuantity.toLocaleString()} kg` : 'Full Quantity';
  return <div className={styles.card}>
    <div className={styles.header}>
      <div className={styles.avatar}>{cropIcon(lot.crop)}</div>
      <div className={styles.titleBlock}><h2>{lot.id} · {lot.crop}</h2><p>{lot.quantity.toLocaleString()} kg · Grade {lot.qualityGrade} · {lot.district}, {lot.state} <span><MapPin size={14} />{match.distanceKm} km away</span></p></div>
      <Badge variant={partial ? 'warning' : 'success'} className={styles.status}>{partial ? 'Partial Match' : 'Full Quantity Match'}</Badge>
    </div>
    <div className={styles.criteria}>
      <span><CheckCircle2 size={15} />Crop Match</span><span><CheckCircle2 size={15} />Quality Match</span><span><CheckCircle2 size={15} />Location Match</span><span className={partial ? styles.partial : ''}>{partial ? <CircleDashed size={15} /> : <CheckCircle2 size={15} />}{quantityLabel}</span>
    </div>
    <div className={styles.actions}><Button variant="secondary" onClick={onMakeOffer}>Make Offer</Button><Button variant="primary" onClick={onViewDetails}>View Details</Button></div>
  </div>;
};
