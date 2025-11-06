import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Building, Users, DollarSign, Search, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];
const mosquesPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [mosques, setmosques] = useState([]);
    const [loading, setLoading] = useState(true);
    // Filter state
    const [selectedState, setSelectedState] = useState('');
    const [cityFilter, setCityFilter] = useState('');
    const fetchmosques = useCallback(async () => {
        if (!user)
            return;
        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('get_all_mosques_with_stats', {
                p_user_id: user.id,
                p_state: selectedState || null,
                p_city: cityFilter || null,
            });
            if (error)
                throw error;
            setmosques(data || []);
        }
        catch (error) {
            toast.error(error.message || 'Failed to fetch mosques.');
        }
        finally {
            setLoading(false);
        }
    }, [user, selectedState, cityFilter]);
    useEffect(() => {
        if (user?.role) {
            fetchmosques();
        }
    }, [fetchmosques, user?.role]);
    // --- NEW: Central navigation function ---
    const handlemosqueClick = (mosqueId) => {
        navigate(`/mosques/${mosqueId}`);
    };
    if (loading) {
        return (_jsxs("div", { children: [_jsx(Navbar, {}), _jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" }) })] }));
    }
    return (_jsxs("div", { children: [_jsx(Navbar, {}), _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "mosque Management" }), _jsx("p", { className: "text-gray-600 mt-2", children: "View details for all active mosques." })] }), user?.role === 'super_admin' && (_jsx("div", { className: "card mb-8", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Filter by State" }), _jsxs("select", { value: selectedState, onChange: (e) => setSelectedState(e.target.value), className: "input-field", children: [_jsx("option", { value: "", children: "All States" }), indianStates.map(state => _jsx("option", { value: state, children: state }, state))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Search by City" }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: _jsx(Search, { className: "h-5 w-5 text-gray-400" }) }), _jsx("input", { type: "text", placeholder: "e.g., Mumbai", value: cityFilter, onChange: (e) => setCityFilter(e.target.value), className: "input-field pl-10" })] })] })] }) })), _jsxs("div", { className: "card", children: [_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "mosque Details" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Admin" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Stats" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Actions" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: mosques.map((mosque) => (_jsxs("tr", { onClick: () => handlemosqueClick(mosque.id), className: "hover:bg-gray-50 cursor-pointer", children: [_jsxs("td", { className: "px-6 py-4 whitespace-nowrap", children: [_jsx("div", { className: "text-sm font-medium text-gray-900", children: mosque.name }), _jsxs("div", { className: "text-sm text-gray-500", children: [mosque.city, ", ", mosque.state] })] }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600", children: mosque.admin_full_name }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap", children: [_jsxs("div", { className: "text-sm text-gray-900 flex items-center", children: [_jsx(Users, { className: "h-4 w-4 text-gray-400 mr-2" }), " ", mosque.households_count, " Households"] }), _jsxs("div", { className: "text-sm text-gray-900 flex items-center mt-1", children: [_jsx(DollarSign, { className: "h-4 w-4 text-green-400 mr-2" }), " \u20B9", mosque.total_collected.toLocaleString(), " Collected"] })] }), _jsx("td", { className: "px-11 py-4 whitespace-nowrap text-sm font-medium", children: _jsx(Link, { to: `/super/mosques/${mosque.id}`, className: "text-gray-500 hover:text-blue-600 transition-colors", title: "View Details", children: _jsx(Eye, { className: "h-5 w-5" }) }) })] }, mosque.id))) })] }) }), mosques.length === 0 && (_jsxs("div", { className: "text-center py-8", children: [_jsx(Building, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-gray-500", children: "No active mosques found for the selected filters." })] }))] })] })] }));
};
export default mosquesPage;
