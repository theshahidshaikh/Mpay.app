import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Map, ChevronRight, Users, UserCheck, Building, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, } from 'chart.js';
// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
const SuperAdminDashboard = () => {
    const { user } = useAuth();
    const [totals, setTotals] = useState(null);
    const [statsByState, setStatsByState] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('get_super_admin_dashboard_data');
            if (error)
                throw error;
            if (data) {
                setTotals(data.totals);
                setStatsByState(data.state_stats || []);
            }
        }
        catch (error) {
            console.error('Error fetching dashboard stats:', error);
            toast.error(error.message || 'Failed to load dashboard data.');
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        if (user?.role === 'super_admin') {
            fetchData();
        }
    }, [user, fetchData]);
    const handleStateClick = (stateName) => {
        navigate(`/super/states/${encodeURIComponent(stateName)}`);
    };
    // Chart data and options
    const topStatesData = statsByState.slice(0, 10);
    const chartData = {
        labels: topStatesData.map(s => s.state),
        datasets: [
            {
                label: 'Number of Mosques',
                data: topStatesData.map(s => s.mosque_count),
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1,
            },
        ],
    };
    const chartOptions = {
        indexAxis: 'y',
        elements: { bar: { borderWidth: 2 } },
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: true, text: 'Top 10 States by Mosque Count' },
        },
    };
    if (loading) {
        return (_jsxs("div", { children: [_jsx(Navbar, {}), _jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" }) })] }));
    }
    return (_jsxs("div", { children: [_jsx(Navbar, {}), _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [_jsxs("div", { className: "mb-8", children: [_jsxs("h1", { className: "text-3xl font-bold text-gray-900", children: ["Welcome, ", user?.full_name || 'Admin'] }), _jsx("p", { className: "text-gray-600 mt-2", children: "Super Admin Dashboard | National Overview" })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8", children: [_jsxs("div", { className: "card text-center", children: [_jsx(Building, { className: "h-8 w-8 mx-auto text-primary-600 mb-2" }), _jsx("p", { className: "text-3xl font-bold text-gray-900", children: totals?.total_mosques.toLocaleString() || 0 }), _jsx("p", { className: "text-gray-500", children: "Total Mosques" })] }), _jsxs("div", { className: "card text-center", children: [_jsx(Users, { className: "h-8 w-8 mx-auto text-primary-600 mb-2" }), _jsx("p", { className: "text-3xl font-bold text-gray-900", children: totals?.total_households.toLocaleString() || 0 }), _jsx("p", { className: "text-gray-500", children: "Total Households" })] }), _jsxs("div", { className: "card text-center", children: [_jsx(Users, { className: "h-8 w-8 mx-auto text-indigo-500 mb-2" }), _jsx("p", { className: "text-3xl font-bold text-gray-900", children: totals?.total_population.toLocaleString() || 0 }), _jsx("p", { className: "text-gray-500", children: "Total Population" })] }), _jsxs("div", { className: "card text-center", children: [_jsx(UserCheck, { className: "h-8 w-8 mx-auto text-primary-600 mb-2" }), _jsx("p", { className: "text-3xl font-bold text-gray-900", children: totals?.total_admins.toLocaleString() || 0 }), _jsx("p", { className: "text-gray-500", children: "Total City Admins" })] }), _jsxs("div", { className: "card text-center", children: [_jsx(IndianRupee, { className: "h-8 w-8 mx-auto text-green-500 mb-2" }), _jsxs("p", { className: "text-3xl font-bold text-gray-900", children: ["\u20B9", totals?.total_collection.toLocaleString() || 0] }), _jsx("p", { className: "text-gray-500", children: "Collection (This Year)" })] })] }), _jsxs("div", { className: "card mb-8", children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-900 mb-6 flex items-center", children: [_jsx(Map, { className: "h-6 w-6 mr-3 text-primary-600" }), "Statistics by State"] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "State" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Mosques" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Households" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "City Admins" }), _jsx("th", { className: "relative px-6 py-3", children: _jsx("span", { className: "sr-only", children: "View" }) })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: statsByState.map((stat) => (_jsxs("tr", { onClick: () => handleStateClick(stat.state), className: "hover:bg-gray-50 cursor-pointer", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap font-medium text-gray-900", children: stat.state }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-gray-600", children: stat.mosque_count }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-gray-600", children: stat.household_count }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-gray-600", children: stat.city_admin_count }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium", children: _jsx(ChevronRight, { className: "h-5 w-5 text-gray-400" }) })] }, stat.state))) })] }) }), statsByState.length === 0 && !loading && (_jsxs("div", { className: "text-center py-8", children: [_jsx(Map, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-gray-500", children: "No data found for any state." })] }))] }), statsByState.length > 0 && (_jsx("div", { className: "card", children: _jsx(Bar, { options: chartOptions, data: chartData }) }))] })] }));
};
export default SuperAdminDashboard;
