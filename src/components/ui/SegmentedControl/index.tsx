import React from 'react';
import { clsx } from 'clsx';
import styles from './SegmentedControl.module.css';

interface Option {
  label: string;
  value: string;
}

interface SegmentedControlProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({ options, value, onChange, className }) => {
  return (
    <div className={clsx(styles.container, className)} role="radiogroup">
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <div
            key={option.value}
            role="radio"
            aria-checked={isActive}
            tabIndex={isActive ? 0 : -1}
            data-state={isActive ? 'active' : 'inactive'}
            className={styles.option}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onChange(option.value);
              }
            }}
          >
            {option.label}
          </div>
        );
      })}
    </div>
  );
};
