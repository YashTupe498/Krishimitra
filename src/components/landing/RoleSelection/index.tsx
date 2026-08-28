import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, Briefcase, CheckCircle2, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { clsx } from 'clsx';
import styles from './RoleSelection.module.css';

export const RoleSelection: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section id="role-selection" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <Card 
            interactive 
            className={styles.roleCard}
            onClick={() => navigate('/auth/farmer')}
          >
            <div className={clsx(styles.iconWrapper, styles.farmerIcon)}>
              <Sprout size={32} />
            </div>
            <h2 className={clsx("h2", styles.title)}>{t('roleSelection.farmerTitle')}</h2>
            <ul className={styles.featureList}>
              <li className={styles.featureItem}>
                <CheckCircle2 size={20} className={styles.checkIcon} />
                <span>{t('roleSelection.farmerPoint1')}</span>
              </li>
              <li className={styles.featureItem}>
                <CheckCircle2 size={20} className={styles.checkIcon} />
                <span>{t('roleSelection.farmerPoint2')}</span>
              </li>
              <li className={styles.featureItem}>
                <CheckCircle2 size={20} className={styles.checkIcon} />
                <span>{t('roleSelection.farmerPoint3')}</span>
              </li>
              <li className={styles.featureItem}>
                <CheckCircle2 size={20} className={styles.checkIcon} />
                <span>{t('roleSelection.farmerPoint4')}</span>
              </li>
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
            className={styles.roleCard}
          >
            <div className={clsx(styles.iconWrapper, styles.buyerIcon)}>
              <Briefcase size={32} />
            </div>
            <h2 className={clsx("h2", styles.title)}>{t('roleSelection.buyerTitle')}</h2>
            <ul className={styles.featureList}>
              <li className={styles.featureItem}>
                <CheckCircle2 size={20} className={styles.checkIcon} />
                <span>{t('roleSelection.buyerPoint1')}</span>
              </li>
              <li className={styles.featureItem}>
                <CheckCircle2 size={20} className={styles.checkIcon} />
                <span>{t('roleSelection.buyerPoint2')}</span>
              </li>
              <li className={styles.featureItem}>
                <CheckCircle2 size={20} className={styles.checkIcon} />
                <span>{t('roleSelection.buyerPoint3')}</span>
              </li>
              <li className={styles.featureItem}>
                <CheckCircle2 size={20} className={styles.checkIcon} />
                <span>{t('roleSelection.buyerPoint4')}</span>
              </li>
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
