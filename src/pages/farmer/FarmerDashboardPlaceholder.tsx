import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';

export const FarmerDashboardPlaceholder: React.FC = () => {
  const { profile, signOut } = useAuth();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg)' }}>
      <header style={{ 
        height: '72px', 
        backgroundColor: 'var(--surface)', 
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-24)'
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 600, color: 'var(--brand-deep)' }}>
          KrishiMitra
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-16)' }}>
          <span style={{ fontWeight: 500 }}>{profile?.full_name}</span>
          <Button variant="secondary" onClick={signOut}>Logout</Button>
        </div>
      </header>
      
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-24)' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 className="h1" style={{ marginBottom: 'var(--space-16)' }}>Farmer Dashboard</h1>
          <p className="body-large" style={{ color: 'var(--text-secondary)' }}>Coming next.</p>
        </div>
      </main>
    </div>
  );
};
