import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Building, Users, IndianRupee, Eye, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
const CityAdminmosquesPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activemosques, setActivemosques] = useState([]);
    const [pendingmosques, setPendingmosques] = useState([]);
    const [loading, setLoading] = useState(true);
    const fetchData = useCallback(async () => {
        if (!user)
            return;
        setLoading(true);
        try {
            // Call the new, correct function
            const { data, error } = await supabase.rpc('get_mosques_for_city_admin', {
                p_user_id: user.id,
            });
            if (error)
                throw error;
            setActivemosques(data.active_mosques || []);
            setPendingmosques(data.pending_mosques || []);
        }
        catch (error) {
            toast.error(error.message || 'Failed to fetch mosques.');
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
    const handleApprovemosque = async (mosqueId) => {
        const toastId = toast.loading('Approving mosque...');
        try {
            const { error } = await supabase.functions.invoke('approve-request', {
                body: { requestId: mosqueId, requestType: 'mosque' },
            });
            if (error)
                throw new Error(error.message);
            toast.success('mosque approved successfully!', { id: toastId });
            fetchData();
        }
        catch (error) {
            toast.error(error.message || 'Failed to approve mosque.', { id: toastId });
        }
    };
    if (loading) {
        return (_jsxs("div", { children: [_jsx(Navbar, {}), _jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" }) })] }));
    }
    return (_jsxs("div", { children: [_jsx(Navbar, {}), _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "mosque Management" }), _jsxs("p", { className: "text-gray-600 mt-2", children: ["Approve and manage all mosques in your assigned city: ", user?.city] })] }), pendingmosques.length > 0 && (_jsxs("div", { className: "card mb-8", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-6", children: "Pending mosque Approvals" }), _jsx("div", { className: "space-y-4", children: pendingmosques.map((mosque) => (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg bg-amber-50", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold text-gray-800", children: mosque.name }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Admin: ", mosque.admin_full_name, " (", mosque.admin_email, ")"] })] }), _jsxs("button", { onClick: () => handleApprovemosque(mosque.id), className: "btn-primary", children: [_jsx(CheckCircle, { className: "h-5 w-5 mr-2" }), "Approve"] })] }, mosque.id))) })] })), _jsxs("div", { className: "card", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-6", children: "Active mosques" }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "mosque Details" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Admin" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Stats" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Actions" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: activemosques.map((mosque) => (_jsxs("tr", { onClick: () => navigate(`/mosques/${mosque.id}`), className: "hover:bg-gray-50 cursor-pointer", children: [_jsxs("td", { className: "px-6 py-4 whitespace-nowrap", children: [_jsx("div", { className: "text-sm font-medium text-gray-900", children: mosque.name }), _jsxs("div", { className: "text-sm text-gray-500", children: [mosque.city, ", ", mosque.state] })] }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600", children: mosque.admin_full_name }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap", children: [_jsxs("div", { className: "text-sm text-gray-900 flex items-center", children: [_jsx(Users, { className: "h-4 w-4 text-gray-400 mr-2" }), " ", mosque.households_count, " Households"] }), _jsxs("div", { className: "text-sm text-gray-900 flex items-center mt-1", children: [_jsx(IndianRupee, { className: "h-4 w-4 text-green-400 mr-2" }), " \u20B9", mosque.total_collected.toLocaleString(), " Collected"] })] }), _jsx("td", { className: "px-11 py-4 whitespace-nowrap text-sm font-medium", children: _jsx(Link, { to: `/mosques/${mosque.id}`, className: "text-gray-500 hover:text-blue-600 transition-colors", title: "View Details", children: _jsx(Eye, { className: "h-5 w-5" }) }) })] }, mosque.id))) })] }) }), activemosques.length === 0 && (_jsxs("div", { className: "text-center py-8", children: [_jsx(Building, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-gray-500", children: "No active mosques found in your city." })] }))] })] })] }));
};
export default CityAdminmosquesPage;
