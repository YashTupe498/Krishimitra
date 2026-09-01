import React from 'react';
import { clsx } from 'clsx';
import styles from './KrishiMitraLogo.module.css';

interface KrishiMitraLogoProps {
  variant?: 'full' | 'compact' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'light' | 'dark';
  className?: string;
  asLink?: boolean;
}

export const KrishiMitraLogo: React.FC<KrishiMitraLogoProps> = ({
  variant = 'full',
  size = 'md',
  theme = 'light',
  className,
  asLink = false
}) => {
  const containerClasses = clsx(
    styles.container,
    styles[`size-${size}`],
    className
  );

  const iconElement = (
    <img 
      src="/branding/krishimitra-icon.png" 
      alt="KrishiMitra" 
      className={styles.icon} 
    />
  );

  const textColor = theme === 'dark' ? '#FFFFFF' : '#14532D';
  const taglineColor = theme === 'dark' ? 'rgba(255,255,255,0.9)' : '#166534';

  const textElement = (
    <div className={styles.textGroup}>
      {/* Crisp SVG typography for the wordmark */}
      <div className={styles.wordmark}>
        <svg viewBox="0 0 160 28" height={size === 'sm' ? 18 : size === 'lg' || size === 'xl' ? 32 : 24} fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="0" y="22" fontFamily="var(--font-display), sans-serif" fontWeight="900" fontSize="24" fill={textColor} letterSpacing="-0.5">KrishiMitra</text>
          <text x="138" y="12" fontFamily="sans-serif" fontWeight="700" fontSize="8" fill={textColor}>™</text>
        </svg>
      </div>
      
      {/* Tagline only visible in full variant */}
      {variant === 'full' && (
        <div className={styles.tagline}>
          <svg viewBox="0 0 160 12" height={size === 'sm' ? 8 : size === 'lg' || size === 'xl' ? 12 : 10} fill="none" xmlns="http://www.w3.org/2000/svg">
            <text x="2" y="10" fontFamily="sans-serif" fontWeight="600" fontSize="10" fill={taglineColor} letterSpacing="0.2">AI Saathi, Kisan Ki Tarakki</text>
          </svg>
        </div>
      )}
    </div>
  );

  const content = (
    <>
      {iconElement}
      {variant !== 'icon' && textElement}
    </>
  );

  if (asLink) {
    return (
      <a href="/" className={containerClasses} aria-label="KrishiMitra Home">
        {content}
      </a>
    );
  }

  return (
    <div className={containerClasses} aria-label="KrishiMitra">
      {content}
    </div>
  );
};
