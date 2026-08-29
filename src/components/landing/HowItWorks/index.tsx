import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import styles from './HowItWorks.module.css';

type Step = {
  title: string;
  description: string;
  x: string;
  y: string;
  delay: string;
};

const vineLeaves = [
  { x: 170, y: 282, angle: -36, delay: '340ms' },
  { x: 250, y: 205, angle: 42, delay: '460ms' },
  { x: 435, y: 184, angle: -34, delay: '690ms' },
  { x: 514, y: 258, angle: 38, delay: '820ms' },
  { x: 696, y: 250, angle: -38, delay: '1040ms' },
  { x: 766, y: 184, angle: 42, delay: '1160ms' },
  { x: 952, y: 188, angle: -36, delay: '1400ms' },
  { x: 1016, y: 270, angle: 40, delay: '1540ms' },
];

export const HowItWorks: React.FC = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.2 });

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const steps: Step[] = [
    { title: t('howItWorks.step1Title'), description: t('howItWorks.step1Desc'), x: '10%', y: '310px', delay: '180ms' },
    { title: t('howItWorks.step2Title'), description: t('howItWorks.step2Desc'), x: '29%', y: '142px', delay: '500ms' },
    { title: t('howItWorks.step3Title'), description: t('howItWorks.step3Desc'), x: '50%', y: '310px', delay: '860ms' },
    { title: t('howItWorks.step4Title'), description: t('howItWorks.step4Desc'), x: '71%', y: '142px', delay: '1210ms' },
    { title: t('howItWorks.step5Title'), description: t('howItWorks.step5Desc'), x: '91%', y: '310px', delay: '1560ms' },
  ];

  return (
    <section id="how-it-works" className={styles.section} ref={sectionRef}>
      <div className={styles.container}>
        <h2 className={clsx('h2', styles.title)}>{t('howItWorks.title')}</h2>

        <div className={clsx(styles.flow, isVisible && styles.isVisible)}>
          <svg className={styles.desktopVine} viewBox="0 0 1200 460" preserveAspectRatio="none" aria-hidden="true">
            <path
              className={styles.vinePath}
              pathLength="1"
              d="M 18 336 C 58 336 76 310 120 310 C 192 310 225 142 348 142 C 468 142 486 310 600 310 C 716 310 740 142 852 142 C 963 142 990 310 1092 310 C 1138 310 1152 286 1182 286"
            />
            <g transform="translate(18 336)">
              <g className={styles.grassTuft}>
                <path d="M0 0 C-8-20 -14-30 -18-38 M0 0 C-2-24 -1-36 2-46 M0 0 C8-20 16-29 22-35 M0 0 C14-12 25-16 34-17" />
              </g>
            </g>
            {vineLeaves.map((leaf) => (
              <g transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.angle})`} key={`${leaf.x}-${leaf.y}`}>
                <path
                  className={styles.vineLeaf}
                  style={{ '--leaf-delay': leaf.delay } as React.CSSProperties}
                  d="M0 0 C12-17 29-13 32 0 C19 10 7 9 0 0 Z"
                />
              </g>
            ))}
          </svg>

          <svg className={styles.mobileVine} viewBox="0 0 2 1000" preserveAspectRatio="none" aria-hidden="true">
            <path className={styles.vinePath} pathLength="1" d="M1 16 V984" />
          </svg>

          {steps.map((step, index) => (
            <article
              className={styles.step}
              key={step.title}
              style={{
                '--step-x': step.x,
                '--step-y': step.y,
                '--step-delay': step.delay,
              } as React.CSSProperties}
            >
              {index === 3 && (
                <div className={styles.annotation} aria-hidden="true">
                  <span className={styles.annotationLabel}>► EXPLAINABLE</span>
                </div>
              )}

              <div className={styles.stepHeader}>
                <span className={clsx(styles.stepLabel, 'text-mono-label')}>
                  STEP {String(index + 1).padStart(2, '0')}
                </span>
                <div className={styles.circle}>
                  <svg className={clsx(styles.budLeaf, styles.budLeafLeft)} viewBox="0 0 32 24" aria-hidden="true">
                    <path d="M30 22 C15 22 4 16 2 2 C15 2 26 8 30 22 Z" />
                  </svg>
                  <svg className={clsx(styles.budLeaf, styles.budLeafRight)} viewBox="0 0 32 24" aria-hidden="true">
                    <path d="M2 22 C17 22 28 16 30 2 C17 2 6 8 2 22 Z" />
                  </svg>
                  <span>{index + 1}</span>
                </div>
              </div>

              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
