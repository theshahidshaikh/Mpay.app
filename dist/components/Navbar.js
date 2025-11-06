import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, User, CreditCard, History, LogOut, Users, Building } from 'lucide-react';
import MpayLogo from '../assets/horizontal-logo.png';
const Navbar = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const handleSignOut = async () => {
        try {
            await signOut();
            navigate('/login');
        }
        catch (error) {
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
        }
        else if (user?.role === 'mosque_admin') {
            return [
                { icon: Home, label: 'Dashboard', path: '/admin/dashboard' },
                { icon: Users, label: 'Households', path: '/admin/households' },
                { icon: CreditCard, label: 'Collections', path: '/admin/collections' },
                { icon: User, label: 'Profile', path: '/admin/profile' },
            ];
        }
        else if (user?.role === 'city_admin') {
            return [
                { icon: Home, label: 'Dashboard', path: '/city/dashboard' },
                { icon: Building, label: 'mosques', path: '/city/mosques' },
                { icon: Users, label: 'Admins', path: '/city/admins' },
                { icon: User, label: 'Profile', path: '/city/profile' },
            ];
        }
        else if (user?.role === 'super_admin') {
            return [
                { icon: Home, label: 'Dashboard', path: '/super/dashboard' },
                { icon: Building, label: 'mosques', path: '/super/mosques' },
                { icon: Users, label: 'Admins', path: '/super/admins' },
                { icon: User, label: 'Profile', path: '/super/profile' },
            ];
        }
        return [];
    };
    const navItems = getNavItems();
    return (_jsxs(_Fragment, { children: [_jsx("nav", { className: "bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "flex justify-between items-center h-16", children: [_jsx("div", { className: "flex items-center", children: _jsx(Link, { to: "/dashboard", className: "flex-shrink-0 flex items-center", children: _jsx("img", { src: MpayLogo, alt: "Mpay Logo", className: "h-12" }) }) }), _jsx("div", { className: "hidden md:block", children: _jsxs("div", { className: "ml-10 flex items-baseline space-x-4", children: [navItems.map((item) => {
                                            const Icon = item.icon;
                                            const isActive = location.pathname.startsWith(item.path);
                                            return (_jsxs("button", { onClick: () => navigate(item.path), className: `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive
                                                    ? 'bg-primary-100 text-primary-700'
                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`, children: [_jsx(Icon, { className: "h-4 w-4 mr-2" }), item.label] }, item.path));
                                        }), _jsxs("button", { onClick: handleSignOut, className: "flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200", children: [_jsx(LogOut, { className: "h-4 w-4 mr-2" }), "Sign Out"] })] }) })] }) }) }), _jsx("div", { className: "md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50", children: _jsx("div", { className: "flex justify-around items-center h-16", children: navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.path);
                        return (_jsxs("button", { onClick: () => navigate(item.path), className: `flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors duration-200 ${isActive ? 'text-primary-600' : 'text-gray-500 hover:text-primary-600'}`, children: [_jsx(Icon, { className: "h-6 w-6 mb-1" }), _jsx("span", { children: item.label })] }, item.path));
                    }) }) })] }));
};
export default Navbar;
