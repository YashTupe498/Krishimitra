import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { Button } from '../../ui/Button';
import { LanguageToggle } from '../../ui/LanguageToggle';
import { useAuth } from '../../../app/providers/AuthProvider';
import styles from './Nav.module.css';

export const Nav: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const { session, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => {
    document.getElementById('role-selection')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className={clsx(styles.nav, scrolled && styles.scrolled)}>
      <Link to="/" className={styles.logo}>
        <img src="/logo.jpg" alt="KrishiMitra Logo" style={{ height: '32px', borderRadius: '50%' }} />
        <span>KrishiMitra</span>
      </Link>

      <div className={styles.links}>
        <a href="#how-it-works" className={styles.link}>{t('nav.howItWorks')}</a>
        <a href="#capabilities" className={styles.link}>{t('nav.capabilities')}</a>
      </div>

      <div className={styles.actions}>
        <LanguageToggle className={styles.navLangToggle} />
        
        {session ? (
          <>
            <Button variant="ghost" onClick={() => {
              const dashRoute = (profile?.role === 'FARMER') 
                ? '/farmer/dashboard' 
                : '/buyer/dashboard';
              navigate(dashRoute);
            }}>
              {t('nav.dashboard')}
            </Button>
            <Button variant="secondary" onClick={signOut}>{t('nav.logout')}</Button>
          </>
        ) : (
          <>
            <Button variant="secondary" className={styles.loginButton} onClick={() => navigate('/auth/farmer')}>{t('nav.login')}</Button>
            <Button variant="primary" onClick={handleGetStarted}>{t('nav.getStarted')}</Button>
          </>
        )}
      </div>
    </nav>
  );
};
