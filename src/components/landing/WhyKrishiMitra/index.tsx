import React from 'react';
import { Badge } from '../../ui/Badge';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import styles from './WhyKrishiMitra.module.css';

export const WhyKrishiMitra: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={clsx("h2", styles.title)}>{t('why.title')}</h2>
          <p className={clsx("body-large", styles.subtitle)}>
            {t('why.subtitle')}
          </p>
        </div>

        <div className={styles.visualization}>
          <div className={styles.visGrid}>
            <div className={styles.visCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>{t('why.marketA')}</div>
              </div>
              <div className={styles.dataRow}>
                <span>{t('why.headlinePrice')}</span>
                <span className="numeric">₹2,500/q</span>
              </div>
              <div className={clsx(styles.dataRow, styles.negative)}>
                <span>{t('why.transport80')}</span>
                <span className="numeric">−₹180/q</span>
              </div>
              <div className={styles.dataRow}>
                <span>{t('why.paymentTime')}</span>
                <span>{t('why.days10')}</span>
              </div>
              <div className={styles.netRow}>
                <span>{t('why.estNet')}</span>
                <span className={clsx("numeric", styles.netValue, styles.muted)}>₹2,320/q</span>
              </div>
            </div>

            <div className={clsx(styles.visCard, styles.recommended)}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>{t('why.buyerB')}</div>
                <Badge variant="recommended">{t('heroCard.recommended')}</Badge>
              </div>
              <div className={styles.dataRow}>
                <span>{t('why.headlinePrice')}</span>
                <span className="numeric">₹2,420/q</span>
              </div>
              <div className={clsx(styles.dataRow, styles.negative)}>
                <span>{t('why.transport15')}</span>
                <span className="numeric">−₹40/q</span>
              </div>
              <div className={styles.dataRow}>
                <span>{t('why.paymentTime')}</span>
                <span>{t('why.days3')}</span>
              </div>
              <div className={styles.netRow}>
                <span>{t('why.estNet')}</span>
                <span className={clsx("numeric", styles.netValue)}>₹2,380/q</span>
              </div>
            </div>
          </div>

          <div className={styles.equation}>
            <div className={styles.formulaText}>{t('why.formula')}</div>
          </div>
        </div>
      </div>
    </section>
  );
};
