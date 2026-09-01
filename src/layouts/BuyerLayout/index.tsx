import React from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  ClipboardList, Globe2, Handshake, LayoutDashboard, LogOut,
  Mic, PackageSearch, Receipt, TrendingUp, UserCircle,
} from 'lucide-react';
import { useAuth } from '../../app/providers/AuthProvider';
import { KrishiMitraLogo } from '../../components/ui/KrishiMitraLogo';
import { SidebarNavItem } from '../../components/layout/SidebarNavItem';
import styles from '../FarmerLayout/FarmerLayout.module.css';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/buyer/dashboard' },
  { name: 'My Requirements', icon: ClipboardList, path: '/buyer/requirements' },
  { name: 'Matching Lots', icon: PackageSearch, path: '/buyer/matching-lots' },
  { name: 'Supply Intelligence', icon: TrendingUp, path: '/buyer/supply-intelligence' },
  { name: 'Offers', icon: Handshake, path: '/buyer/offers' },
  { name: 'Transactions', icon: Receipt, path: '/buyer/transactions' },
];

export const BuyerLayout: React.FC = () => {
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const handleLogout = async () => { await signOut(); navigate('/auth/buyer'); };

  return (
    <div className={clsx(styles.layout, 'farmer-theme')}>
      <aside className={clsx(styles.sidebar, styles.farmerSidebar)}>
        <div className={styles.logo}>
          <KrishiMitraLogo size="md" variant="compact" asLink />
        </div>
        
        <div className={styles.navigationArea}>
          <div className={styles.navGroup}>Menu</div>
          <nav className={styles.primaryNav}>
            {menuItems.map(({ name, icon, path }) => (
              <SidebarNavItem
                key={path}
                to={path}
                isActive={location.pathname === path || location.pathname.startsWith(`${path}/`)}
                icon={icon}
                label={name}
              />
            ))}
          </nav>
          
          <div className={styles.secondaryNav}>
            <div className={styles.navGroup} style={{ paddingTop: 0 }}>Preferences</div>
            <SidebarNavItem icon={Globe2} label="Language" />
            <SidebarNavItem icon={Mic} label="Voice Assistant" />
            <SidebarNavItem
              to="/buyer/profile"
              isActive={location.pathname === '/buyer/profile'}
              icon={UserCircle}
              label="Profile"
            />
          </div>
        </div>

        <div className={styles.sidebarFooter}>
          <SidebarNavItem
            icon={LogOut}
            label="Logout"
            onClick={handleLogout}
            variant="logout"
          />
        </div>
      </aside>
      <main className={styles.main}><div className={styles.contentContainer}><Outlet /></div></main>
      <nav className={styles.bottomNav}>
        {menuItems.slice(0, 5).map(({ name, icon: Icon, path }) => (
          <NavLink key={path} to={path} className={clsx(styles.bottomNavItem, location.pathname === path && styles.active)}>
            <Icon size={24} className={styles.bottomNavIcon} /><span className={styles.bottomNavText}>{name === 'My Requirements' ? 'Needs' : name === 'Matching Lots' ? 'Lots' : name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
