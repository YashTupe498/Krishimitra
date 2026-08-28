import React from 'react';
import { clsx } from 'clsx';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import styles from './FormMessage.module.css';

interface FormMessageProps {
  type: 'success' | 'error';
  message: string;
  className?: string;
}

export const FormMessage: React.FC<FormMessageProps> = ({ type, message, className }) => {
  if (!message) return null;

  return (
    <div className={clsx(styles.message, styles[type], className)} role="alert">
      {type === 'success' ? (
        <CheckCircle2 className={styles.icon} size={18} />
      ) : (
        <AlertCircle className={styles.icon} size={18} />
      )}
      <span>{message}</span>
    </div>
  );
};
