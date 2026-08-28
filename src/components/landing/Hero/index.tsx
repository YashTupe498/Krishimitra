import React from 'react';
import { ArrowRight, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import styles from './Hero.module.css';
import { clsx } from 'clsx';

export const Hero: React.FC = () => {
  const { t } = useTranslation();

  const scrollToRoles = () => {
    document.getElementById('role-selection')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.content}>
          <span className={styles.eyebrow}>{t('hero.eyebrow')}</span>
          <h1 className={clsx("h1-display", styles.title)}>
            {t('hero.titleLine1')}<br />
            {t('hero.titleLine2')} <span className={styles.highlight}>{t('hero.titleHighlight')}</span>
          </h1>
          <p className={clsx("body-large", styles.subtitle)}>
            {t('hero.subtitle')}
          </p>
          <div className={styles.actions}>
            <Button size="large" onClick={scrollToRoles}>{t('hero.chooseRole')}</Button>
            <button className={styles.exploreLink} onClick={scrollToHowItWorks}>
              {t('hero.explore')} <ArrowRight size={16} />
            </button>
          </div>
        </div>
        <div className={styles.imageWrapper}>
          <div className={styles.visual}>
              <div className={styles.visualHeader}>
                <div>
                  <div style={{ fontWeight: 600 }}>{t('heroCard.crop')}</div>
                  <div className="body-small" style={{ color: 'var(--text-secondary)' }}>5,000 kg • Nashik, MH</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="body-small" style={{ color: 'var(--text-secondary)' }}>{t('heroCard.evaluating')}</div>
                </div>
              </div>
              
              <div className={styles.comparisonGrid}>
                <div className={styles.comparisonRow}>
                  <div className={styles.rowDetails}>
                    <div className={styles.rowTitle}>{t('heroCard.marketA')}</div>
                    <div className={styles.rowSub}>₹2,500/q {t('heroCard.headline')} • −₹180 {t('heroCard.transport')} • 10-day {t('heroCard.pay')}</div>
                  </div>
                  <div className={styles.rowNet}>
                    <div className={styles.rowSub}>{t('heroCard.estNet')}</div>
                    <div className={clsx("numeric", styles.netValue, styles.muted)}>₹2,320</div>
                  </div>
                </div>
                
                <div className={clsx(styles.comparisonRow, styles.recommended)}>
                  <div className={styles.rowDetails}>
                    <div className={styles.rowTitle}>
                      {t('heroCard.buyerB')} <Badge variant="success" className={styles.pulsingBadge}>{t('heroCard.recommended')}</Badge>
                    </div>
                    <div className={styles.rowSub}>₹2,420/q {t('heroCard.headline')} • −₹40 {t('heroCard.transport')} • 3-day {t('heroCard.pay')}</div>
                  </div>
                  <div className={styles.rowNet}>
                    <div className={styles.rowSub}>{t('heroCard.estNet')}</div>
                    <div className={clsx("numeric", styles.netValue)}>₹2,380</div>
                  </div>
                </div>
              </div>
              
              <div style={{ marginTop: '24px', display: 'flex', gap: '8px', color: 'var(--text-secondary)', fontSize: '13px', alignItems: 'center' }}>
                <Info size={14} /> {t('heroCard.footerText')}
              </div>
            </div>
          </div>
        </div>
    </section>
  );
};
