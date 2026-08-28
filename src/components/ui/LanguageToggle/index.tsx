import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import styles from './LanguageToggle.module.css';
import { clsx } from 'clsx';

export const LanguageToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className={clsx(styles.container, className)}>
      <Globe size={16} className={styles.icon} />
      <div className={styles.options}>
        <button 
          className={clsx(styles.btn, i18n.language === 'en' && styles.active)} 
          onClick={() => changeLanguage('en')}
        >EN</button>
        <span className={styles.divider}>|</span>
        <button 
          className={clsx(styles.btn, i18n.language === 'hi' && styles.active)}
          onClick={() => changeLanguage('hi')}
        >HI</button>
        <span className={styles.divider}>|</span>
        <button 
          className={clsx(styles.btn, i18n.language === 'mr' && styles.active)}
          onClick={() => changeLanguage('mr')}
        >MR</button>
      </div>
    </div>
  );
};
