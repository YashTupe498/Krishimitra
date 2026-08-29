import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, Briefcase, Check, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { clsx } from 'clsx';
import styles from './RoleSelection.module.css';

export const RoleSelection: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.18 });

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const farmerPoints = [
    t('roleSelection.farmerPoint1'),
    t('roleSelection.farmerPoint2'),
    t('roleSelection.farmerPoint3'),
    t('roleSelection.farmerPoint4'),
  ];
  const buyerPoints = [
    t('roleSelection.buyerPoint1'),
    t('roleSelection.buyerPoint2'),
    t('roleSelection.buyerPoint3'),
    t('roleSelection.buyerPoint4'),
  ];

  const renderFeatures = (features: string[]) => features.map((feature) => (
    <li className={styles.featureItem} key={feature}>
      <span className={styles.checkIcon}><Check size={12} strokeWidth={3} /></span>
      <span>{feature}</span>
    </li>
  ));

  return (
    <section id="role-selection" className={styles.section} ref={sectionRef}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <Card 
            interactive 
            className={clsx(styles.roleCard, styles.farmerCard, isVisible && styles.isVisible)}
            onClick={() => navigate('/auth/farmer')}
          >
            <div className={clsx(styles.visualHeader, styles.farmerVisual)}>
              {/* TODO: Replace this source with curated farmer campaign photography when available. */}
              <img className={styles.visualImage} src="/images/farmer-inspecting.jpg" alt="" />
              <span className={styles.visualIcon}><Sprout size={28} aria-hidden="true" /></span>
            </div>
            <h2 className={clsx("h2", styles.title)}>{t('roleSelection.farmerTitle')}</h2>
            <ul className={styles.featureList}>
              {renderFeatures(farmerPoints)}
            </ul>
            <Button 
              size="large"
              variant="primary" 
              className={styles.premiumButtonFarmer}
              onClick={() => navigate('/auth/farmer')}
            >
              {t('roleSelection.farmerCTA')} <ArrowRight size={18} />
            </Button>
          </Card>

          <Card 
            interactive 
            className={clsx(styles.roleCard, styles.buyerCard, isVisible && styles.isVisible)}
          >
            <div className={clsx(styles.visualHeader, styles.buyerVisual)}>
              {/* TODO: Replace this source with curated mandi campaign photography when available. */}
              <img className={styles.visualImage} src="/images/mandi-market.png" alt="" />
              <span className={styles.visualIcon}><Briefcase size={26} aria-hidden="true" /></span>
            </div>
            <h2 className={clsx("h2", styles.title)}>{t('roleSelection.buyerTitle')}</h2>
            <ul className={styles.featureList}>
              {renderFeatures(buyerPoints)}
            </ul>
            <Button 
              size="large"
              variant="primary"
              className={styles.premiumButtonBuyer}
              onClick={() => navigate('/auth/buyer')}
            >
              {t('roleSelection.buyerCTA')} <ArrowRight size={18} />
            </Button>
          </Card>
        </div>
      </div>
    </section>
  );
};
