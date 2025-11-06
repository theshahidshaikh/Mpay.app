import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Users, DollarSign, Search, Inbox, CheckCircle, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
const mosqueAdminDashboard = () => {
    const { user } = useAuth();
    const [households, setHouseholds] = useState([]);
    const [summaryStats, setSummaryStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    // State for date range selection
    const [startMonth, setStartMonth] = useState(1);
    const [startYear, setStartYear] = useState(new Date().getFullYear());
    const [endMonth, setEndMonth] = useState(new Date().getMonth() + 1);
    const [endYear, setEndYear] = useState(new Date().getFullYear());
    // --- NEW: State for the payment status filter ---
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const years = [new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1];
    const fetchData = useCallback(async () => {
        if (!user)
            return;
        setLoading(true);
        try {
            const [reportData, summaryData] = await Promise.all([
                supabase.rpc('get_mosque_reporting_data', {
                    admin_user_id: user.id,
                    start_year: startYear,
                    start_month: startMonth,
                    end_year: endYear,
                    end_month: endMonth,
                }),
                supabase.rpc('get_mosque_summary_stats', {
                    admin_user_id: user.id,
                    start_year: startYear,
                    start_month: startMonth,
                    end_year: endYear,
                    end_month: endMonth,
                })
            ]);
            if (reportData.error)
                throw reportData.error;
            if (summaryData.error)
                throw summaryData.error;
            setHouseholds(reportData.data.households || []);
            setSummaryStats(summaryData.data);
        }
        catch (error) {
            toast.error(error.message || 'Error loading dashboard data');
        }
        finally {
            setLoading(false);
        }
    }, [user, startMonth, startYear, endMonth, endYear]);
    useEffect(() => {
        if (user?.role === 'mosque_admin') {
            fetchData();
        }
    }, [user, fetchData]);
    // --- UPDATED: Filtering logic now includes payment status ---
    const filteredHouseholds = households
        .filter(h => {
        if (paymentStatusFilter === 'all') {
            return true;
        }
        if (paymentStatusFilter === 'fully_paid') {
            return h.unpaid_months === 0;
        }
        if (paymentStatusFilter === 'partially_unpaid') {
            return h.unpaid_months > 0;
        }
        return true;
    })
        .filter(h => h.head_of_house.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (h.contact_number && h.contact_number.includes(searchTerm)));
    if (loading) {
        return (_jsxs("div", { className: "bg-gray-50 min-h-screen", children: [_jsx(Navbar, {}), _jsx("div", { className: "flex items-center justify-center pt-32", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" }) })] }));
    }
    return (_jsxs("div", { className: "bg-gray-50 min-h-screen", children: [_jsx(Navbar, {}), _jsxs("main", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [_jsxs("header", { className: "mb-8", children: [_jsx("h1", { className: "text-3xl font-bold tracking-tight text-gray-900", children: "Household Reporting" }), _jsx("p", { className: "text-lg text-gray-600 mt-1", children: "View payment summaries for a selected date range." })] }), summaryStats && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8", children: [_jsxs("div", { className: "stat-card", children: [_jsx(Users, { className: "stat-icon" }), _jsxs("div", { children: [_jsx("p", { className: "stat-label", children: "Total Households" }), _jsx("p", { className: "stat-value", children: summaryStats.total_households })] })] }), _jsxs("div", { className: "stat-card", children: [_jsx(Users, { className: "stat-icon" }), _jsxs("div", { children: [_jsx("p", { className: "stat-label", children: "Total Population" }), _jsx("p", { className: "stat-value", children: summaryStats.total_population })] })] }), _jsxs("div", { className: "stat-card", children: [_jsx(DollarSign, { className: "stat-icon text-blue-500" }), _jsxs("div", { children: [_jsx("p", { className: "stat-label", children: "Expected Collection" }), _jsxs("p", { className: "stat-value", children: ["\u20B9", summaryStats.expected_collection.toLocaleString()] })] })] }), _jsxs("div", { className: "stat-card", children: [_jsx(CheckCircle, { className: "stat-icon text-green-500" }), _jsxs("div", { children: [_jsx("p", { className: "stat-label", children: "Total Collected" }), _jsxs("p", { className: "stat-value", children: ["\u20B9", summaryStats.total_collected.toLocaleString()] })] })] }), _jsxs("div", { className: "stat-card", children: [_jsx(TrendingUp, { className: "stat-icon text-amber-500" }), _jsxs("div", { children: [_jsx("p", { className: "stat-label", children: "Total Pending" }), _jsxs("p", { className: "stat-value", children: ["\u20B9", summaryStats.total_pending.toLocaleString()] })] })] })] })), _jsx("div", { className: "bg-white p-6 rounded-lg shadow-md mb-8", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6 items-end", children: [_jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Select Date Range" }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-xs text-gray-500", children: "From" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("select", { value: startMonth, onChange: (e) => setStartMonth(Number(e.target.value)), className: "input-field w-full", children: months.map((m, i) => _jsx("option", { value: i + 1, children: m }, i)) }), _jsx("select", { value: startYear, onChange: (e) => setStartYear(Number(e.target.value)), className: "input-field w-full", children: years.map(y => _jsx("option", { value: y, children: y }, y)) })] })] }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-xs text-gray-500", children: "To" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("select", { value: endMonth, onChange: (e) => setEndMonth(Number(e.target.value)), className: "input-field w-full", children: months.map((m, i) => _jsx("option", { value: i + 1, children: m }, i)) }), _jsx("select", { value: endYear, onChange: (e) => setEndYear(Number(e.target.value)), className: "input-field w-full", children: years.map(y => _jsx("option", { value: y, children: y }, y)) })] })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Payment Status" }), _jsxs("select", { value: paymentStatusFilter, onChange: (e) => setPaymentStatusFilter(e.target.value), className: "input-field w-full", children: [_jsx("option", { value: "all", children: "All" }), _jsx("option", { value: "fully_paid", children: "Fully Paid" }), _jsx("option", { value: "partially_unpaid", children: "Partially/Unpaid" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Search by Name or Contact" }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: _jsx(Search, { className: "h-5 w-5 text-gray-400" }) }), _jsx("input", { type: "text", placeholder: "Search...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "input-field pl-10" })] })] })] }) }), _jsxs("div", { className: "bg-white p-6 rounded-lg shadow-md", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-6", children: "Household Payment Summary" }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "th", children: "Head of House" }), _jsx("th", { className: "th", children: "Contact Number" }), _jsx("th", { className: "th", children: "Paid Months" }), _jsx("th", { className: "th", children: "Unpaid Months" }), _jsx("th", { className: "th", children: "Total Due" }), _jsx("th", { className: "th", children: "Action" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: filteredHouseholds.map((h) => {
                                                const monthlyAmount = h.annual_amount / 12;
                                                const totalDue = h.unpaid_months * monthlyAmount;
                                                const linkTo = `/mosque/household/${h.id}?startMonth=${startMonth}&startYear=${startYear}&endMonth=${endMonth}&endYear=${endYear}`;
                                                return (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "td text-center font-medium text-gray-900", children: h.head_of_house }), _jsx("td", { className: "td text-center font-mono", children: h.contact_number }), _jsx("td", { className: "td text-center text-green-600 font-semibold", children: h.paid_months }), _jsx("td", { className: "td text-center text-red-600 font-semibold", children: h.unpaid_months }), _jsxs("td", { className: "td text-center font-bold", children: ["\u20B9", totalDue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })] }), _jsx("td", { className: "td text-center", children: _jsx(Link, { to: linkTo, className: "font-medium text-primary-600 hover:text-primary-800", children: "View Details" }) })] }, h.id));
                                            }) })] }) }), filteredHouseholds.length === 0 && (_jsxs("div", { className: "text-center py-12", children: [_jsx(Inbox, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900", children: "No Households Found" }), _jsx("p", { className: "text-gray-500 mt-1", children: "No active households match your search criteria for the selected date range." })] }))] })] })] }));
};
export default mosqueAdminDashboard;
