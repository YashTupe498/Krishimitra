import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { LanguageToggle } from '../../ui/LanguageToggle';
import styles from './AuthLayout.module.css';

interface AuthLayoutProps {
  children: React.ReactNode;
  role: 'farmer' | 'buyer';
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, role }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.layout}>
      <div className={clsx(styles.contextPanel, role === 'farmer' ? styles.farmerBg : styles.buyerBg)}>
        <div className={styles.contextTop} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" className={styles.logoWhite}>
            KrishiMitra
          </Link>
          <LanguageToggle />
        </div>
        
        <div className={styles.contextBottom}>
          <div className={styles.quoteContainer}>
            <h2 className={styles.quote}>
              {role === 'farmer' ? t('authPages.farmerQuote') : t('authPages.buyerQuote')}
            </h2>
            <div className={styles.author}>
              <div className={styles.authorLine}></div>
              {role === 'farmer' ? t('authPages.farmerAuthor') : t('authPages.buyerAuthor')}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.formPanel}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-64)' }}>
          <Link to="/" className={styles.logo} style={{ marginBottom: 0 }}>
            KrishiMitra
          </Link>
          <div className={styles.mobileLangToggle}>
            <LanguageToggle />
          </div>
        </div>
        <div className={styles.formWrapper}>
          {children}
        </div>
      </div>
    </div>
  );
};
