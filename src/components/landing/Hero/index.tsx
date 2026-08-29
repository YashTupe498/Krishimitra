import React, { useEffect, useRef } from 'react';
import { ArrowRight, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../ui/Button';
import { NetComparison } from '../NetComparison';
import styles from './Hero.module.css';
import { clsx } from 'clsx';

export const Hero: React.FC = () => {
  const { t } = useTranslation();
  const heroRef = useRef<HTMLElement>(null);
  const comparisonRef = useRef<HTMLDivElement>(null);
  const titleLine1Words = t('hero.titleLine1').trim().split(/\s+/);
  const titleLine2Words = t('hero.titleLine2').trim().split(/\s+/);
  const titleHighlightWords = t('hero.titleHighlight').trim().split(/\s+/);

  useEffect(() => {
    const hero = heroRef.current;
    const comparison = comparisonRef.current;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (!hero || !comparison || reduceMotion.matches) return;

    let frame = 0;
    const updateParallax = () => {
      frame = 0;
      const passedHero = Math.max(0, -hero.getBoundingClientRect().top);
      const offset = Math.min(passedHero * 0.07, 10);
      comparison.style.setProperty('--hero-parallax-y', `${offset}px`);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateParallax);
    };

    updateParallax();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const scrollToRoles = () => {
    document.getElementById('role-selection')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className={styles.hero} ref={heroRef}>
      <div className={styles.container}>
        <div className={styles.content}>
          <span className={clsx(styles.eyebrow, 'text-mono-label')}>{t('hero.eyebrow')}</span>
          <h1 className={clsx("h1-display", styles.title)}>
            <span className={styles.titleLine}>
              {titleLine1Words.map((word, index) => (
                <span className={styles.wordMask} key={`${word}-${index}`}>
                  <span className={styles.word} style={{ '--word-index': index } as React.CSSProperties}>{word}</span>
                </span>
              ))}
            </span>
            <span className={styles.titleLine}>
              {titleLine2Words.map((word, index) => (
                <span className={styles.wordMask} key={`${word}-${index}`}>
                  <span className={styles.word} style={{ '--word-index': index + titleLine1Words.length } as React.CSSProperties}>{word}</span>
                </span>
              ))}
              <span className={styles.highlight}>
                {titleHighlightWords.map((word, index) => (
                  <span className={styles.wordMask} key={`${word}-${index}`}>
                    <span className={styles.word} style={{ '--word-index': index + titleLine1Words.length + titleLine2Words.length } as React.CSSProperties}>{word}</span>
                  </span>
                ))}
              </span>
            </span>
          </h1>
          <p className={clsx("body-large", styles.subtitle)}>
            {t('hero.subtitle')}
          </p>
          <div className={styles.actions}>
            <Button size="large" onClick={scrollToRoles}>{t('hero.chooseRole')}</Button>
            <button className={styles.exploreLink} onClick={scrollToHowItWorks}>
              {t('hero.explore')} <ArrowRight size={16} />
            </button>
          </div>
        </div>
        <div className={styles.imageWrapper} ref={comparisonRef}>
          <div className={styles.visual}>
              <div className={styles.visualHeader}>
                <div>
                  <div style={{ fontWeight: 600 }}>{t('heroCard.crop')}</div>
                  <div className="body-small" style={{ color: 'var(--text-secondary)' }}>5,000 kg • Nashik, MH</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="body-small" style={{ color: 'var(--text-secondary)' }}>{t('heroCard.evaluating')}</div>
                </div>
              </div>
              
              <NetComparison variant="hero" copy={{ marketA: t('heroCard.marketA'), buyerB: t('heroCard.buyerB'), recommended: t('heroCard.recommended'), headline: t('why.headlinePrice'), transportA: t('why.transport80'), transportB: t('why.transport15'), payment: t('why.paymentTime'), paymentA: t('why.days10'), paymentB: t('why.days3'), estimated: t('heroCard.estNet') }} />
              
              <div style={{ marginTop: '24px', display: 'flex', gap: '8px', color: 'var(--text-secondary)', fontSize: '13px', alignItems: 'center' }}>
                <Info size={14} /> {t('heroCard.footerText')}
              </div>
            </div>
          </div>
        </div>
    </section>
  );
};
