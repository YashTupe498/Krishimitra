import React from 'react';
import { clsx } from 'clsx';
import styles from './Badge.module.css';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'recommended';
}

export const Badge: React.FC<BadgeProps> = ({ 
  className, 
  variant = 'info', 
  children, 
  ...props 
}) => {
  return (
    <span 
      className={clsx(styles.badge, styles[variant], className)} 
      {...props}
    >
      {children}
    </span>
  );
};
