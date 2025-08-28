import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { UserCheck, Clock, User, Phone, Building, Users, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
const CityAdminAdminsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [pendingAdmins, setPendingAdmins] = useState([]);
    const [activeAdmins, setActiveAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const fetchData = useCallback(async () => {
        if (!user)
            return;
        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('get_mosque_admins_for_city_admin', {
                p_user_id: user.id,
            });
            if (error)
                throw error;
            setPendingAdmins(data.pending_admins || []);
            setActiveAdmins(data.active_admins || []);
        }
        catch (error) {
            toast.error(error.message || 'Failed to fetch mosque admins.');
        }
        finally {
            setLoading(false);
        }
    }, [user]);
    useEffect(() => {
        if (user?.role === 'city_admin') {
            fetchData();
        }
    }, [user, fetchData]);
    const handleApproveAdmin = async (adminId) => {
        const toastId = toast.loading('Approving admin...');
        try {
            const { error } = await supabase.functions.invoke('approve-request', {
                body: { requestId: adminId, requestType: 'user' },
            });
            if (error)
                throw new Error(error.message);
            toast.success('Admin approved successfully!', { id: toastId });
            fetchData(); // Refresh the list
        }
        catch (error) {
            toast.error(error.message || 'Failed to approve admin.', { id: toastId });
        }
    };
    // --- 👇 NEW FUNCTION TO HANDLE MOSQUE CLICK ---
    const handleMosqueClick = (e, mosqueId) => {
        e.stopPropagation(); // Prevents the row's onClick from firing
        if (mosqueId) {
            navigate(`/mosques/${mosqueId}`);
        }
    };
    if (loading) {
        return (_jsxs("div", { className: "bg-gray-50 min-h-screen", children: [_jsx(Navbar, {}), _jsx("div", { className: "flex items-center justify-center pt-32", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" }) })] }));
    }
    return (_jsxs("div", { className: "bg-gray-50 min-h-screen", children: [_jsx(Navbar, {}), _jsxs("main", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [_jsxs("header", { className: "mb-8", children: [_jsx("h1", { className: "text-3xl font-bold tracking-tight text-gray-900", children: "Manage Mosque Admins" }), _jsxs("p", { className: "text-lg text-gray-600 mt-1", children: ["Approve new admins and manage existing ones in ", _jsx("span", { className: "font-medium text-primary-700", children: user?.city }), "."] })] }), pendingAdmins.length > 0 && (_jsxs("section", { className: "bg-white p-6 rounded-lg shadow-md mb-8", children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-900 mb-6 flex items-center", children: [_jsx(Clock, { className: "h-6 w-6 mr-3 text-amber-500" }), " Pending Approvals"] }), _jsx("div", { className: "space-y-4", children: pendingAdmins.map((admin) => (_jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg bg-amber-50", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold text-gray-800", children: admin.full_name }), _jsx("p", { className: "text-sm text-gray-600", children: admin.email }), _jsxs("p", { className: "text-sm text-gray-600 mt-1 flex items-center", children: [_jsx(Phone, { className: "h-4 w-4 mr-2" }), admin.contact_number] })] }), _jsxs("button", { onClick: () => handleApproveAdmin(admin.id), className: "btn-primary mt-3 sm:mt-0 w-full sm:w-auto", children: [_jsx(UserCheck, { className: "h-5 w-5 mr-2" }), "Approve"] })] }, admin.id))) })] })), _jsxs("section", { className: "bg-white p-6 rounded-lg shadow-md", children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-900 mb-6 flex items-center", children: [_jsx(User, { className: "h-6 w-6 mr-3 text-primary-600" }), "Active Mosque Admins"] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Name" }), _jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Contact" }), _jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Assigned Mosque" }), _jsx("th", { scope: "col", className: "relative px-6 py-3", children: _jsx("span", { className: "sr-only", children: "View" }) })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: activeAdmins.map((admin) => (_jsxs("tr", { onClick: () => navigate(`/city/admins/${admin.id}`), className: "hover:bg-gray-50 transition-colors cursor-pointer", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900", children: admin.full_name }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600", children: [_jsx("div", { children: admin.email }), _jsx("div", { className: "text-gray-500", children: admin.contact_number })] }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600", onClick: (e) => handleMosqueClick(e, admin.mosque_id), children: admin.mosque_name ? (_jsxs("span", { className: "flex items-center hover:text-primary-700 hover:underline", children: [_jsx(Building, { className: "h-4 w-4 mr-2 text-gray-400" }), admin.mosque_name] })) : (_jsx("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800", children: "Not Assigned" })) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium", children: _jsx("span", { className: "text-gray-400", children: _jsx(ChevronRight, { className: "h-6 w-6" }) }) })] }, admin.id))) })] }) }), activeAdmins.length === 0 && pendingAdmins.length === 0 && (_jsxs("div", { className: "text-center py-12", children: [_jsx(Users, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900", children: "No Admins to Manage" }), _jsx("p", { className: "text-gray-500 mt-1", children: "There are currently no active or pending mosque admins in your city." })] }))] })] })] }));
};
export default CityAdminAdminsPage;
