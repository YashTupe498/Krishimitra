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
        <Hero />
        <RoleSelection />
        <WhyKrishiMitra />
        <HowItWorks />
        <Capabilities />
        <Trust />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
};
