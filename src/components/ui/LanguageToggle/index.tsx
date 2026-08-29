import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Globe } from 'lucide-react';
import styles from './LanguageToggle.module.css';
import { clsx } from 'clsx';

export const LanguageToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const language = i18n.language.split('-')[0];

  const languages = [
    { code: 'en', shortLabel: 'EN', label: 'English' },
    { code: 'hi', shortLabel: 'HI', label: 'हिंदी' },
    { code: 'mr', shortLabel: 'MR', label: 'मराठी' },
  ];

  useEffect(() => {
    const closeMenu = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', closeMenu);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeMenu);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={clsx(styles.container, className)}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <Globe size={16} className={styles.icon} />
        {languages.find((item) => item.code === language)?.shortLabel ?? 'EN'}
      </button>
      <div className={clsx(styles.menu, isOpen && styles.menuOpen)} role="menu">
        {languages.map((item) => (
          <button
            key={item.code}
            type="button"
            className={clsx(styles.option, language === item.code && styles.active)}
            onClick={() => changeLanguage(item.code)}
            role="menuitemradio"
            aria-checked={language === item.code}
          >
            <span>{item.label}</span>
            {language === item.code && <Check size={16} aria-hidden="true" />}
          </button>
        ))}
      </div>
    </div>
  );
};
