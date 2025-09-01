import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext'; // Correctly import useAuth here
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HouseholdDashboard from './pages/HouseholdDashboard';
import MosqueAdminDashboard from './pages/MosqueAdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import ProfilePage from './pages/ProfilePage';
import PaymentPage from './pages/PaymentPage';
import PaymentHistoryPage from './pages/PaymentHistoryPage';
import LoadingSpinner from './components/LoadingSpinner';
import SupabaseSetup from './components/SupabaseSetup';
import MosquesPage from './pages/MosquesPage';
import StatePage from './pages/StatePage';
import CityPage from './pages/CityPage';
import MosqueDetailsPage from './pages/MosqueDetailsPage';
import SuperAdminProfilePage from './pages/SuperAdminProfilePage';  
import CityAdminMosquesPage from './pages/CityAdminMosquesPage';
import CityAdminsPage from './pages/CityAdminsPage';
import AdminRegistrationPage from './pages/AdminRegistrationPage';
import AwaitingApprovalPage from './pages/AwaitingApprovalPage';
import CityAdminDashboard from './pages/CityAdminDashboard';
import CityAdminAdminsPage from './pages/CityAdminAdminPage';
import CityAdminMosqueAdminDetailsPage from './pages/CityAdminMosqueAdminDetailsPage';
import CityAdminSettingsPage from './pages/CityAdminSettingsPage';
import SuperAdminChangeRequestsPage from './pages/SuperAdminChangeRequestsPage';
import MosqueAdminHouseholdsPage from './pages/MosqueAdminHouseholdsPage';
import MosqueAdminCollectionsPage from './pages/MosqueAdminCollectionsPage';
import MosqueAdminProfilePage from './pages/MosqueAdminProfilePage';
import LandingPage from './pages/LandingPage';
import MosqueAdminHouseholdDetailsPage from './pages/MosqueAdminHouseholdDetailsPage';




// --- NEW: Placeholder pages for the missing routes ---
// In a real app, these would be in their own files.







function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles: string[] }) {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  
  if (!user) return <Navigate to="/login" />;
  
  // Ensure user.role exists before checking
  if (!user.role || !roles.includes(user.role)) {
    // Redirect to a generic dashboard or login if role doesn't match
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  
  if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'https://demo.supabase.co') {
    return <SupabaseSetup />;
  }
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <Routes>
      <Route path="/" element={!user ? <LandingPage /> : <Navigate to="/dashboard" />} />
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/dashboard" />} />
       <Route path="/register/admin" element={<AdminRegistrationPage />} />
      <Route path="/awaiting-approval" element={<AwaitingApprovalPage />} />
      
      <Route path="/dashboard" element={
        user ? (
          user.role === 'household' ? <Navigate to="/household/dashboard" /> :
          user.role === 'mosque_admin' ? <Navigate to="/admin/dashboard" /> :
          user.role === 'super_admin' ? <Navigate to="/super/dashboard" /> :
          user.role == 'city_admin' ? <Navigate to="/city/dashboard" /> :
          <Navigate to="/login" />
        ) : <Navigate to="/login" />
      } />
      
      {/* Household Routes */}
      <Route path="/household/dashboard" element={<ProtectedRoute roles={['household']}><HouseholdDashboard /></ProtectedRoute>} />
      <Route path="/household/profile" element={<ProtectedRoute roles={['household']}><ProfilePage /></ProtectedRoute>} />
      <Route path="/household/payment" element={<ProtectedRoute roles={['household']}><PaymentPage /></ProtectedRoute>} />
      <Route path="/household/history" element={<ProtectedRoute roles={['household']}><PaymentHistoryPage /></ProtectedRoute>} />
      
      {/* Mosque Admin Routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute roles={['mosque_admin']}><MosqueAdminDashboard /></ProtectedRoute>} />
      {/* NEW: Added missing Mosque Admin routes */}
      <Route path="/admin/households/" element={<ProtectedRoute roles={['mosque_admin']}><MosqueAdminHouseholdsPage /></ProtectedRoute>} />
      <Route path="/mosque/household/:householdId/" element={<ProtectedRoute roles={['mosque_admin']}><MosqueAdminHouseholdDetailsPage /></ProtectedRoute>} />
      <Route path="/admin/collections" element={<ProtectedRoute roles={['mosque_admin']}><MosqueAdminCollectionsPage /></ProtectedRoute>} />
      <Route path="/admin/profile" element={<ProtectedRoute roles={['mosque_admin']}><MosqueAdminProfilePage /></ProtectedRoute>} />

      {/*City admin Routes */}
      <Route path="/city/dashboard" element={<ProtectedRoute roles={['city_admin']}><CityAdminDashboard /></ProtectedRoute>} />
      <Route path="/city/mosques"element={<ProtectedRoute roles={['city_admin']}><CityAdminMosquesPage /></ProtectedRoute>}/>
      {/* <Route path="/city/mosques/:mosqueId" element={<ProtectedRoute roles={['city_admin']}><MosqueDetailsPage /></ProtectedRoute>}/>
     */}
     <Route path="city/admins"element={<ProtectedRoute roles={['city_admin']}><CityAdminAdminsPage /></ProtectedRoute>} />
     <Route path="/city/admins/:adminId" element={<ProtectedRoute roles={['city_admin']}><CityAdminMosqueAdminDetailsPage /></ProtectedRoute>} />
     <Route path="/city/profile" element={<ProtectedRoute roles={['city_admin']}><CityAdminSettingsPage /></ProtectedRoute>} />
     <Route path="/super/requests" element={<ProtectedRoute roles={['super_admin']}><SuperAdminChangeRequestsPage /></ProtectedRoute>} />

      {/* Super Admin Routes */}
      <Route path="/super/dashboard" element={<ProtectedRoute roles={['super_admin']}><SuperAdminDashboard /></ProtectedRoute>} />
      <Route path="/super/states/:stateName" element={<ProtectedRoute roles={['super_admin']}><StatePage /></ProtectedRoute>} />  
      <Route path="/super/cities/:cityName" element={<ProtectedRoute roles={['super_admin']}><CityPage /></ProtectedRoute>}/>
      <Route path="/super/profile" element={<ProtectedRoute roles={['super_admin']}><SuperAdminProfilePage/></ProtectedRoute>}/>
      
      {/* NEW: Added missing Super Admin routes */}
      <Route path="/super/mosques" element={<ProtectedRoute roles={['super_admin']}><MosquesPage /></ProtectedRoute>} />
      {/* <Route path="/super/mosques/:mosqueId" element={<ProtectedRoute roles={['super_admin']}><MosqueDetailsPage /></ProtectedRoute>}/> */}
      <Route path='super/admins' element={<ProtectedRoute roles={['super_admin']}><CityAdminsPage/></ProtectedRoute>}/>
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to="/" />} />

      <Route 
        path="/mosques/:mosqueId" 
        element={
          <ProtectedRoute roles={['super_admin', 'city_admin', 'mosque_admin']}>
            <MosqueDetailsPage />
          </ProtectedRoute>
        } 

      />
    </Routes>
  );
}

function App() {
  return (
    // You were importing AuthProvider but not wrapping AppRoutes with it. This is corrected.
    <Router>
      <AuthProvider> 
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
          <Toaster position="top-right" />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;