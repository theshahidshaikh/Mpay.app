import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { History, Calendar, DollarSign, CreditCard, Download, Filter, ArrowLeft, CheckCircle, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
const PaymentHistoryPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [household, setHousehold] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());
    const [filterMethod, setFilterMethod] = useState('all');
    const [sortOrder, setSortOrder] = useState('desc');
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user, filterYear]);
    const fetchData = async () => {
        if (!user)
            return;
        setLoading(true);
        try {
            // ✅ Fetch household data (fix: simplified select string)
            const { data: householdData, error: householdError } = await supabase
                .from('households')
                .select('*, mosques(name)')
                .eq('user_id', user.id)
                .single();
            if (householdError)
                throw householdError;
            setHousehold(householdData);
            // ✅ Fetch payment history
            const { data: paymentsData, error: paymentsError } = await supabase
                .from('payments')
                .select('*')
                .eq('household_id', householdData.id)
                .eq('year', filterYear)
                .eq('status', 'paid')
                .order('payment_date', { ascending: false });
            if (paymentsError)
                throw paymentsError;
            setPayments(paymentsData || []);
        }
        catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Error loading payment history');
        }
        finally {
            setLoading(false);
        }
    };
    const getFilteredPayments = () => {
        let filtered = payments;
        if (filterMethod !== 'all') {
            filtered = filtered.filter(payment => payment.payment_method === filterMethod);
        }
        return filtered.sort((a, b) => {
            const dateA = new Date(a.payment_date).getTime();
            const dateB = new Date(b.payment_date).getTime();
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });
    };
    const generateReport = () => {
        const filteredPayments = getFilteredPayments();
        if (filteredPayments.length === 0) {
            toast.error('No payments to export');
            return;
        }
        const csvContent = [
            ['Date', 'Month', 'Year', 'Amount', 'Payment Method', 'Transaction ID', 'Status'],
            ...filteredPayments.map(payment => [
                format(new Date(payment.payment_date), 'dd/MM/yyyy'),
                months[payment.month - 1],
                payment.year.toString(),
                `₹${payment.amount.toFixed(2)}`,
                payment.payment_method.toUpperCase(),
                payment.transaction_id || 'N/A',
                payment.status.toUpperCase()
            ])
        ].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `payment-history-${filterYear}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success('Payment history exported successfully');
    };
    const getTotalPaid = () => {
        return getFilteredPayments().reduce((total, payment) => total + payment.amount, 0);
    };
    const getPaymentMethodIcon = (method) => {
        switch (method.toLowerCase()) {
            case 'upi':
            case 'card':
            case 'netbanking':
                return _jsx(CreditCard, { className: "h-4 w-4" });
            case 'cash':
                return _jsx(DollarSign, { className: "h-4 w-4" });
            default:
                return _jsx(CreditCard, { className: "h-4 w-4" });
        }
    };
    const getPaymentMethodColor = (method) => {
        switch (method.toLowerCase()) {
            case 'upi':
                return 'bg-blue-100 text-blue-800';
            case 'card':
                return 'bg-purple-100 text-purple-800';
            case 'netbanking':
                return 'bg-green-100 text-green-800';
            case 'cash':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    if (loading) {
        return (_jsxs("div", { children: [_jsx(Navbar, {}), _jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" }) })] }));
    }
    const filteredPayments = getFilteredPayments();
    const totalPaid = getTotalPaid();
    const availableYears = [2024, 2025, 2026, 2027, 2028];
    const paymentMethods = ['all', 'upi', 'card', 'netbanking', 'cash'];
    return (_jsxs("div", { children: [_jsx(Navbar, {}), _jsxs("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pt-4 pb-20", children: [_jsxs("div", { className: "mb-8", children: [_jsxs("button", { onClick: () => navigate('/household/dashboard'), className: "hidden md:flex items-center text-primary-600 hover:text-primary-700 mb-4", children: [_jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }), "Back to Dashboard"] }), _jsxs("div", { className: "flex justify-between items-center md:items-start flex-col md:flex-row", children: [_jsxs("div", { className: "text-center md:text-left", children: [_jsxs("h1", { className: "text-3xl font-bold text-gray-900 flex items-center justify-center md:justify-start", children: [_jsx(History, { className: "h-8 w-8 mr-3 text-primary-600 hidden md:block" }), "Payment History"] }), _jsx("p", { className: "text-gray-600 mt-2", children: "Track all your payment transactions" })] }), filteredPayments.length > 0 && (_jsxs("button", { onClick: generateReport, className: "btn-primary flex items-center mt-4 md:mt-0", children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Export CSV"] }))] })] }), household && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-8", children: [_jsx("div", { className: "card", children: _jsxs("div", { className: "flex flex-col items-center text-center md:flex-row md:text-left", children: [_jsx("div", { className: "p-3 rounded-full bg-primary-100", children: _jsx(DollarSign, { className: "h-6 w-6 text-primary-600" }) }), _jsxs("div", { className: "mt-4 md:mt-0 md:ml-4", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900", children: ["\u20B9", totalPaid.toLocaleString()] }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Total Paid (", filterYear, ")"] })] })] }) }), _jsx("div", { className: "card", children: _jsxs("div", { className: "flex flex-col items-center text-center md:flex-row md:text-left", children: [_jsx("div", { className: "p-3 rounded-full bg-green-100", children: _jsx(CheckCircle, { className: "h-6 w-6 text-green-600" }) }), _jsxs("div", { className: "mt-4 md:mt-0 md:ml-4", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: filteredPayments.length }), _jsx("p", { className: "text-sm text-gray-600", children: "Transactions" })] })] }) }), _jsx("div", { className: "card", children: _jsxs("div", { className: "flex flex-col items-center text-center md:flex-row md:text-left", children: [_jsx("div", { className: "p-3 rounded-full bg-blue-100", children: _jsx(Receipt, { className: "h-6 w-6 text-blue-600" }) }), _jsxs("div", { className: "mt-4 md:mt-0 md:ml-4", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: household.house_number }), _jsx("p", { className: "text-sm text-gray-600", children: "House Number" })] })] }) })] })), _jsx("div", { className: "card mb-8", children: _jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Filter, { className: "h-5 w-5 text-gray-400 mr-2" }), _jsx("span", { className: "text-base font-medium text-gray-700", children: "Filters" })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "flex flex-col", children: [_jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Year" }), _jsx("select", { value: filterYear, onChange: (e) => setFilterYear(parseInt(e.target.value)), className: "text-sm border border-gray-300 rounded-md px-3 py-2", children: availableYears.map((year) => (_jsx("option", { value: year, children: year }, year))) })] }), _jsxs("div", { className: "flex flex-col", children: [_jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Payment Method" }), _jsx("select", { value: filterMethod, onChange: (e) => setFilterMethod(e.target.value), className: "text-sm border border-gray-300 rounded-md px-3 py-2", children: paymentMethods.map((method) => (_jsx("option", { value: method, children: method === 'all' ? 'All Methods' : method.toUpperCase() }, method))) })] }), _jsxs("div", { className: "flex flex-col", children: [_jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Sort Order" }), _jsxs("select", { value: sortOrder, onChange: (e) => setSortOrder(e.target.value), className: "text-sm border border-gray-300 rounded-md px-3 py-2", children: [_jsx("option", { value: "desc", children: "Newest First" }), _jsx("option", { value: "asc", children: "Oldest First" })] })] })] })] }) }), _jsxs("div", { className: "card", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-6", children: "Transaction History" }), filteredPayments.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(History, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No Payment History" }), _jsx("p", { className: "text-gray-600", children: filterMethod !== 'all' || filterYear !== new Date().getFullYear()
                                            ? 'No payments found for the selected filters.'
                                            : 'You haven\'t made any payments yet.' }), _jsx("button", { onClick: () => navigate('/household/payment'), className: "btn-primary mt-4", children: "Make Your First Payment" })] })) : (_jsxs("div", { children: [_jsx("div", { className: "space-y-4 md:hidden", children: filteredPayments.map((payment) => (_jsxs("div", { className: "bg-gray-50 p-4 rounded-lg border", children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsxs("p", { className: "font-bold text-gray-900 text-lg", children: ["\u20B9", payment.amount.toLocaleString()] }), _jsxs("p", { className: "text-sm font-medium text-gray-700", children: [months[payment.month - 1], " ", payment.year] })] }), _jsxs("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentMethodColor(payment.payment_method)}`, children: [getPaymentMethodIcon(payment.payment_method), _jsx("span", { className: "ml-1", children: payment.payment_method.toUpperCase() })] })] }), _jsxs("div", { className: "mt-4 pt-4 border-t border-gray-200 text-xs text-gray-600 space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "font-medium", children: "Date:" }), _jsx("span", { children: format(new Date(payment.payment_date), 'MMM dd, yyyy - HH:mm') })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "font-medium", children: "Transaction ID:" }), _jsx("span", { className: "font-mono break-all", children: payment.transaction_id || 'N/A' })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "font-medium", children: "Status:" }), _jsxs("span", { className: "status-paid", children: [_jsx(CheckCircle, { className: "h-3 w-3 mr-1 inline" }), "Paid"] })] })] })] }, payment.id))) }), _jsx("div", { className: "overflow-x-auto hidden md:block", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Date" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Month/Year" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Amount" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Method" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Transaction ID" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Status" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: filteredPayments.map((payment) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("div", { className: "flex items-center", children: [_jsx(Calendar, { className: "h-4 w-4 text-gray-400 mr-2" }), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-gray-900", children: format(new Date(payment.payment_date), 'MMM dd, yyyy') }), _jsx("div", { className: "text-sm text-gray-500", children: format(new Date(payment.payment_date), 'HH:mm') })] })] }) }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: [months[payment.month - 1], " ", payment.year] }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("div", { className: "text-sm font-semibold text-gray-900", children: ["\u20B9", payment.amount.toLocaleString()] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentMethodColor(payment.payment_method)}`, children: [getPaymentMethodIcon(payment.payment_method), _jsx("span", { className: "ml-1", children: payment.payment_method.toUpperCase() })] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono", children: payment.transaction_id || 'N/A' }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("span", { className: "status-paid", children: [_jsx(CheckCircle, { className: "h-3 w-3 mr-1 inline" }), "Paid"] }) })] }, payment.id))) })] }) })] }))] })] })] }));
};
export default PaymentHistoryPage;
