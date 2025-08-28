import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Search, Inbox, PlusCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
const MosqueAdminCollectionsPage = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [householdOptions, setHouseholdOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    // State for filters
    const [startDate, setStartDate] = useState(format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    // State for Add Payment Modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [newPayment, setNewPayment] = useState({
        household_id: '',
        amount: '',
        payment_date: format(new Date(), 'yyyy-MM-dd'),
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        payment_method: 'Cash'
    });
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const years = [new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1];
    const fetchData = useCallback(async () => {
        if (!user)
            return;
        setLoading(true);
        try {
            const [transactionsData, householdsData] = await Promise.all([
                supabase.rpc('get_mosque_collections', {
                    admin_user_id: user.id,
                    start_date: startDate,
                    end_date: endDate,
                }),
                supabase.rpc('get_all_households_for_mosque', {
                    admin_user_id: user.id
                })
            ]);
            if (transactionsData.error)
                throw transactionsData.error;
            if (householdsData.error)
                throw householdsData.error;
            setTransactions(transactionsData.data || []);
            setHouseholdOptions(householdsData.data || []);
        }
        catch (error) {
            toast.error(error.message || 'Error loading collections data');
        }
        finally {
            setLoading(false);
        }
    }, [user, startDate, endDate]);
    useEffect(() => {
        if (user?.role === 'mosque_admin') {
            fetchData();
        }
    }, [user, fetchData]);
    const handleAddPayment = async (e) => {
        e.preventDefault();
        const toastId = toast.loading('Adding payment...');
        try {
            const { error } = await supabase.from('payments').insert({
                ...newPayment,
                amount: parseFloat(newPayment.amount),
                status: 'paid' // Manual entries are always considered paid
            });
            if (error)
                throw error;
            toast.success('Payment added successfully!', { id: toastId });
            setShowAddModal(false);
            fetchData(); // Refresh the transaction list
        }
        catch (error) {
            toast.error(error.message || 'Failed to add payment.', { id: toastId });
        }
    };
    const filteredTransactions = transactions.filter(t => t.head_of_house.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.house_number.toLowerCase().includes(searchTerm.toLowerCase()));
    if (loading) { /* ... (loading UI remains the same) ... */ }
    return (_jsxs("div", { className: "bg-gray-50 min-h-screen", children: [_jsx(Navbar, {}), _jsxs("main", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [_jsxs("header", { className: "mb-8", children: [_jsx("h1", { className: "text-3xl font-bold tracking-tight text-gray-900", children: "Collections" }), _jsx("p", { className: "text-lg text-gray-600 mt-1", children: "View and manage all payment transactions." })] }), _jsx("div", { className: "bg-white p-6 rounded-lg shadow-md mb-8", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 items-end", children: [_jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Filter by Date" }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("input", { type: "date", value: startDate, onChange: e => setStartDate(e.target.value), className: "input-field" }), _jsx("span", { className: "text-gray-500", children: "to" }), _jsx("input", { type: "date", value: endDate, onChange: e => setEndDate(e.target.value), className: "input-field" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Search by Name or House No." }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: _jsx(Search, { className: "h-5 w-5 text-gray-400" }) }), _jsx("input", { type: "text", placeholder: "Search...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "input-field pl-10" })] })] })] }) }), _jsxs("div", { className: "bg-white p-6 rounded-lg shadow-md", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Transaction Log" }), _jsxs("button", { onClick: () => setShowAddModal(true), className: "btn-primary", children: [_jsx(PlusCircle, { className: "h-5 w-5 mr-2" }), "Add Payment"] })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "th", children: "Date" }), _jsx("th", { className: "th", children: "Head of House" }), _jsx("th", { className: "th", children: "House No." }), _jsx("th", { className: "th", children: "Amount" }), _jsx("th", { className: "th", children: "For Month" }), _jsx("th", { className: "th", children: "Method" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: filteredTransactions.map((t) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "td", children: format(new Date(t.payment_date), 'dd MMM, yyyy') }), _jsx("td", { className: "td font-medium text-gray-900", children: t.head_of_house }), _jsx("td", { className: "td font-mono", children: t.house_number }), _jsxs("td", { className: "td font-semibold text-green-600", children: ["\u20B9", t.amount.toLocaleString()] }), _jsxs("td", { className: "td", children: [months[t.month - 1], " ", t.year] }), _jsx("td", { className: "td", children: _jsx("span", { className: "badge-blue", children: t.payment_method || 'N/A' }) })] }, t.id))) })] }) }), filteredTransactions.length === 0 && (_jsxs("div", { className: "text-center py-12", children: [_jsx(Inbox, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900", children: "No Transactions Found" }), _jsx("p", { className: "text-gray-500 mt-1", children: "No payments were recorded in the selected date range." })] }))] })] }), showAddModal && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50", children: _jsxs("div", { className: "bg-white rounded-lg p-6 w-full max-w-lg shadow-xl", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Add New Payment" }), _jsx("button", { onClick: () => setShowAddModal(false), children: _jsx(X, { className: "h-6 w-6 text-gray-500" }) })] }), _jsxs("form", { onSubmit: handleAddPayment, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "label", children: "Select Household" }), _jsxs("select", { required: true, value: newPayment.household_id, onChange: e => setNewPayment({ ...newPayment, household_id: e.target.value }), className: "input-field", children: [_jsx("option", { value: "", disabled: true, children: "-- Select a household --" }), householdOptions.map(h => _jsx("option", { value: h.id, children: h.name }, h.id))] })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Amount" }), _jsx("input", { type: "number", required: true, value: newPayment.amount, onChange: e => setNewPayment({ ...newPayment, amount: e.target.value }), className: "input-field", placeholder: "e.g., 500" })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Payment for Month/Year" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("select", { value: newPayment.month, onChange: e => setNewPayment({ ...newPayment, month: Number(e.target.value) }), className: "input-field w-full", children: months.map((m, i) => _jsx("option", { value: i + 1, children: m }, i)) }), _jsx("select", { value: newPayment.year, onChange: e => setNewPayment({ ...newPayment, year: Number(e.target.value) }), className: "input-field w-full", children: years.map(y => _jsx("option", { value: y, children: y }, y)) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Payment Date" }), _jsx("input", { type: "date", required: true, value: newPayment.payment_date, onChange: e => setNewPayment({ ...newPayment, payment_date: e.target.value }), className: "input-field" })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Payment Method" }), _jsxs("select", { value: newPayment.payment_method, onChange: e => setNewPayment({ ...newPayment, payment_method: e.target.value }), className: "input-field", children: [_jsx("option", { children: "Cash" }), _jsx("option", { children: "Online" }), _jsx("option", { children: "Other" })] })] }), _jsxs("div", { className: "pt-4 flex justify-end space-x-3", children: [_jsx("button", { type: "button", onClick: () => setShowAddModal(false), className: "btn-secondary", children: "Cancel" }), _jsx("button", { type: "submit", className: "btn-primary", children: "Save Payment" })] })] })] }) }))] }));
};
export default MosqueAdminCollectionsPage;
