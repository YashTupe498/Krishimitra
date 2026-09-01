import React from 'react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { LanguageToggle } from '../../ui/LanguageToggle';
import { KrishiMitraLogo } from '../../ui/KrishiMitraLogo';
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
        <div className={styles.contextTop}>
          <div className={styles.logoWhite}>
            <KrishiMitraLogo size="lg" variant="full" theme="dark" asLink />
          </div>
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
        <div className={styles.formTop}>
          <div className={styles.logo}>
            <KrishiMitraLogo size="lg" variant="full" asLink />
          </div>
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
