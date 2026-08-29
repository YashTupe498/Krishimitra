import React from 'react';
import { NetComparison } from '../NetComparison';
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

        <div className={styles.visualization}><NetComparison variant="expanded" copy={{ marketA: t('why.marketA'), buyerB: t('why.buyerB'), recommended: t('heroCard.recommended'), headline: t('why.headlinePrice'), transportA: t('why.transport80'), transportB: t('why.transport15'), payment: t('why.paymentTime'), paymentA: t('why.days10'), paymentB: t('why.days3'), estimated: t('why.estNet'), formula: t('why.formula') }} /></div>
      </div>
    </section>
  );
};
