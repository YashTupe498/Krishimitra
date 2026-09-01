import React from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  ClipboardList, Globe2, Handshake, LayoutDashboard, LogOut,
  Mic, PackageSearch, Receipt, TrendingUp, UserCircle,
} from 'lucide-react';
import { useAuth } from '../../app/providers/AuthProvider';
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
        <div className={styles.logo}><img src="/logo.jpg" alt="KrishiMitra Logo" className={styles.logoImage} /></div>
        
        <div className={styles.navigationArea}>
          <div className={styles.navGroup}>Menu</div>
          <nav className={styles.primaryNav}>
            {menuItems.map(({ name, icon: Icon, path }) => (
              <NavLink key={path} to={path} className={clsx(styles.navItem, location.pathname === path && styles.active)}>
                <Icon size={20} className={styles.navIcon} /><span>{name}</span>
              </NavLink>
            ))}
          </nav>
          
          <div className={styles.secondaryNav}>
            <div className={styles.navGroup} style={{ paddingTop: 0 }}>Preferences</div>
            <button className={styles.navItem}><Globe2 size={20} className={styles.navIcon} /><span>Language</span></button>
            <button className={styles.navItem}><Mic size={20} className={styles.navIcon} /><span>Voice Assistant</span></button>
            <NavLink to="/buyer/profile" className={clsx(styles.navItem, location.pathname === '/buyer/profile' && styles.active)}>
              <UserCircle size={20} className={styles.navIcon} /><span>Profile</span>
            </NavLink>
          </div>
        </div>

        <div className={styles.sidebarFooter}>
          <button className={clsx(styles.navItem, styles.logout)} onClick={handleLogout}>
            <LogOut size={20} className={styles.navIcon} /><span>Logout</span>
          </button>
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
