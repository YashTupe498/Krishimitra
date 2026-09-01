import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../../ui/Button';
import styles from './FinalCTA.module.css';

export const FinalCTA: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const farmerButtonRef = useRef<HTMLButtonElement>(null);
  const buyerButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const buttons = [farmerButtonRef.current, buyerButtonRef.current].filter(
      (button): button is HTMLButtonElement => button !== null,
    );

    const resetPosition = (button: HTMLButtonElement) => {
      button.style.setProperty('--magnetic-x', '0px');
      button.style.setProperty('--magnetic-y', '0px');
    };

    const listeners = buttons.map((button) => {
      const handleMove = (event: PointerEvent) => {
        const bounds = button.getBoundingClientRect();
        const x = ((event.clientX - (bounds.left + bounds.width / 2)) / (bounds.width / 2)) * 5;
        const y = ((event.clientY - (bounds.top + bounds.height / 2)) / (bounds.height / 2)) * 4;
        button.style.setProperty('--magnetic-x', `${Math.max(-5, Math.min(5, x)).toFixed(2)}px`);
        button.style.setProperty('--magnetic-y', `${Math.max(-4, Math.min(4, y)).toFixed(2)}px`);
      };
      const handleLeave = () => resetPosition(button);

      button.addEventListener('pointermove', handleMove);
      button.addEventListener('pointerleave', handleLeave);

      return () => {
        button.removeEventListener('pointermove', handleMove);
        button.removeEventListener('pointerleave', handleLeave);
        resetPosition(button);
      };
    });

    return () => listeners.forEach((removeListener) => removeListener());
  }, []);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>{t('cta.title', 'How do you want to use KrishiMitra?')}</h2>
        <p className={styles.subtitle}>{t('cta.subtitle', 'Choose your role to get started.')}</p>
        
        <div className={styles.actions}>
          <Button 
            size="large" 
            variant="primary" 
            className={styles.farmerBtn}
            ref={farmerButtonRef}
            onClick={() => navigate('/auth/farmer')}
          >
            {t('cta.farmerBtn')}
          </Button>
          <Button 
            size="large" 
            variant="secondary" 
            className={styles.buyerBtn}
            ref={buyerButtonRef}
            onClick={() => navigate('/auth/buyer')}
          >
            {t('cta.buyerBtn')}
          </Button>
        </div>
      </div>
    </section>
  );
};
