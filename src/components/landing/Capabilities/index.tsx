import React from 'react';
import { LineChart, Calculator, CheckSquare, Clock, AlertCircle, ArrowRightLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import styles from './Capabilities.module.css';

export const Capabilities: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section id="capabilities" className={styles.section}>
      <div className={styles.container}>
        <h2 className={clsx("h2", styles.title)}>{t('capabilities.title')}</h2>
        
        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.icon}>
              <LineChart size={24} />
            </div>
            <div className={styles.cardTitle}>{t('capabilities.cap1Title')}</div>
            <div className={styles.cardDesc}>{t('capabilities.cap1Desc')}</div>
          </div>

          <div className={styles.card}>
            <div className={styles.icon}>
              <Calculator size={24} />
            </div>
            <div className={styles.cardTitle}>{t('capabilities.cap2Title')}</div>
            <div className={styles.cardDesc}>{t('capabilities.cap2Desc')}</div>
          </div>

          <div className={styles.card}>
            <div className={styles.icon}>
              <CheckSquare size={24} />
            </div>
            <div className={styles.cardTitle}>{t('capabilities.cap3Title')}</div>
            <div className={styles.cardDesc}>{t('capabilities.cap3Desc')}</div>
          </div>

          <div className={styles.card}>
            <div className={styles.icon}>
              <Clock size={24} />
            </div>
            <div className={styles.cardTitle}>{t('capabilities.cap4Title')}</div>
            <div className={styles.cardDesc}>{t('capabilities.cap4Desc')}</div>
          </div>

          <div className={styles.card}>
            <div className={styles.icon}>
              <AlertCircle size={24} />
            </div>
            <div className={styles.cardTitle}>{t('capabilities.cap5Title')}</div>
            <div className={styles.cardDesc}>{t('capabilities.cap5Desc')}</div>
          </div>

          <div className={styles.card}>
            <div className={styles.icon}>
              <ArrowRightLeft size={24} />
            </div>
            <div className={styles.cardTitle}>{t('capabilities.cap6Title')}</div>
            <div className={styles.cardDesc}>{t('capabilities.cap6Desc')}</div>
          </div>
        </div>
      </div>
    </section>
  );
};
