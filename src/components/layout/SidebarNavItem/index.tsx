import React from 'react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import styles from './SidebarNavItem.module.css';

export interface SidebarNavItemProps {
  icon: React.ElementType;
  label: string;
  to?: string;
  onClick?: () => void;
  isActive?: boolean;
  variant?: 'default' | 'logout';
  className?: string;
}

export const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  icon: Icon,
  label,
  to,
  onClick,
  isActive = false,
  variant = 'default',
  className
}) => {
  const content = (
    <>
      <div className={styles.iconContainer}>
        <div className={styles.iconDiamond}></div>
        <Icon size={20} className={styles.icon} />
      </div>
      <span className={styles.label}>{label}</span>
    </>
  );

  const classNameStr = (active: boolean) => clsx(
    styles.navItem,
    variant === 'logout' && styles.logout,
    active && styles.active,
    className
  );

  if (to) {
    return (
      <NavLink
        to={to}
        className={({ isActive: routerActive }) => classNameStr(isActive || routerActive)}
        onClick={onClick}
      >
        {content}
      </NavLink>
    );
  }

  return (
    <button className={classNameStr(isActive)} onClick={onClick}>
      {content}
    </button>
  );
};
