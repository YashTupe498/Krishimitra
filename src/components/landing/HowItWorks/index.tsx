import React from 'react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import styles from './HowItWorks.module.css';

export const HowItWorks: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section id="how-it-works" className={styles.section}>
      <div className={styles.container}>
        <h2 className={clsx("h2", styles.title)}>{t('howItWorks.title')}</h2>
        
        <div className={styles.flow}>
          <div className={styles.step}>
            <div className={styles.circle}>1</div>
            <div className={styles.stepTitle}>{t('howItWorks.step1Title')}</div>
            <div className={styles.stepDesc}>{t('howItWorks.step1Desc')}</div>
          </div>
          
          <div className={styles.step}>
            <div className={styles.circle}>2</div>
            <div className={styles.stepTitle}>{t('howItWorks.step2Title')}</div>
            <div className={styles.stepDesc}>{t('howItWorks.step2Desc')}</div>
          </div>
          
          <div className={styles.step}>
            <div className={styles.circle}>3</div>
            <div className={styles.stepTitle}>{t('howItWorks.step3Title')}</div>
            <div className={styles.stepDesc}>{t('howItWorks.step3Desc')}</div>
          </div>
          
          <div className={styles.step}>
            <div className={styles.circle}>4</div>
            <div className={styles.stepTitle}>{t('howItWorks.step4Title')}</div>
            <div className={styles.stepDesc}>{t('howItWorks.step4Desc')}</div>
          </div>

          <div className={styles.step}>
            <div className={styles.circle}>5</div>
            <div className={styles.stepTitle}>{t('howItWorks.step5Title')}</div>
            <div className={styles.stepDesc}>{t('howItWorks.step5Desc')}</div>
          </div>
        </div>
      </div>
    </section>
  );
};
