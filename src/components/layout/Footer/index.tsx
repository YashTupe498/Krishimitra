import React from 'react';
import { Link } from 'react-router-dom';
import { KrishiMitraLogo } from '../../ui/KrishiMitraLogo';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <div>
          <KrishiMitraLogo size="sm" variant="full" asLink />
          <p className="body-small" style={{ color: 'var(--text-secondary)', maxWidth: '300px' }}>
            Empowering Indian farmers and buyers with transparent market intelligence and direct transactions.
          </p>
        </div>
        
        <div className={styles.links}>
          <div className={styles.linkGroup}>
            <h4>Product</h4>
            <Link to="/auth/farmer" className={styles.link}>For Farmers & FPOs</Link>
            <Link to="/auth/buyer" className={styles.link}>For Buyers</Link>
            <a href="#how-it-works" className={styles.link}>How it Works</a>
          </div>
          <div className={styles.linkGroup}>
            <h4>Support</h4>
            <a href="#" className={styles.link}>Help Center</a>
            <a href="#" className={styles.link}>Contact Us</a>
            <a href="#" className={styles.link}>Terms of Service</a>
          </div>
        </div>
      </div>
      
      <div className={styles.bottom}>
        <div className={styles.language}>
          <span style={{ color: 'var(--text-secondary)' }}>English</span>
          <span>|</span>
          <span>हिंदी</span>
          <span>|</span>
          <span>मराठी</span>
        </div>
        <p>© {new Date().getFullYear()} KrishiMitra. All rights reserved.</p>
      </div>
    </footer>
  );
};
