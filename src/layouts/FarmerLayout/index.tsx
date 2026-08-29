import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Package, 
  TrendingUp, 
  Lightbulb, 
  Handshake, 
  Receipt, 
  MessageSquareWarning,
  Globe2,
  Mic,
  UserCircle,
  LogOut,
  Check
} from 'lucide-react';
import { useAuth } from '../../app/providers/AuthProvider';
import styles from './FarmerLayout.module.css';

export const FarmerLayout: React.FC = () => {
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  // Load saved language on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('preferred_language');
    if (savedLang && (savedLang === 'en' || savedLang === 'hi' || savedLang === 'mr')) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('preferred_language', lang);
    setShowLanguageMenu(false);
  };

  const primaryNav = [
    { name: t('farmerNav.dashboard', 'Dashboard'), icon: LayoutDashboard, path: '/farmer/dashboard' },
    { name: t('farmerNav.myLots', 'My Lots'), icon: Package, path: '/farmer/lots' },
    { name: t('farmerNav.marketIntelligence', 'Market Intelligence'), icon: TrendingUp, path: '/farmer/market' },
    { name: t('farmerNav.myDecisions', 'My Decisions'), icon: Lightbulb, path: '/farmer/decisions' },
    { name: t('farmerNav.offers', 'Offers'), icon: Handshake, path: '/farmer/offers' },
    { name: t('farmerNav.transactions', 'Transactions'), icon: Receipt, path: '/farmer/transactions' },
    { name: t('farmerNav.issues', 'Issues & Grievances'), icon: MessageSquareWarning, path: '/farmer/issues' },
  ];

  const mobileNav = [
    { name: t('farmerNav.dashboard', 'Home'), icon: LayoutDashboard, path: '/farmer/dashboard' },
    { name: t('farmerNav.myLots', 'Lots'), icon: Package, path: '/farmer/lots' },
    { name: t('farmerNav.myDecisions', 'Decisions'), icon: Lightbulb, path: '/farmer/decisions' },
    { name: t('farmerNav.offers', 'Offers'), icon: Handshake, path: '/farmer/offers' },
    { name: t('farmerNav.profile', 'Profile'), icon: UserCircle, path: '/farmer/profile' },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/auth/farmer');
  };

  return (
    <div className={clsx(styles.layout, "farmer-theme")}>
      {/* Desktop Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <img src="/logo.jpg" alt="KrishiMitra Logo" className={styles.logoImage} />
        </div>
        
        <div className={styles.navGroup}>{t('farmerNav.menu', 'Menu')}</div>
        <nav className={styles.primaryNav}>
          {primaryNav.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={clsx(styles.navItem, isActive && styles.active)}
              >
                <Icon size={20} className={styles.navIcon} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className={styles.secondaryNav}>
          <div className={styles.navGroup} style={{ paddingTop: 0 }}>{t('farmerNav.preferences', 'Preferences')}</div>
          
          <div className="relative">
            <button 
              className={styles.navItem} 
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            >
              <Globe2 size={20} className={styles.navIcon} />
              <span>{t('farmerNav.language', 'Language')}</span>
            </button>
            
            {showLanguageMenu && (
              <div className="absolute bottom-full left-4 mb-2 bg-white rounded-lg shadow-lg border border-gray-100 py-2 w-48 z-50">
                <button onClick={() => changeLanguage('en')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between">
                  English {i18n.language === 'en' && <Check size={16} className="text-brand-primary" />}
                </button>
                <button onClick={() => changeLanguage('hi')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between">
                  हिंदी {i18n.language === 'hi' && <Check size={16} className="text-brand-primary" />}
                </button>
                <button onClick={() => changeLanguage('mr')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between">
                  मराठी {i18n.language === 'mr' && <Check size={16} className="text-brand-primary" />}
                </button>
              </div>
            )}
          </div>

          <button className={styles.navItem} onClick={() => {}}>
            <Mic size={20} className={styles.navIcon} />
            <span>{t('farmerNav.voiceAssistant', 'Voice Assistant')}</span>
          </button>
          
          <NavLink 
            to="/farmer/profile" 
            className={clsx(styles.navItem, location.pathname === '/farmer/profile' && styles.active)}
          >
            <UserCircle size={20} className={styles.navIcon} />
            <span>{t('farmerNav.profile', 'Profile')}</span>
          </NavLink>
          
          <button className={clsx(styles.navItem, styles.logout)} onClick={handleLogout}>
            <LogOut size={20} className={styles.navIcon} />
            <span>{t('farmerNav.logout', 'Logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={styles.main}>
        <div className={styles.contentContainer}>
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className={styles.bottomNav}>
        {mobileNav.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={clsx(styles.bottomNavItem, isActive && styles.active)}
            >
              <Icon size={24} className={styles.bottomNavIcon} />
              <span className={styles.bottomNavText}>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
