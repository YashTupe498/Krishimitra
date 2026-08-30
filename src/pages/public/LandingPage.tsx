import React from 'react';
import { Nav } from '../../components/layout/Nav';
import { Footer } from '../../components/layout/Footer';
import { Hero } from '../../components/landing/Hero';
import { RoleSelection } from '../../components/landing/RoleSelection';
import { WhyKrishiMitra } from '../../components/landing/WhyKrishiMitra';
import { HowItWorks } from '../../components/landing/HowItWorks';
import { Capabilities } from '../../components/landing/Capabilities';
import { Trust } from '../../components/landing/Trust';
import { FinalCTA } from '../../components/landing/FinalCTA';

export const LandingPage: React.FC = () => {
  return (
    <>
      <Nav />
      <main>
        <div className="landing-section-transition"><Hero /></div>
        <div className="landing-section-transition"><RoleSelection /></div>
        <div className="landing-section-transition"><WhyKrishiMitra /></div>
        <div className="landing-section-transition"><HowItWorks /></div>
        <div className="landing-section-transition"><Capabilities /></div>
        <div className="landing-section-transition"><Trust /></div>
        <div className="landing-section-transition landing-section-transition--dark"><FinalCTA /></div>
      </main>
      <Footer />
    </>
  );
};
