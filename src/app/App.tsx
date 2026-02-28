import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Landing
import LandingPage from './components/LandingPage';
import SignInPage from './components/SignInPage';
import SignUpPage from './components/SignUpPage';
import ProfileSetup from './components/ProfileSetup';
import SearchPage from './components/SearchPage';
import VerifyEmailPage from './components/VerifyEmailPage';

// Mobile Components
import MobileLayout from './components/mobile/MobileLayout';
import { MobileLogin, MobileSignUp } from './components/mobile/AuthScreens';
import { 
  MobileDashboard, 
  MobileBoardingPass, 
  MobileStatus, 
  MobileNotifications, 
  MobileProfile 
} from './components/mobile/AppScreens';

// Admin Components
import AdminLayout from './components/admin/AdminLayout';
import { 
  AdminLogin, 
  AdminDashboard, 
  AdminPassengerList, 
  AdminScanner, 
  AdminControl, 
  AdminSettings 
} from './components/admin/AdminScreens';

// Boarding Management System Core Functions
import BoardingManagement from './components/boarding/BoardingManagement';
import SearchDiscovery from './components/boarding/SearchDiscovery';
import BookingAgreement from './components/boarding/BookingAgreement';
import PaymentRental from './components/boarding/PaymentRental';
import AdministrationMonitoring from './components/boarding/AdministrationMonitoring';
import RoommateFinderPage from './components/RoommateFinderPage';
import RoommateFinderGroupPage from './components/RoommateFinderGroupPage';
import OwnerDashboard from './components/OwnerDashboard';




export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="/find" element={<SearchPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        
        {/* Mobile Routes */}
        <Route path="/mobile" element={<MobileLayout />}>
          <Route index element={<Navigate to="/mobile/login" replace />} />
          <Route path="login" element={<MobileLogin />} />
          <Route path="signup" element={<MobileSignUp />} />
          <Route path="dashboard" element={<MobileDashboard />} />
          <Route path="boarding-pass" element={<MobileBoardingPass />} />
          <Route path="status" element={<MobileStatus />} />
          <Route path="notifications" element={<MobileNotifications />} />
          <Route path="profile" element={<MobileProfile />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="passengers" element={<AdminPassengerList />} />
          <Route path="scanner" element={<AdminScanner />} />
          <Route path="control" element={<AdminControl />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Boarding Booking Management System Core Functions */}
        <Route path="/boarding-management" element={<BoardingManagement />} />
        <Route path="/search-discovery" element={<SearchDiscovery />} />
        <Route path="/booking-agreement" element={<BookingAgreement />} />
        <Route path="/payment-rental" element={<PaymentRental />} />
        <Route path="/admin-monitoring" element={<AdministrationMonitoring />} />

        <Route path="/roommate-finder" element={<RoommateFinderPage />} />
        <Route path="/roommate-finder-group" element={<RoommateFinderGroupPage />} />
        <Route path="/owner-dashboard" element={<OwnerDashboard />} />

      </Routes>
    </BrowserRouter>
  );
}
