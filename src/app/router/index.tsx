import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LandingPage } from '../../pages/public/LandingPage';
import { FarmerAuthPage } from '../../pages/public/FarmerAuthPage';
import { BuyerAuthPage } from '../../pages/public/BuyerAuthPage';
import { ProtectedRoute } from './ProtectedRoute';
import { FarmerLayout } from '../../layouts/FarmerLayout';
import { FarmerDashboardPage } from '../../pages/farmer/DashboardPage';
import { DecisionDetailPage } from '../../pages/farmer/DecisionDetailPage';
import { LotDetailsPage } from '../../pages/farmer/LotDetailsPage';
import { LotsIndexPage } from '../../pages/farmer/LotsIndexPage';
import { CreateLotPage } from '../../pages/farmer/CreateLotPage';
import { QualityAssessmentPage } from '../../pages/farmer/QualityAssessmentPage';
import { BuyerDashboardPage } from '../../pages/buyer/DashboardPage';
import { MarketIntelligencePage } from '../../pages/farmer/MarketIntelligencePage';
import { OpportunitiesPage } from '../../pages/farmer/OpportunitiesPage';
import { OpportunityDetailsPage } from '../../pages/farmer/OpportunityDetailsPage';
import { ROUTES } from '../../constants/routes';

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<LandingPage />} />
      <Route path={ROUTES.LOGIN} element={<FarmerAuthPage />} /> {/* Fallback to farmer auth for general login */}
      <Route path="/auth/farmer" element={<FarmerAuthPage />} />
      <Route path="/auth/buyer" element={<BuyerAuthPage />} />
      <Route path={ROUTES.SIGNUP} element={<FarmerAuthPage />} /> {/* Fallback */}
      
      <Route element={<ProtectedRoute allowedRoles={['FARMER']} />}>
        <Route element={<FarmerLayout />}>
          <Route path={ROUTES.FARMER_DASHBOARD} element={<FarmerDashboardPage />} />
          <Route path="/farmer/decisions/:id" element={<DecisionDetailPage />} />
          <Route path="/farmer/lots" element={<LotsIndexPage />} />
          <Route path="/farmer/lots/new" element={<CreateLotPage mode="create" />} />
          <Route path="/farmer/lots/:id/edit" element={<CreateLotPage mode="edit" />} />
          <Route path="/farmer/lots/:id" element={<LotDetailsPage />} />
          <Route path="/farmer/lots/:id/quality" element={<QualityAssessmentPage />} />
          
          {/* Global Market Intelligence Route */}
          <Route path="/farmer/market" element={<MarketIntelligencePage />} />
          
          {/* Opportunity Routes */}
          <Route path="/farmer/offers/opportunities" element={<OpportunitiesPage />} />
          <Route path="/farmer/offers/opportunities/:id" element={<OpportunityDetailsPage />} />
          
          {/* Placeholders for other farmer routes */}
          <Route path="/farmer/decisions" element={<div className="p-8">Decisions (Coming Soon)</div>} />
          <Route path="/farmer/offers" element={<div className="p-8">Offers (Coming Soon)</div>} />
          <Route path="/farmer/transactions" element={<div className="p-8">Transactions (Coming Soon)</div>} />
          <Route path="/farmer/issues" element={<div className="p-8">Issues (Coming Soon)</div>} />
          <Route path="/farmer/profile" element={<div className="p-8">Profile (Coming Soon)</div>} />
        </Route>
      </Route>
      
      <Route element={<ProtectedRoute allowedRoles={['BUYER']} />}>
        <Route path={ROUTES.BUYER_DASHBOARD} element={<BuyerDashboardPage />} />
      </Route>
    </Routes>
  );
};
