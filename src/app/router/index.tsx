import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LandingPage } from '../../pages/public/LandingPage';
import { FarmerAuthPage } from '../../pages/public/FarmerAuthPage';
import { BuyerAuthPage } from '../../pages/public/BuyerAuthPage';
import { ProtectedRoute } from '../../components/layout/ProtectedRoute';
import { FarmerDashboardPlaceholder } from '../../pages/farmer/FarmerDashboardPlaceholder';
import { BuyerDashboardPlaceholder } from '../../pages/buyer/BuyerDashboardPlaceholder';

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth/farmer" element={<FarmerAuthPage />} />
      <Route path="/auth/buyer" element={<BuyerAuthPage />} />
      
      <Route element={<ProtectedRoute allowedRoles={['FARMER']} />}>
        <Route path="/farmer/dashboard" element={<FarmerDashboardPlaceholder />} />
      </Route>
      
      <Route element={<ProtectedRoute allowedRoles={['BUYER']} />}>
        <Route path="/buyer/dashboard" element={<BuyerDashboardPlaceholder />} />
      </Route>
    </Routes>
  );
};
