import React from 'react';
import { clsx } from 'clsx';
import styles from '../Input/Input.module.css';

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const Select: React.FC<SelectProps> = ({ 
  label, 
  options, 
  value, 
  onChange, 
  error, 
  className,
  ...props 
}) => {
  return (
    <div className={styles.container}>
      <label className={styles.label}>{label}</label>
      <div className={styles.inputWrapper}>
        <select
          className={clsx(styles.input, error && styles.inputError, className)}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          {...props}
        >
          <option value="" disabled>Select...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};
