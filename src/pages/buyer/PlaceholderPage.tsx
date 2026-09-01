import React from 'react';

export const BuyerPlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="p-8"><h1 className="h2 text-[#14532D]">{title}</h1><p className="body-base" style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-12)' }}>Coming soon.</p></div>
);
