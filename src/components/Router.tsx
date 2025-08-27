import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Public pages
import { Home } from '../pages/Home';
import { HowItWorks } from '../pages/HowItWorks';
import { FAQ } from '../pages/FAQ';
import { Coverage } from '../pages/Coverage';
import { Contact } from '../pages/Contact';
import { CommunityRiskInsights } from '../pages/CommunityRiskInsights';
import { Login } from '../pages/Auth/Login';
import { Register } from '../pages/Auth/Register';
import { VerifyOTP } from '../pages/Auth/VerifyOTP';

// Protected pages
import { Dashboard } from '../pages/Dashboard/Dashboard';
import { Properties } from '../pages/Dashboard/Properties';
import { AddProperty } from '../pages/Dashboard/AddProperty';
import { PropertyDetails } from '../pages/Dashboard/PropertyDetails';
import { GetQuote } from '../pages/Dashboard/GetQuote';
import { Policies } from '../pages/Dashboard/Policies';
import { WalletPage } from '../pages/Dashboard/Wallet';

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/coverage" element={<Coverage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/community-risk-insights" element={<CommunityRiskInsights />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/properties" element={
          <ProtectedRoute>
            <Properties />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/properties/new" element={
          <ProtectedRoute>
            <AddProperty />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/properties/:id/details" element={
          <ProtectedRoute>
            <PropertyDetails />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/policies" element={
          <ProtectedRoute>
            <Policies />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/wallet" element={
          <ProtectedRoute>
            <WalletPage />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/quote" element={
          <ProtectedRoute>
            <GetQuote />
          </ProtectedRoute>
        } />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}