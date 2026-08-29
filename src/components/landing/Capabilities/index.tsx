import React from 'react';
import { AlertCircle, ArrowRightLeft, Calculator, CheckSquare, Clock, LineChart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { Button } from '../../ui/Button';
import styles from './Capabilities.module.css';

export const Capabilities: React.FC = () => {
  const { t } = useTranslation();
  const compactCapabilities = [
    { icon: Calculator, title: t('capabilities.cap2Title'), description: t('capabilities.cap2Desc') },
    { icon: CheckSquare, title: t('capabilities.cap3Title'), description: t('capabilities.cap3Desc') },
    { icon: Clock, title: t('capabilities.cap4Title'), description: t('capabilities.cap4Desc') },
    { icon: AlertCircle, title: t('capabilities.cap5Title'), description: t('capabilities.cap5Desc') },
    { icon: ArrowRightLeft, title: t('capabilities.cap6Title'), description: t('capabilities.cap6Desc') },
  ];

  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section id="capabilities" className={styles.section}>
      <div className={styles.container}>
        <h2 className={clsx('h2', styles.title)}>{t('capabilities.title')}</h2>

        <article className={styles.featuredCard}>
          <div className={styles.featureContent}>
            <div className={styles.featureIntro}>
              <span className={styles.featureIcon} aria-hidden="true">
                <LineChart size={22} />
              </span>
              <span className={clsx(styles.eyebrow, 'text-mono-label')}>► MARKET INTELLIGENCE</span>
            </div>
            <h3 className={styles.featureTitle}>{t('capabilities.cap1Title')}</h3>
            <p className={styles.featureDescription}>{t('capabilities.cap1Desc')}</p>

            {/* Placeholder callout — swap with a verified market-data metric when available. */}
            <div className={styles.statPill}>
              <strong>REAL-TIME</strong>
              <span className={clsx(styles.statCaption, 'text-mono-label')}>Updated as market data changes</span>
            </div>

            <Button variant="secondary" className={styles.learnMore} onClick={scrollToHowItWorks}>
              LEARN MORE
            </Button>
          </div>

          <div className={styles.featureVisual} aria-hidden="true">
            <div className={styles.visualHeader}>
              <span className={clsx(styles.visualLabel, 'text-mono-label')}>MARKET SIGNAL</span>
              <span className={styles.liveDot} />
            </div>
            <div className={styles.visualChart}>
              <span className={styles.chartGuide} />
              <span className={styles.chartGuide} />
              <span className={styles.chartGuide} />
              <span className={styles.chartLine} />
              <span className={styles.chartPoint} />
              <span className={styles.chartPoint} />
              <span className={styles.chartPoint} />
            </div>
            <div className={styles.visualFooter}>
              <span>PRICE TREND</span>
              <strong>↗</strong>
            </div>
          </div>
        </article>

        <div className={styles.grid}>
          {compactCapabilities.map(({ icon: Icon, title, description }) => (
            <article className={styles.card} key={title}>
              <span className={styles.icon} aria-hidden="true">
                <Icon size={24} />
              </span>
              <h3 className={styles.cardTitle}>{title}</h3>
              <p className={styles.cardDesc}>{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
