import React from 'react';
import { clsx } from 'clsx';
import styles from './Card.module.css';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  recommended?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive, recommended, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          styles.card,
          interactive && styles.interactive,
          recommended && styles.recommended,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
