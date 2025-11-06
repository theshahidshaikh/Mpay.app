import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Building, Users, ArrowLeft, ChevronRight, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';
const CityPage = () => {
    const { user } = useAuth();
    const { cityName } = useParams();
    const [totals, setTotals] = useState(null);
    const [pendingmosques, setPendingmosques] = useState([]);
    const [activemosques, setActivemosques] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const decodedCityName = cityName ? decodeURIComponent(cityName) : '';
    const fetchData = useCallback(async () => {
        if (!decodedCityName)
            return;
        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('get_city_dashboard_data', {
                p_city_name: decodedCityName,
            });
            if (error)
                throw error;
            if (data) {
                setTotals(data.totals);
                setPendingmosques(data.pending_mosques || []);
                setActivemosques(data.active_mosques || []);
            }
        }
        catch (error) {
            toast.error(error.message || 'Failed to load city data.');
        }
        finally {
            setLoading(false);
        }
    }, [decodedCityName]);
    useEffect(() => {
        if (user?.role === 'super_admin') {
            fetchData();
        }
    }, [user, fetchData]);
    const handlemosqueClick = (mosqueId) => {
        navigate(`/mosques/${mosqueId}`);
    };
    if (loading) {
        return (_jsxs("div", { children: [_jsx(Navbar, {}), _jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" }) })] }));
    }
    return (_jsxs("div", { children: [_jsx(Navbar, {}), _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [_jsxs("div", { className: "mb-8", children: [_jsxs(Link, { to: `/super/states/${encodeURIComponent(activemosques[0]?.state || '')}`, className: "flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4", children: [_jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }), "Back to State View"] }), _jsx("h1", { className: "text-3xl font-bold text-gray-900", children: decodedCityName }), _jsx("p", { className: "text-gray-600 mt-2", children: "City-Level Overview" })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8", children: [_jsxs("div", { className: "card text-center", children: [_jsx(Building, { className: "h-8 w-8 mx-auto text-primary-600 mb-2" }), _jsx("p", { className: "text-3xl font-bold text-gray-900", children: totals?.total_mosques.toLocaleString() || 0 }), _jsx("p", { className: "text-gray-500", children: "Total mosques" })] }), _jsxs("div", { className: "card text-center", children: [_jsx(Users, { className: "h-8 w-8 mx-auto text-primary-600 mb-2" }), _jsx("p", { className: "text-3xl font-bold text-gray-900", children: totals?.total_households.toLocaleString() || 0 }), _jsx("p", { className: "text-gray-500", children: "Total Households" })] }), _jsxs("div", { className: "card text-center", children: [_jsx(Users, { className: "h-8 w-8 mx-auto text-indigo-500 mb-2" }), _jsx("p", { className: "text-3xl font-bold text-gray-900", children: totals?.total_population.toLocaleString() || 0 }), _jsx("p", { className: "text-gray-500", children: "Total Population" })] }), _jsxs("div", { className: "card text-center", children: [_jsx(IndianRupee, { className: "h-8 w-8 mx-auto text-green-500 mb-2" }), _jsxs("p", { className: "text-3xl font-bold text-gray-900", children: ["\u20B9", totals?.total_collection.toLocaleString() || 0] }), _jsx("p", { className: "text-gray-500", children: "Collection (This Year)" })] })] }), _jsxs("div", { className: "card", children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-900 mb-6", children: ["Active mosques in ", decodedCityName] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "mosque" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Admin" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Households" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Population" }), _jsx("th", { className: "relative px-6 py-3", children: _jsx("span", { className: "sr-only", children: "View" }) })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: activemosques.map((mosque) => (_jsxs("tr", { onClick: () => handlemosqueClick(mosque.id), className: "hover:bg-gray-50 cursor-pointer", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap font-medium text-gray-900", children: mosque.name }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-gray-600", children: mosque.admin_full_name }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-gray-600", children: mosque.households_count }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-gray-600", children: mosque.population_count }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium", children: _jsx(ChevronRight, { className: "h-5 w-5 text-gray-400" }) })] }, mosque.id))) })] }) }), activemosques.length === 0 && !loading && (_jsxs("div", { className: "text-center py-8", children: [_jsx(Building, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-gray-500", children: "No active mosques found in this city." })] }))] })] })] }));
};
export default CityPage;
