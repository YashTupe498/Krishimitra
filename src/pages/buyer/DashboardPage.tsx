import React from 'react';
import { useAuth } from '../../app/providers/AuthProvider';
import { Button } from '../../components/ui/Button';

export const BuyerDashboardPage: React.FC = () => {
  const { signOut, profile } = useAuth();
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Buyer Dashboard</h1>
      <p className="mb-4">Welcome, {profile?.full_name} ({profile?.role})</p>
      
      <Button onClick={signOut}>Log Out</Button>
    </div>
  );
};
