import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext'; // Correctly import useAuth here
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HouseholdDashboard from './pages/HouseholdDashboard';
import mosqueAdminDashboard from './pages/mosqueAdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import ProfilePage from './pages/ProfilePage';
import PaymentPage from './pages/PaymentPage';
import PaymentHistoryPage from './pages/PaymentHistoryPage';
import LoadingSpinner from './components/LoadingSpinner';
import SupabaseSetup from './components/SupabaseSetup';
import mosquesPage from './pages/mosquesPage';
import StatePage from './pages/StatePage';
import CityPage from './pages/CityPage';
import mosqueDetailsPage from './pages/mosqueDetailsPage';
import SuperAdminProfilePage from './pages/SuperAdminProfilePage';
import CityAdminmosquesPage from './pages/CityAdminmosquesPage';
import CityAdminsPage from './pages/CityAdminsPage';
import AdminRegistrationPage from './pages/AdminRegistrationPage';
import AwaitingApprovalPage from './pages/AwaitingApprovalPage';
import CityAdminDashboard from './pages/CityAdminDashboard';
import CityAdminAdminsPage from './pages/CityAdminAdminPage';
import CityAdminmosqueAdminDetailsPage from './pages/CityAdminmosqueAdminDetailsPage';
import CityAdminSettingsPage from './pages/CityAdminSettingsPage';
import SuperAdminChangeRequestsPage from './pages/SuperAdminChangeRequestsPage';
import mosqueAdminHouseholdsPage from './pages/mosqueAdminHouseholdsPage';
import mosqueAdminCollectionsPage from './pages/mosqueAdminCollectionsPage';
import mosqueAdminProfilePage from './pages/mosqueAdminProfilePage';
// --- NEW: Placeholder pages for the missing routes ---
// In a real app, these would be in their own files.
function ProtectedRoute({ children, roles }) {
    const { user, loading } = useAuth();
    if (loading)
        return _jsx(LoadingSpinner, {});
    if (!user)
        return _jsx(Navigate, { to: "/login" });
    // Ensure user.role exists before checking
    if (!user.role || !roles.includes(user.role)) {
        // Redirect to a generic dashboard or login if role doesn't match
        return _jsx(Navigate, { to: "/dashboard" });
    }
    return _jsx(_Fragment, { children: children });
}
function AppRoutes() {
    const { user, loading } = useAuth();
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'https://demo.supabase.co') {
        return _jsx(SupabaseSetup, {});
    }
    if (loading)
        return _jsx(LoadingSpinner, {});
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: !user ? _jsx(LoginPage, {}) : _jsx(Navigate, { to: "/dashboard" }) }), _jsx(Route, { path: "/register", element: !user ? _jsx(RegisterPage, {}) : _jsx(Navigate, { to: "/dashboard" }) }), _jsx(Route, { path: "/register/admin", element: _jsx(AdminRegistrationPage, {}) }), _jsx(Route, { path: "/awaiting-approval", element: _jsx(AwaitingApprovalPage, {}) }), _jsx(Route, { path: "/dashboard", element: user ? (user.role === 'household' ? _jsx(Navigate, { to: "/household/dashboard" }) :
                    user.role === 'mosque_admin' ? _jsx(Navigate, { to: "/admin/dashboard" }) :
                        user.role === 'super_admin' ? _jsx(Navigate, { to: "/super/dashboard" }) :
                            user.role == 'city_admin' ? _jsx(Navigate, { to: "/city/dashboard" }) :
                                _jsx(Navigate, { to: "/login" })) : _jsx(Navigate, { to: "/login" }) }), _jsx(Route, { path: "/household/dashboard", element: _jsx(ProtectedRoute, { roles: ['household'], children: _jsx(HouseholdDashboard, {}) }) }), _jsx(Route, { path: "/household/profile", element: _jsx(ProtectedRoute, { roles: ['household'], children: _jsx(ProfilePage, {}) }) }), _jsx(Route, { path: "/household/payment", element: _jsx(ProtectedRoute, { roles: ['household'], children: _jsx(PaymentPage, {}) }) }), _jsx(Route, { path: "/household/history", element: _jsx(ProtectedRoute, { roles: ['household'], children: _jsx(PaymentHistoryPage, {}) }) }), _jsx(Route, { path: "/admin/dashboard", element: _jsx(ProtectedRoute, { roles: ['mosque_admin'], children: _jsx(mosqueAdminDashboard, {}) }) }), _jsx(Route, { path: "/admin/households", element: _jsx(ProtectedRoute, { roles: ['mosque_admin'], children: _jsx(mosqueAdminHouseholdsPage, {}) }) }), _jsx(Route, { path: "/admin/collections", element: _jsx(ProtectedRoute, { roles: ['mosque_admin'], children: _jsx(mosqueAdminCollectionsPage, {}) }) }), _jsx(Route, { path: "/admin/profile", element: _jsx(ProtectedRoute, { roles: ['mosque_admin'], children: _jsx(mosqueAdminProfilePage, {}) }) }), _jsx(Route, { path: "/city/dashboard", element: _jsx(ProtectedRoute, { roles: ['city_admin'], children: _jsx(CityAdminDashboard, {}) }) }), _jsx(Route, { path: "/city/mosques", element: _jsx(ProtectedRoute, { roles: ['city_admin'], children: _jsx(CityAdminmosquesPage, {}) }) }), _jsx(Route, { path: "city/admins", element: _jsx(ProtectedRoute, { roles: ['city_admin'], children: _jsx(CityAdminAdminsPage, {}) }) }), _jsx(Route, { path: "/city/admins/:adminId", element: _jsx(ProtectedRoute, { roles: ['city_admin'], children: _jsx(CityAdminmosqueAdminDetailsPage, {}) }) }), _jsx(Route, { path: "/city/profile", element: _jsx(ProtectedRoute, { roles: ['city_admin'], children: _jsx(CityAdminSettingsPage, {}) }) }), _jsx(Route, { path: "/super/requests", element: _jsx(ProtectedRoute, { roles: ['super_admin'], children: _jsx(SuperAdminChangeRequestsPage, {}) }) }), _jsx(Route, { path: "/super/dashboard", element: _jsx(ProtectedRoute, { roles: ['super_admin'], children: _jsx(SuperAdminDashboard, {}) }) }), _jsx(Route, { path: "/super/states/:stateName", element: _jsx(ProtectedRoute, { roles: ['super_admin'], children: _jsx(StatePage, {}) }) }), _jsx(Route, { path: "/super/cities/:cityName", element: _jsx(ProtectedRoute, { roles: ['super_admin'], children: _jsx(CityPage, {}) }) }), _jsx(Route, { path: "/super/profile", element: _jsx(ProtectedRoute, { roles: ['super_admin'], children: _jsx(SuperAdminProfilePage, {}) }) }), _jsx(Route, { path: "/super/mosques", element: _jsx(ProtectedRoute, { roles: ['super_admin'], children: _jsx(mosquesPage, {}) }) }), _jsx(Route, { path: 'super/admins', element: _jsx(ProtectedRoute, { roles: ['super_admin'], children: _jsx(CityAdminsPage, {}) }) }), _jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/dashboard" }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/dashboard" }) }), _jsx(Route, { path: "/mosques/:mosqueId", element: _jsx(ProtectedRoute, { roles: ['super_admin', 'city_admin', 'mosque_admin'], children: _jsx(mosqueDetailsPage, {}) }) })] }));
}
function App() {
    return (
    // You were importing AuthProvider but not wrapping AppRoutes with it. This is corrected.
    _jsx(Router, { children: _jsx(AuthProvider, { children: _jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx(AppRoutes, {}), _jsx(Toaster, { position: "top-right" })] }) }) }));
}
export default App;
