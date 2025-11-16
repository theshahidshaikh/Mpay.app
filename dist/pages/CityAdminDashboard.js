import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Building, Users, IndianRupee, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
const CityAdminDashboard = () => {
    const { user } = useAuth();
    const [totals, setTotals] = useState(null);
    const [mosques, setmosques] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const fetchData = useCallback(async () => {
        if (!user)
            return;
        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('get_city_admin_dashboard_data', {
                p_user_id: user.id,
            });
            if (error)
                throw error;
            if (data) {
                setTotals(data.totals);
                setmosques(data.mosques_list || []);
            }
        }
        catch (error) {
            toast.error(error.message || 'Failed to load dashboard data.');
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
    const handlemosqueClick = (mosqueId) => {
        navigate(`/mosques/${mosqueId}`);
    };
    if (loading) {
        return (_jsxs("div", { children: [_jsx(Navbar, {}), _jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" }) })] }));
    }
    return (_jsxs("div", { children: [_jsx(Navbar, {}), _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [_jsxs("div", { className: "mb-8", children: [_jsxs("h1", { className: "text-3xl font-bold text-gray-900", children: ["Welcome, ", user?.full_name || 'Admin'] }), _jsxs("p", { className: "text-gray-600 mt-2", children: ["City Admin Dashboard | ", user?.city] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8", children: [_jsxs("div", { className: "card text-center", children: [_jsx(Building, { className: "h-8 w-8 mx-auto text-primary-600 mb-2" }), _jsx("p", { className: "text-3xl font-bold text-gray-900", children: totals?.total_mosques.toLocaleString() || 0 }), _jsx("p", { className: "text-gray-500", children: "Total mosques" })] }), _jsxs("div", { className: "card text-center", children: [_jsx(Users, { className: "h-8 w-8 mx-auto text-primary-600 mb-2" }), _jsx("p", { className: "text-3xl font-bold text-gray-900", children: totals?.total_households.toLocaleString() || 0 }), _jsx("p", { className: "text-gray-500", children: "Total Households" })] }), _jsxs("div", { className: "card text-center", children: [_jsx(Users, { className: "h-8 w-8 mx-auto text-indigo-500 mb-2" }), _jsx("p", { className: "text-3xl font-bold text-gray-900", children: totals?.total_population.toLocaleString() || 0 }), _jsx("p", { className: "text-gray-500", children: "Total Population" })] }), _jsxs("div", { className: "card text-center", children: [_jsx(IndianRupee, { className: "h-8 w-8 mx-auto text-green-500 mb-2" }), _jsxs("p", { className: "text-3xl font-bold text-gray-900", children: ["\u20B9", totals?.total_collection.toLocaleString() || 0] }), _jsx("p", { className: "text-gray-500", children: "Collection (This Year)" })] })] }), _jsxs("div", { className: "card", children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-900 mb-6 flex items-center", children: [_jsx(Building, { className: "h-6 w-6 mr-3 text-primary-600" }), "mosques in ", user?.city] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "mosque" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Admin" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Households" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Population" }), _jsx("th", { className: "relative px-6 py-3", children: _jsx("span", { className: "sr-only", children: "View" }) })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: mosques.map((mosque) => (_jsxs("tr", { onClick: () => handlemosqueClick(mosque.id), className: "hover:bg-gray-50 cursor-pointer", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap font-medium text-gray-900", children: mosque.name }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-gray-600", children: mosque.admin_full_name }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-gray-600", children: mosque.households_count }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-gray-600", children: mosque.population_count }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium", children: _jsx(ChevronRight, { className: "h-5 w-5 text-gray-400" }) })] }, mosque.id))) })] }) }), mosques.length === 0 && !loading && (_jsxs("div", { className: "text-center py-8", children: [_jsx(Building, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-gray-500", children: "No active mosques found in your city." })] }))] })] })] }));
};
export default CityAdminDashboard;
