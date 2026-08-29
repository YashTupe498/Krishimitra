import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { ROUTES } from '../../constants/routes';
import type { UserRole } from '../../types/auth';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { session, profile, isLoading } = useAuth();

  if (isLoading) {
    return null; // AuthProvider handles splash, but just in case
  }

  // If not authenticated, redirect to login
  if (!session) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Wait for profile to load if authenticated
  if (!profile) {
    return null; 
  }

  // If roles are specified, check if user has required role
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(profile.role)) {
      // Redirect to their own dashboard
      if (profile.role === 'FARMER') {
        return <Navigate to={ROUTES.FARMER_DASHBOARD} replace />;
      } else if (profile.role === 'BUYER') {
        return <Navigate to={ROUTES.BUYER_DASHBOARD} replace />;
      }
      return <Navigate to={ROUTES.HOME} replace />;
    }
  }

  return <Outlet />;
};
