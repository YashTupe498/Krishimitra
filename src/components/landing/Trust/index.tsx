import React from 'react';
import { ShieldCheck, Receipt, Scale } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import styles from './Trust.module.css';

export const Trust: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>{t('trust.eyebrow')}</span>
          <h2 className={clsx("h1", styles.title)}>{t('trust.title')}</h2>
          <p className={clsx("body-large", styles.subtitle)}>
            {t('trust.subtitle')}
          </p>
        </div>
        
        <div className={styles.bentoGrid}>
          {/* Large Image Card with Floating Receipt */}
          <div className={clsx(styles.bentoCard, styles.mainCard)}>
            <div className={styles.cardImageBg}></div>
            <div className={styles.mainCardContent}>
              <div className={styles.floatingReceipt}>
                <div className={styles.receiptHeader}>
                  <Receipt size={18} />
                  <span>{t('trust.digitalPatti')}</span>
                </div>
                <div className={styles.receiptBody}>
                  <div className={styles.receiptRow}>
                    <span>{t('trust.grossOffer')}</span>
                    <span>₹2,500/q</span>
                  </div>
                  <div className={styles.receiptRow}>
                    <span style={{ color: 'var(--text-secondary)' }}>- {t('trust.transport')}</span>
                    <span style={{ color: 'var(--error)' }}>- ₹80/q</span>
                  </div>
                  <div className={styles.receiptRow}>
                    <span style={{ color: 'var(--text-secondary)' }}>- {t('trust.platformFee')}</span>
                    <span style={{ color: 'var(--error)' }}>- ₹12.5/q</span>
                  </div>
                  <div className={styles.receiptDivider}></div>
                  <div className={styles.receiptTotal}>
                    <span>{t('trust.estNet')}</span>
                    <span className={styles.highlightText}>₹2,407.5/q</span>
                  </div>
                </div>
              </div>
              <div className={styles.mainCardText}>
                <h3>{t('trust.knowExactly')}</h3>
                <p>{t('trust.knowExactlyDesc')}</p>
              </div>
            </div>
          </div>

          {/* Right Side Cards */}
          <div className={styles.sideCards}>
            <div className={clsx(styles.bentoCard, styles.sideCard)}>
              <div className={styles.iconWrapper}>
                <ShieldCheck size={28} />
              </div>
              <h3>{t('trust.kycTitle')}</h3>
              <p>{t('trust.kycDesc')}</p>
            </div>
            
            <div className={clsx(styles.bentoCard, styles.sideCard)}>
              <div className={clsx(styles.iconWrapper, styles.altIcon)}>
                <Scale size={28} />
              </div>
              <h3>{t('trust.gradingTitle')}</h3>
              <p>{t('trust.gradingDesc')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
