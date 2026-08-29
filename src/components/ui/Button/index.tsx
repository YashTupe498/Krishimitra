import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { Loader2 } from 'lucide-react';
import styles from './Button.module.css';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'default' | 'large';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', isLoading, icon, iconPosition = 'left', children, ...props }, ref) => {
    return (
      <button
        className={cn(styles.button, styles[variant], styles[`size-${size}`], className)}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="animate-spin mr-2" size={18} style={{ marginRight: '8px' }} />}
        {!isLoading && icon && iconPosition === 'left' && <span className={styles['icon-left']}>{icon}</span>}
        <span style={{ opacity: isLoading ? 0 : 1, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>{children}</span>
        {!isLoading && icon && iconPosition === 'right' && <span className={styles['icon-right']}>{icon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
