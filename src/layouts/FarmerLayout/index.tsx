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
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { KrishiMitraLogo } from '../../components/ui/KrishiMitraLogo';
import { VoiceAssistantOverlay } from '../../components/farmer/voice/VoiceAssistantOverlay';
import { SidebarNavItem } from '../../components/layout/SidebarNavItem';
import styles from './FarmerLayout.module.css';

export const FarmerLayout: React.FC = () => {
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  
  // Voice Assistant Hook
  const voice = useVoiceAssistant();

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

  const isRouteActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <div className={clsx(styles.layout, "farmer-theme")}>
      {/* Desktop Sidebar */}
      <aside className={clsx(styles.sidebar, styles.farmerSidebar)}>
        <div className={styles.logo}>
          <KrishiMitraLogo size="md" variant="compact" asLink />
        </div>
        
        <div className={styles.navigationArea}>
          <div className={styles.navGroup}>{t('farmerNav.menu', 'Menu')}</div>
          <nav className={styles.primaryNav}>
            {primaryNav.map((item) => {
              const isActive = isRouteActive(item.path);
              return (
                <SidebarNavItem
                  key={item.path}
                  to={item.path}
                  isActive={isActive}
                  icon={item.icon}
                  label={item.name}
                />
              );
            })}
          </nav>

          <div className={styles.secondaryNav}>
            <div className={styles.navGroup} style={{ paddingTop: 0 }}>{t('farmerNav.preferences', 'Preferences')}</div>
            <div className="relative">
              <SidebarNavItem
                icon={Globe2}
                label={t('farmerNav.language', 'Language')}
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                isActive={showLanguageMenu}
              />
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

            <SidebarNavItem
              icon={Mic}
              label={t('farmerNav.voiceAssistant', 'Voice Assistant')}
              onClick={() => voice.startListening()}
            />
            
            <SidebarNavItem
              to="/farmer/profile"
              isActive={isRouteActive('/farmer/profile')}
              icon={UserCircle}
              label={t('farmerNav.profile', 'Profile')}
            />
          </div>
        </div>

        <div className={styles.sidebarFooter}>
          <SidebarNavItem
            icon={LogOut}
            label={t('farmerNav.logout', 'Logout')}
            onClick={handleLogout}
            variant="logout"
          />
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

      {/* Voice Assistant Global Overlay */}
      <div aria-live="polite">
        <VoiceAssistantOverlay 
          state={voice.state}
          transcript={voice.transcript}
          intentResult={voice.intentResult}
          isSupported={voice.isSupported}
          onClose={() => voice.stopListening()}
          onConfirmNavigation={(route) => {
            navigate(route);
            voice.setState('IDLE');
          }}
        />
      </div>
    </div>
  );
};
