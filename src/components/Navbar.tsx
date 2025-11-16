import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, User, CreditCard, History, LogOut, Users, Building } from 'lucide-react';
import MpayLogo from '../assets/horizontal-logo.png';
import NotificationDropdown from './NotificationDropdown'; // Assuming this component exists
import { useNotifications } from '../hooks/useNotifications'; // Import hook for counts
import useBadgeClearer from '../hooks/useBadgeClearer'; // Import hook for auto-clearing

const Navbar: React.FC = () => {
    const { user, signOut } = useAuth();
    const { pendingCounts } = useNotifications(); // Get pending counts for badges
    const navigate = useNavigate();
    const location = useLocation();

    // EXECUTE HOOK: Triggers badge clearing RPC when the route changes to a monitored tab
    useBadgeClearer();

    const handleSignOut = async () => {
        try {
            await signOut();
            navigate('/login');
        } catch (error) {
            console.error("Failed to sign out:", error);
            navigate('/login'); // Force navigate even if sign out has an error
        }
    };

    const getNavItems = () => {
        if (user?.role === 'household') {
            return [
                { icon: Home, label: 'Dashboard', path: '/household/dashboard' },
                { icon: CreditCard, label: 'Payment', path: '/household/payment' },
                { icon: History, label: 'History', path: '/household/history' },
                { icon: User, label: 'Profile', path: '/household/profile' },
            ];
        } else if (user?.role === 'mosque_admin') {
            return [
                { icon: Home, label: 'Dashboard', path: '/admin/dashboard' },
                // Mosque Admin: Households + Profile Requests
                { icon: Users, label: 'Households', path: '/admin/households', badgeCount: pendingCounts.households + pendingCounts.requests },
                // Mosque Admin: New Payments
                { icon: CreditCard, label: 'Collections', path: '/admin/collections', badgeCount: pendingCounts.collections },
                { icon: User, label: 'Profile', path: '/admin/profile' },
            ];
        } else if (user?.role === 'city_admin') {
            return [
                { icon: Home, label: 'Dashboard', path: '/city/dashboard' },
                // City Admin: Mosque Registrations Badge
                { icon: Building, label: 'mosques', path: '/city/mosques', badgeCount: pendingCounts.mosqueregistrations },
                { icon: Users, label: 'Admins', path: '/city/admins' },
                { icon: User, label: 'Profile', path: '/city/profile' },
            ];
        } else if (user?.role === 'super_admin') {
            return [
                { icon: Home, label: 'Dashboard', path: '/super/dashboard' },
                // Super Admin: Mosque Registrations Badge
                { icon: Building, label: 'mosques', path: '/super/mosques', badgeCount: pendingCounts.mosqueregistrations },
                // Super Admin: Pending Profile Requests Badge
                { icon: Users, label: 'Admins', path: '/super/admins', badgeCount: pendingCounts.requests },
                { icon: User, label: 'Profile', path: '/super/profile' },
            ];
        }
        return [];
    };

    const navItems = getNavItems();

    return (
        <>
            {/* Top Navigation Bar (for Desktop) */}
            <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            {/* Logo */}
                            <Link to="/dashboard" className="flex-shrink-0 flex items-center">
                                <img
                                    src={MpayLogo}
                                    alt="Mpay Logo"
                                    className="h-12"
                                />
                            </Link>
                        </div>

                        {/* Desktop Navigation Links and Controls */}
                        <div className="hidden md:flex items-center space-x-4">
                            <div className="flex items-baseline space-x-4">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname.startsWith(item.path);
                                    const badgeCount = (item as any).badgeCount || 0; // Retrieve badge count
                                    return (
                                        <button
                                            key={item.path}
                                            onClick={() => navigate(item.path)}
                                            className={`relative flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                                                isActive
                                                    ? 'bg-primary-100 text-primary-700'
                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                            }`}
                                        >
                                            <Icon className="h-4 w-4 mr-2" />
                                            {item.label}
                                            
                                            {/* BADGE RENDERING */}
                                            {badgeCount > 0 && (
                                                <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                                                    {badgeCount}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Notification Dropdown and Sign Out Group */}
                            <div className="flex items-center ml-6 space-x-4">
                                <NotificationDropdown />
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200"
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Bottom Tab Navigation (for Mobile) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 ">
                <div className="flex justify-around items-center h-16">
                    {/* Mobile Alert Tab */}
                    <div className="flex flex-col items-center justify-center w-1/5 h-full text-xs font-medium text-gray-500">
                        <NotificationDropdown />
                        <span className="mt-1 text-xs">Alerts</span>
                    </div>

                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.path);
                        const badgeCount = (item as any).badgeCount || 0;

                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`relative flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors duration-200 ${
                                    isActive ? 'text-primary-600' : 'text-gray-500 hover:text-primary-600'
                                }`}
                            >
                                <Icon className="h-6 w-6 mb-1" />
                                <span>{item.label}</span>

                                {/* BADGE RENDERING - Mobile Tab */}
                                {badgeCount > 0 && (
                                    <span className="absolute top-1 right-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                                        {badgeCount}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default Navbar;