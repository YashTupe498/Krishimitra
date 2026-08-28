import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../../ui/Button';
import { clsx } from 'clsx';
import styles from './FinalCTA.module.css';

export const FinalCTA: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={clsx("h2", styles.title)}>{t('cta.title')}</h2>
        
        <div className={styles.actions}>
          <Button 
            size="large" 
            variant="primary" 
            className={styles.farmerBtn}
            onClick={() => navigate('/auth/farmer')}
          >
            {t('cta.farmerBtn')}
          </Button>
          <Button 
            size="large" 
            variant="secondary" 
            className={styles.buyerBtn}
            onClick={() => navigate('/auth/buyer')}
          >
            {t('cta.buyerBtn')}
          </Button>
        </div>
      </div>
    </section>
  );
};
