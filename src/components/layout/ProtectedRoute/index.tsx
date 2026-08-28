import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import type { UserRole } from '../../../types/user';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { session, profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg)' }}>
        <Loader2 className="animate-spin" size={48} color="var(--brand-primary)" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth/farmer" replace />;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to={`/${profile.role.toLowerCase()}/dashboard`} replace />;
  }

  return <Outlet />;
};
