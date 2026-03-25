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
  UserManagement, 
  KYCVerification, 
  SupportTickets, 
  FeedbackManagement 
} from './components/admin/AdminScreens';

// Boarding Management System Core Functions
import BoardingManagement from './components/boarding/BoardingManagement';
import SearchDiscovery from './components/boarding/SearchDiscovery';
import BookingAgreement from './components/boarding/BookingAgreement';
import PaymentRentalPage from './components/payment/PaymentRentalPage';
import BoardingPlaceDetail from './components/payment/BoardingPlaceDetail';
import StudentPayment from './components/payment/StudentPayment';
import AdministrationMonitoring from './components/boarding/AdministrationMonitoring';
import RoommateFinderPage from './components/RoommateFinderPage';
import RoommateFinderEnhanced from './components/RoommateFinderEnhanced';
import ChatbotSection from './components/ChatbotSection';
import OwnerDashboard from './components/OwnerDashboard';

import BookingManagementSystem from './components/booking/BookingManagementSystem';
import StudentBookingDashboard from './components/booking/StudentBookingDashboard';
import UserProfileDashboard from './components/UserProfileDashboard';


// Roommate Finder Flow Components
import BoardingDetail from './components/BoardingDetail';
import GroupBooking from './components/GroupBooking';
import ApprovalSuccess from './components/ApprovalSuccess';
import AgreementPayment from './components/AgreementPayment';
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import RoommateFinderGroupPage from './components/RoommateFinderGroupPage';
import OwnerApprovalPage from './components/OwnerApprovalPage';


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
        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
        
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
          <Route path="users" element={<UserManagement />} />
          <Route path="kyc" element={<KYCVerification />} />
          <Route path="tickets" element={<SupportTickets />} />
          <Route path="feedback" element={<FeedbackManagement />} />
        </Route>

        {/* Boarding Booking Management System Core Functions */}
        <Route path="/boarding-management" element={<BoardingManagement />} />
        <Route path="/search-discovery" element={<SearchDiscovery />} />
        <Route path="/booking-agreement" element={<BookingAgreement />} />
        <Route path="/payment-rental" element={<PaymentRentalPage />} />
        <Route path="/payment-rental/:placeId" element={<BoardingPlaceDetail />} />
        <Route path="/owner-bookings" element={<BookingManagementSystem />} />
        <Route path="/student-booking" element={<StudentBookingDashboard />} />
        <Route path="/student-payment" element={<StudentPayment />} />
        <Route path="/admin-monitoring" element={<AdministrationMonitoring />} />
        <Route path="/owner-dashboard" element={<OwnerDashboard />} />
        <Route path="/profile" element={<UserProfileDashboard />} />

        {/* Roommate Finder Enhanced Routes (from main branch) */}
        <Route path="/roommate-finder" element={<RoommateFinderPage />} />
        <Route path="/roommate-finder-enhanced" element={<RoommateFinderEnhanced />} />
        <Route path="/roommate-group" element={<RoommateFinderGroupPage />} />
        <Route path="/boarding-detail/:id" element={<BoardingDetail />} />
        <Route path="/group-booking" element={<GroupBooking />} />
        <Route path="/approval-success" element={<ApprovalSuccess />} />
        <Route path="/booking-agreement" element={<AgreementPayment />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/owner-approval" element={<OwnerApprovalPage />} />
        <Route path="/chatbot" element={<ChatbotSection standalone={true} />} />
        <Route path="/owner-dashboard" element={<OwnerDashboard />} />

      </Routes>
    </BrowserRouter>
  );
}
