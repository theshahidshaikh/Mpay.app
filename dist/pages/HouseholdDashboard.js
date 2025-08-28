import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Calendar, CreditCard, CheckCircle, XCircle, Filter, RotateCcw, Home, BarChart2, AlertCircle, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
const HouseholdDashboard = () => {
    const { user } = useAuth();
    const [household, setHousehold] = useState(null);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    // Filter states
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
    const [fromMonth, setFromMonth] = useState(1);
    const [toMonth, setToMonth] = useState(12);
    const [showFilters, setShowFilters] = useState(false);
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const availableYears = [
        new Date().getFullYear(),
        new Date().getFullYear() - 1,
        new Date().getFullYear() - 2,
        new Date().getFullYear() - 3,
    ];
    const fetchHouseholdData = useCallback(async () => {
        if (!user)
            return;
        try {
            const { data, error } = await supabase
                .from('households')
                .select(`*, mosques (name)`)
                .eq('user_id', user.id)
                .single();
            if (error)
                throw error;
            setHousehold(data);
        }
        catch (error) {
            console.error('Error fetching household data:', error);
            toast.error('Error loading household data');
        }
    }, [user]);
    const fetchPayments = useCallback(async () => {
        if (!household)
            return;
        try {
            const { data, error } = await supabase
                .from('payments')
                .select('*')
                .eq('household_id', household.id)
                .eq('year', selectedYear);
            if (error)
                throw error;
            setPayments(data || []);
        }
        catch (error) {
            console.error('Error fetching payments:', error);
            toast.error('Error loading payment data');
        }
        finally {
            setLoading(false);
        }
    }, [household, selectedYear]);
    useEffect(() => {
        setLoading(true);
        fetchHouseholdData();
    }, [fetchHouseholdData]);
    useEffect(() => {
        if (household) {
            fetchPayments();
        }
        else {
            setLoading(false);
        }
    }, [household, fetchPayments]);
    const getPaymentForMonth = (month) => {
        return payments.find(p => p.month === month) || null;
    };
    const getFilteredMonths = () => {
        const monthsInRange = [];
        for (let i = fromMonth; i <= toMonth; i++) {
            monthsInRange.push(i);
        }
        return monthsInRange.filter(month => {
            const payment = getPaymentForMonth(month);
            const status = payment?.status || 'unpaid';
            if (paymentStatusFilter === 'all')
                return true;
            return status === paymentStatusFilter;
        });
    };
    const resetFilters = () => {
        setSelectedYear(new Date().getFullYear());
        setPaymentStatusFilter('all');
        setFromMonth(1);
        setToMonth(12);
    };
    const monthlyAmount = household?.annual_amount ? household.annual_amount / 12 : 0;
    // Updated Summary Calculations
    const paidMonthsForYear = payments.filter(p => p.status === 'paid');
    const pendingMonthsForYear = payments.filter(p => p.status === 'pending_verification');
    const totalPaidForYear = paidMonthsForYear.reduce((sum, p) => sum + p.amount, 0);
    const totalPendingForYear = pendingMonthsForYear.reduce((sum, p) => sum + p.amount, 0);
    // FIX: Total Due now accounts for both paid and pending amounts
    const totalDue = (household?.annual_amount || 0) - totalPaidForYear;
    const filteredMonths = getFilteredMonths();
    if (loading) {
        return (_jsxs("div", { className: "bg-gray-50 min-h-screen", children: [_jsx(Navbar, {}), _jsx("div", { className: "flex items-center justify-center h-screen", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" }) })] }));
    }
    return (_jsxs("div", { className: "bg-gray-50 min-h-screen", children: [_jsx(Navbar, {}), _jsxs("main", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Dashboard" }), _jsxs("p", { className: "text-gray-600 mt-1", children: ["Welcome back, ", household?.head_of_house || user?.email] })] }), household ? (_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8 items-start", children: [_jsxs("div", { className: "lg:col-span-1 space-y-8", children: [_jsxs("div", { className: "card", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900 mb-4 flex items-center", children: [_jsx(Home, { className: "h-5 w-5 mr-2 text-primary-600" }), "Household Information"] }), _jsxs("div", { className: "space-y-3", children: [_jsx(InfoRow, { label: "House Number", value: household.house_number }), _jsx(InfoRow, { label: "Head of House", value: household.head_of_house }), _jsx(InfoRow, { label: "Mosque", value: household.mosques?.name || 'N/A' }), _jsx(InfoRow, { label: "Contact", value: household.contact_number }), _jsx(InfoRow, { label: "Members", value: `${household.members_count} (${household.male_count}M, ${household.female_count}F)` })] })] }), _jsxs("div", { className: "card", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900 mb-4 flex items-center", children: [_jsx(BarChart2, { className: "h-5 w-5 mr-2 text-primary-600" }), "Summary for ", selectedYear] }), _jsxs("div", { className: "space-y-3", children: [_jsx(SummaryRow, { label: "Paid Months", value: `${paidMonthsForYear.length} / 12`, color: "green" }), _jsx(SummaryRow, { label: "Total Payments", value: `₹${totalPaidForYear.toLocaleString()}`, color: "green" }), _jsx(SummaryRow, { label: "Pending Approval", value: `₹${totalPendingForYear.toLocaleString()}`, color: "yellow" }), _jsx(SummaryRow, { label: "Remaining Due", value: `₹${totalDue.toLocaleString()}`, color: "orange" }), _jsx(SummaryRow, { label: "Monthly Amount", value: `₹${monthlyAmount.toLocaleString()}`, color: "gray" })] })] })] }), _jsxs("div", { className: "lg:col-span-2 card", children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-between mb-6 gap-4", children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-900 flex items-center", children: [_jsx(Calendar, { className: "h-6 w-6 mr-2 text-primary-600" }), "Payment Status"] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsxs("button", { onClick: () => setShowFilters(!showFilters), className: "btn-secondary flex items-center text-sm", children: [_jsx(Filter, { className: "h-4 w-4 mr-2" }), "Filters"] }), _jsxs("button", { onClick: resetFilters, className: "btn-secondary flex items-center text-sm", children: [_jsx(RotateCcw, { className: "h-4 w-4 mr-2" }), "Reset"] })] })] }), showFilters && (_jsx("div", { className: "bg-gray-50 p-4 rounded-lg mb-6 border", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Year" }), _jsx("select", { value: selectedYear, onChange: (e) => setSelectedYear(parseInt(e.target.value)), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500", children: availableYears.map(year => (_jsx("option", { value: year, children: year }, year))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Payment Status" }), _jsxs("select", { value: paymentStatusFilter, onChange: (e) => setPaymentStatusFilter(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500", children: [_jsx("option", { value: "all", children: "All Statuses" }), _jsx("option", { value: "paid", children: "Paid" }), _jsx("option", { value: "unpaid", children: "Unpaid" }), _jsx("option", { value: "pending_verification", children: "Pending" }), _jsx("option", { value: "rejected", children: "Rejected" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "From Month" }), _jsx("select", { value: fromMonth, onChange: (e) => setFromMonth(parseInt(e.target.value)), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500", children: months.map((month, index) => (_jsx("option", { value: index + 1, children: month }, index + 1))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "To Month" }), _jsx("select", { value: toMonth, onChange: (e) => setToMonth(parseInt(e.target.value)), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500", children: months.map((month, index) => (_jsx("option", { value: index + 1, children: month }, index + 1))) })] })] }) })), _jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4", children: filteredMonths.map(monthNum => {
                                            const payment = getPaymentForMonth(monthNum);
                                            const status = payment?.status || 'unpaid';
                                            return _jsx(MonthCard, { month: months[monthNum - 1], status: status, reason: payment?.rejection_reason }, monthNum);
                                        }) }), filteredMonths.length === 0 && (_jsx("div", { className: "text-center py-12 text-gray-500", children: _jsx("p", { className: "font-medium", children: "No months found for the selected filters." }) })), _jsxs("div", { className: "mt-8 pt-6 border-t flex flex-col sm:flex-row gap-4", children: [_jsx(Link, { to: "/household/payment", className: "w-full sm:w-auto", children: _jsxs("button", { className: "btn-primary flex items-center justify-center w-full", children: [_jsx(CreditCard, { className: "h-4 w-4 mr-2" }), "Make a Payment"] }) }), _jsx(Link, { to: "/household/history", className: "w-full sm:w-auto", children: _jsx("button", { className: "btn-secondary flex items-center justify-center w-full", children: "View Payment History" }) })] })] })] })) : (_jsxs("div", { className: "card text-center py-16", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-800", children: "Registration Pending" }), _jsx("p", { className: "text-gray-600 mt-2 max-w-md mx-auto", children: "Your household registration is currently awaiting approval." })] }))] })] }));
};
const InfoRow = ({ label, value }) => (_jsxs("div", { className: "flex justify-between items-center text-sm", children: [_jsx("span", { className: "text-gray-600", children: label }), _jsx("span", { className: "font-semibold text-gray-900 text-right", children: value })] }));
const SummaryRow = ({ label, value, color }) => {
    const colors = {
        green: 'bg-green-100 text-green-800',
        blue: 'bg-blue-100 text-blue-800',
        orange: 'bg-orange-100 text-orange-800',
        gray: 'bg-gray-100 text-gray-800',
        yellow: 'bg-yellow-100 text-yellow-800'
    };
    return (_jsxs("div", { className: `flex justify-between items-center p-3 rounded-lg ${colors[color]}`, children: [_jsx("span", { className: "font-medium text-sm", children: label }), _jsx("span", { className: "font-bold text-sm", children: value })] }));
};
const MonthCard = ({ month, status, reason }) => {
    const statusConfig = {
        paid: {
            icon: _jsx(CheckCircle, { className: "h-5 w-5 text-green-600" }),
            style: 'border-green-200 bg-green-100',
            text: 'Paid',
            textColor: 'text-green-700'
        },
        pending_verification: {
            icon: _jsx(AlertCircle, { className: "h-5 w-5 text-yellow-600" }),
            style: 'border-yellow-300 bg-yellow-100',
            text: 'Pending',
            textColor: 'text-yellow-700'
        },
        rejected: {
            icon: _jsx(XCircle, { className: "h-5 w-5 text-red-600" }),
            style: 'border-red-300 bg-red-100',
            text: 'Rejected',
            textColor: 'text-red-700'
        },
        unpaid: {
            icon: _jsx(HelpCircle, { className: "h-5 w-5 text-red-600" }),
            style: 'border-red-300 bg-red-100',
            text: 'Unpaid',
            textColor: 'text-red-700'
        }
    };
    const config = statusConfig[status] || statusConfig.unpaid;
    return (_jsxs("div", { className: `p-4 rounded-lg border-2 relative ${config.style}`, children: [status === 'rejected' && reason && (_jsxs("div", { className: "group absolute top-0 right-0 p-1", children: [_jsx(HelpCircle, { className: "h-5 w-5 text-red-600 cursor-pointer" }), _jsxs("div", { className: "absolute bottom-full right-0 mb-2 w-48 p-2 text-xs text-white bg-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10", children: [_jsx("span", { className: "font-bold", children: "Reason:" }), " ", reason] })] })), _jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h4", { className: "font-semibold text-gray-900", children: month }), config.icon] }), _jsx("p", { className: `text-sm font-medium ${config.textColor}`, children: config.text })] }));
};
export default HouseholdDashboard;
