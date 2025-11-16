import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Search, Inbox, PlusCircle, X, Check, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
const mosqueAdminCollectionsPage = () => {
    const { user } = useAuth();
    const [pendingPaymentGroups, setPendingPaymentGroups] = useState([]);
    const [transactionGroups, setTransactionGroups] = useState([]);
    const [householdOptions, setHouseholdOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedGroupId, setExpandedGroupId] = useState(null);
    const [startDate, setStartDate] = useState(format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [showAddModal, setShowAddModal] = useState(false);
    const [newPayment, setNewPayment] = useState({
        household_id: '',
        amount: '',
        payment_date: format(new Date(), 'yyyy-MM-dd'),
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        payment_method: 'Cash'
    });
    const [rejectingPayment, setRejectingPayment] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const years = [new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1];
    const fetchData = useCallback(async () => {
        if (!user)
            return;
        setLoading(true);
        try {
            const [pendingData, transactionsData, householdsData] = await Promise.all([
                supabase.rpc('get_pending_payment_groups_for_mosque', { admin_user_id: user.id }),
                supabase.rpc('get_payment_groups_for_mosque', { admin_user_id: user.id, start_date: startDate, end_date: endDate }),
                supabase.rpc('get_all_households_for_mosque', { admin_user_id: user.id })
            ]);
            if (pendingData.error)
                throw pendingData.error;
            if (transactionsData.error)
                throw transactionsData.error;
            if (householdsData.error)
                throw householdsData.error;
            setPendingPaymentGroups(pendingData.data || []);
            setTransactionGroups(transactionsData.data || []);
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
    const handleViewReceipt = async (screenshotUrl) => {
        if (!screenshotUrl) {
            toast.error("No receipt URL provided.");
            return;
        }
        const toastId = toast.loading('Generating secure link...');
        try {
            const url = new URL(screenshotUrl);
            const pathParts = url.pathname.split('/');
            const bucketName = 'payment_screenshot';
            const bucketIndex = pathParts.indexOf(bucketName);
            if (bucketIndex === -1) {
                throw new Error('Invalid receipt URL structure. Bucket not found.');
            }
            const filePath = pathParts.slice(bucketIndex + 1).join('/');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session)
                throw new Error("Authentication error: No active session.");
            const { data, error } = await supabase.functions.invoke('get-signed-receipt-url', {
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: { filePath },
            });
            if (error)
                throw error;
            window.open(data.signedUrl, '_blank');
            toast.dismiss(toastId);
        }
        catch (error) {
            toast.error(error.message || 'Could not open receipt.', { id: toastId });
        }
    };
    const handleApprove = async (groupId) => {
        const toastId = toast.loading('Approving...');
        try {
            // const { error } = await supabase.from('payment_groups').update({ status: 'paid' }).eq('id', groupId);
            // if (error) throw error;
            const { error } = await supabase.rpc('approve_payment_group', { p_group_id: groupId });
            if (error)
                throw error;
            toast.success('Payment approved!', { id: toastId });
            fetchData();
        }
        catch (error) {
            toast.error(error.message || 'Failed to approve.', { id: toastId });
        }
    };
    // In src/pages/mosqueAdminCollectionsPage.tsx
    const handleReject = async (e) => {
        e.preventDefault();
        if (!rejectingPayment || !rejectionReason)
            return;
        const toastId = toast.loading('Rejecting...');
        try {
            // Step 1: Update the payment_groups table (your existing code)
            const { error: groupError } = await supabase
                .from('payment_groups')
                .update({ status: 'rejected', rejection_reason: rejectionReason })
                .eq('id', rejectingPayment.id);
            if (groupError)
                throw groupError;
            // --- 👇 NEW: UPDATE the related payments table records ---
            const { error: paymentsError } = await supabase
                .from('payments')
                .update({ status: 'rejected', rejection_reason: rejectionReason })
                .eq('payment_group_id', rejectingPayment.id);
            if (paymentsError)
                throw paymentsError;
            // --- END of new code ---
            toast.success('Payment rejected.', { id: toastId });
            setRejectingPayment(null);
            setRejectionReason('');
            fetchData();
        }
        catch (error) {
            toast.error(error.message || 'Failed to reject.', { id: toastId });
        }
    };
    const handleAddPaymentGroup = async (e) => {
        e.preventDefault();
        const toastId = toast.loading('Adding payment...');
        try {
            const { data: groupData, error: groupError } = await supabase
                .from('payment_groups')
                .insert({
                household_id: newPayment.household_id,
                total_amount: parseFloat(newPayment.amount),
                paid_at: newPayment.payment_date,
                status: 'paid',
            })
                .select('id')
                .single();
            if (groupError)
                throw groupError;
            if (!groupData)
                throw new Error("Failed to create payment group.");
            const paymentGroupId = groupData.id;
            const { error: paymentError } = await supabase.from('payments').insert({
                payment_group_id: paymentGroupId,
                month: newPayment.month,
                year: newPayment.year,
                amount: parseFloat(newPayment.amount),
                payment_method: newPayment.payment_method,
            });
            if (paymentError) {
                await supabase.from('payment_groups').delete().eq('id', paymentGroupId);
                throw paymentError;
            }
            toast.success('Payment added successfully!', { id: toastId });
            setShowAddModal(false);
            fetchData();
        }
        catch (error) {
            toast.error(error.message || 'Failed to add payment.', { id: toastId });
        }
    };
    const filteredTransactionGroups = transactionGroups.filter(t => t.head_of_house.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.house_number.toLowerCase().includes(searchTerm.toLowerCase()));
    const toggleExpand = (groupId) => {
        setExpandedGroupId(prevId => (prevId === groupId ? null : groupId));
    };
    if (loading) {
        return _jsx("div", { className: "flex justify-center items-center h-screen", children: _jsx("p", { children: "Loading..." }) });
    }
    return (_jsxs("div", { className: "bg-gray-50 min-h-screen", children: [_jsx(Navbar, {}), _jsxs("main", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [_jsxs("header", { className: "mb-8", children: [_jsx("h1", { className: "text-3xl font-bold tracking-tight text-gray-900", children: "Collections" }), _jsx("p", { className: "text-lg text-gray-600 mt-1", children: "View and manage all payment transactions." })] }), pendingPaymentGroups.length > 0 && (_jsxs("div", { className: "bg-white p-6 rounded-lg shadow-md mb-8", children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-900 mb-6", children: ["Pending Approvals (", pendingPaymentGroups.length, ")"] }), _jsx("div", { className: "space-y-4", children: pendingPaymentGroups.map(p => (_jsxs("div", { className: "p-4 border rounded-lg bg-yellow-50 border-yellow-200", children: [_jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4", children: [_jsxs("div", { className: "flex-grow cursor-pointer", onClick: () => toggleExpand(p.id), children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("p", { className: "font-bold text-gray-800", children: [p.head_of_house, " ", _jsxs("span", { className: "font-normal text-gray-600", children: ["(House: ", p.house_number, ")"] })] }), expandedGroupId === p.id ? _jsx(ChevronUp, { className: "h-5 w-5 text-gray-600" }) : _jsx(ChevronDown, { className: "h-5 w-5 text-gray-600" })] }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Paid \u20B9", p.total_amount, " for ", p.months.length, " month(s)"] })] }), _jsxs("div", { className: "flex items-center gap-2 w-full sm:w-auto self-end", children: [_jsxs("button", { onClick: () => handleViewReceipt(p.screenshot_url), className: "btn-primary-outline w-full text-sm", children: [_jsx(Eye, { className: "h-4 w-4 mr-2" }), "Receipt"] }), _jsxs("button", { onClick: () => setRejectingPayment(p), className: "btn-danger-outline w-full text-sm", children: [_jsx(X, { className: "h-4 w-4 mr-2" }), "Reject"] }), _jsxs("button", { onClick: () => handleApprove(p.id), className: "btn-primary-outline w-full text-sm", children: [_jsx(Check, { className: "h-4 w-4 mr-2" }), "Approve"] })] })] }), expandedGroupId === p.id && (_jsxs("div", { className: "mt-4 pt-4 border-t border-yellow-200", children: [_jsx("h4", { className: "font-semibold text-sm text-gray-700 mb-2", children: "Months Included:" }), _jsx("ul", { className: "list-disc list-inside space-y-1 text-sm text-gray-600", children: p.months.sort().map(monthStr => {
                                                        const [m, y] = monthStr.split('-');
                                                        return _jsxs("li", { children: [months[parseInt(m) - 1], " ", y] }, monthStr);
                                                    }) })] }))] }, p.id))) })] })), _jsx("div", { className: "bg-white p-6 rounded-lg shadow-md mb-8", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 items-end", children: [_jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Filter by Date" }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("input", { type: "date", value: startDate, onChange: e => setStartDate(e.target.value), className: "input-field" }), _jsx("span", { className: "text-gray-500", children: "to" }), _jsx("input", { type: "date", value: endDate, onChange: e => setEndDate(e.target.value), className: "input-field" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Search by Name or Jamat No." }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: _jsx(Search, { className: "h-5 w-5 text-gray-400" }) }), _jsx("input", { type: "text", placeholder: "Search...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "input-field pl-10" })] })] })] }) }), _jsxs("div", { className: "bg-white p-6 rounded-lg shadow-md", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Transaction Log" }), _jsxs("button", { onClick: () => setShowAddModal(true), className: "btn-primary", children: [_jsx(PlusCircle, { className: "h-5 w-5 mr-2" }), "Add Payment"] })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "th", children: "Date" }), _jsx("th", { className: "th", children: "Head of House" }), _jsx("th", { className: "th", children: "Jamat No." }), _jsx("th", { className: "th", children: "Amount" }), _jsx("th", { className: "th", children: "Months" }), _jsx("th", { className: "th", children: "Method" }), _jsx("th", { className: "th", children: "Status" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: filteredTransactionGroups.map((t) => (_jsxs(React.Fragment, { children: [_jsxs("tr", { className: "hover:bg-gray-50 cursor-pointer", onClick: () => toggleExpand(t.id), children: [_jsx("td", { className: "td", children: format(new Date(t.paid_at), 'dd MMM, yyyy') }), _jsx("td", { className: "td font-medium text-gray-900", children: t.head_of_house }), _jsx("td", { className: "td font-mono", children: t.house_number }), _jsxs("td", { className: "td font-semibold text-green-600", children: ["\u20B9", t.total_amount.toLocaleString()] }), _jsxs("td", { className: "td", children: [t.months.length, " month(s) ", expandedGroupId === t.id ? _jsx(ChevronUp, { className: "h-4 w-4 inline-block ml-1" }) : _jsx(ChevronDown, { className: "h-4 w-4 inline-block ml-1" })] }), _jsx("td", { className: "td", children: _jsx("span", { className: "badge-blue", children: t.payment_method || 'N/A' }) }), _jsx("td", { className: "td", children: _jsx("span", { className: `capitalize badge-${t.status === 'paid' ? 'green' : t.status === 'pending' ? 'yellow' : 'red'}`, children: t.status }) })] }), expandedGroupId === t.id && (_jsx("tr", { className: "bg-gray-50", children: _jsx("td", { colSpan: 7, className: "p-4", children: _jsxs("div", { className: "pl-8", children: [_jsx("h4", { className: "font-semibold text-sm text-gray-700 mb-2", children: "Months Included:" }), _jsx("ul", { className: "list-disc list-inside space-y-1 text-sm text-gray-600", children: t.months.sort().map(monthStr => {
                                                                            const [m, y] = monthStr.split('-');
                                                                            return _jsxs("li", { children: [months[parseInt(m) - 1], " ", y] }, monthStr);
                                                                        }) })] }) }) }))] }, t.id))) })] }) }), filteredTransactionGroups.length === 0 && (_jsxs("div", { className: "text-center py-12", children: [_jsx(Inbox, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900", children: "No Transactions Found" }), _jsx("p", { className: "text-gray-500 mt-1", children: "No payments were recorded in the selected date range." })] }))] })] }), rejectingPayment && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50", children: _jsxs("div", { className: "bg-white rounded-lg p-6 w-full max-w-md shadow-xl", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Reject Payment" }), _jsxs("p", { className: "text-sm text-gray-600 mb-4", children: ["Please provide a reason for rejecting this payment for ", rejectingPayment.head_of_house, "."] }), _jsxs("form", { onSubmit: handleReject, children: [_jsx("textarea", { value: rejectionReason, onChange: e => setRejectionReason(e.target.value), className: "input-field w-full", rows: 3, placeholder: "e.g., Screenshot is unclear, amount does not match...", required: true }), _jsxs("div", { className: "mt-4 flex justify-end space-x-3", children: [_jsx("button", { type: "button", onClick: () => setRejectingPayment(null), className: "btn-primary", children: "Cancel" }), _jsx("button", { type: "submit", className: "btn-danger", children: "Confirm Rejection" })] })] })] }) })), showAddModal && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50", children: _jsxs("div", { className: "bg-white rounded-lg p-6 w-full max-w-lg shadow-xl", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Add New Payment" }), _jsx("button", { onClick: () => setShowAddModal(false), children: _jsx(X, { className: "h-6 w-6 text-gray-500" }) })] }), _jsxs("form", { onSubmit: handleAddPaymentGroup, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "label", children: "Select Household" }), _jsxs("select", { required: true, value: newPayment.household_id, onChange: e => setNewPayment({ ...newPayment, household_id: e.target.value }), className: "input-field", children: [_jsx("option", { value: "", disabled: true, children: "-- Select a household --" }), householdOptions.map(h => _jsx("option", { value: h.id, children: h.name }, h.id))] })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Amount" }), _jsx("input", { type: "number", required: true, value: newPayment.amount, onChange: e => setNewPayment({ ...newPayment, amount: e.target.value }), className: "input-field", placeholder: "e.g., 500" })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Payment for Month/Year" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("select", { value: newPayment.month, onChange: e => setNewPayment({ ...newPayment, month: Number(e.target.value) }), className: "input-field w-full", children: months.map((m, i) => _jsx("option", { value: i + 1, children: m }, i)) }), _jsx("select", { value: newPayment.year, onChange: e => setNewPayment({ ...newPayment, year: Number(e.target.value) }), className: "input-field w-full", children: years.map(y => _jsx("option", { value: y, children: y }, y)) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Payment Date" }), _jsx("input", { type: "date", required: true, value: newPayment.payment_date, onChange: e => setNewPayment({ ...newPayment, payment_date: e.target.value }), className: "input-field" })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Payment Method" }), _jsxs("select", { value: newPayment.payment_method, onChange: e => setNewPayment({ ...newPayment, payment_method: e.target.value }), className: "input-field", children: [_jsx("option", { children: "Cash" }), _jsx("option", { children: "Online" }), _jsx("option", { children: "Other" })] })] }), _jsxs("div", { className: "pt-4 flex justify-end space-x-3", children: [_jsx("button", { type: "button", onClick: () => setShowAddModal(false), className: "btn-primary", children: "Cancel" }), _jsx("button", { type: "submit", className: "btn-primary", children: "Save Payment" })] })] })] }) }))] }));
};
export default mosqueAdminCollectionsPage;
