import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Home, MapPin, Users, Search, Check, X, Edit, Trash2, Inbox, Phone, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
const mosqueAdminHouseholdsPage = () => {
    const { user } = useAuth();
    const [mosqueDetails, setmosqueDetails] = useState(null);
    const [activeHouseholds, setActiveHouseholds] = useState([]);
    const [pendingHouseholds, setPendingHouseholds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    // State for modals
    const [editingHousehold, setEditingHousehold] = useState(null);
    const [deletingHousehold, setDeletingHousehold] = useState(null);
    const fetchData = useCallback(async () => {
        if (!user)
            return;
        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('get_mosque_households_page_data', {
                admin_user_id: user.id,
            });
            if (error)
                throw error;
            setmosqueDetails(data.mosque_details);
            setActiveHouseholds(data.active_households || []);
            setPendingHouseholds(data.pending_households || []);
        }
        catch (error) {
            toast.error(error.message || 'Error loading households data');
        }
        finally {
            setLoading(false);
        }
    }, [user]);
    useEffect(() => {
        if (user?.role === 'mosque_admin') {
            fetchData();
        }
    }, [user, fetchData]);
    const handleApproveHousehold = async (householdId) => {
        const toastId = toast.loading('Approving household...');
        try {
            const { error } = await supabase.functions.invoke('approve-request', {
                body: { requestId: householdId, requestType: 'household' },
            });
            if (error)
                throw error;
            toast.success('Household approved!', { id: toastId });
            fetchData();
        }
        catch (error) {
            toast.error(error.message || 'Failed to approve household.', { id: toastId });
        }
    };
    const handleRejectHousehold = async (householdId) => { toast.error('Reject functionality not yet implemented.'); };
    const handleUpdateHousehold = async (e) => {
        e.preventDefault();
        if (!editingHousehold)
            return;
        const toastId = toast.loading('Updating household...');
        try {
            const { error } = await supabase.functions.invoke('update-household', {
                body: { householdId: editingHousehold.id, updates: editingHousehold },
            });
            if (error)
                throw new Error(error.message);
            toast.success('Household updated successfully!', { id: toastId });
            setEditingHousehold(null);
            fetchData();
        }
        catch (error) {
            toast.error(error.message || 'Failed to update household.', { id: toastId });
        }
    };
    const handleConfirmDelete = async () => {
        if (!deletingHousehold)
            return;
        const toastId = toast.loading('Deleting household...');
        try {
            const { error } = await supabase.functions.invoke('delete-household', {
                body: { householdId: deletingHousehold.id },
            });
            if (error)
                throw new Error(error.message);
            toast.success('Household deleted successfully!', { id: toastId });
            setDeletingHousehold(null);
            fetchData();
        }
        catch (error) {
            toast.error(error.message || 'Failed to delete household.', { id: toastId });
        }
    };
    const handleDeleteFromEditModal = () => {
        if (editingHousehold) {
            setDeletingHousehold(editingHousehold);
            setEditingHousehold(null);
        }
    };
    const filteredHouseholds = activeHouseholds.filter(h => h.house_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.head_of_house.toLowerCase().includes(searchTerm.toLowerCase()));
    if (loading) {
        return (_jsxs("div", { className: "bg-gray-50 min-h-screen", children: [_jsx(Navbar, {}), _jsx("div", { className: "flex items-center justify-center pt-32", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" }) })] }));
    }
    return (_jsxs("div", { className: "bg-gray-50 min-h-screen", children: [_jsx(Navbar, {}), _jsxs("main", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [mosqueDetails && (_jsxs("header", { className: "bg-white p-6 rounded-lg shadow-md mb-8", children: [_jsx("h1", { className: "text-3xl font-bold tracking-tight text-gray-900", children: mosqueDetails.name }), _jsxs("p", { className: "text-lg text-gray-600 mt-1 flex items-center", children: [_jsx(MapPin, { className: "h-5 w-5 mr-2" }), " ", mosqueDetails.address, ", ", mosqueDetails.city, ", ", mosqueDetails.state] })] })), pendingHouseholds.length > 0 && (_jsxs("section", { className: "bg-white p-6 rounded-lg shadow-md mb-8", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-6", children: "Pending Household Approvals" }), _jsx("div", { className: "space-y-4", children: pendingHouseholds.map((household) => (_jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg bg-amber-50", children: [_jsxs("div", { children: [_jsx("p", { className: "text-lg font-bold text-gray-800", children: household.name }), _jsxs("div", { className: "text-sm text-gray-600 mt-2 space-y-1", children: [_jsxs("p", { className: "flex items-center", children: [_jsx(Home, { className: "h-4 w-4 mr-2" }), " House No: ", _jsx("span", { className: "font-medium ml-1", children: household.house_number })] }), _jsxs("p", { className: "flex items-center", children: [_jsx(Users, { className: "h-4 w-4 mr-2" }), " Members: ", _jsx("span", { className: "font-medium ml-1", children: household.members_count })] }), _jsxs("p", { className: "flex items-center", children: [_jsx(Phone, { className: "h-4 w-4 mr-2" }), " Contact: ", _jsx("span", { className: "font-medium ml-1", children: household.contact_number })] })] })] }), _jsxs("div", { className: "flex space-x-3 mt-4 sm:mt-0 w-full sm:w-auto self-center sm:self-end", children: [_jsxs("button", { onClick: () => handleRejectHousehold(household.id), className: "btn-danger-outline w-full", children: [_jsx(X, { className: "h-5 w-5 mr-2" }), " Reject"] }), _jsxs("button", { onClick: () => handleApproveHousehold(household.id), className: "btn-primary w-full", children: [_jsx(Check, { className: "h-5 w-5 mr-2" }), " Approve"] })] })] }, household.id))) })] })), _jsxs("div", { className: "bg-white p-6 rounded-lg shadow-md", children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between md:items-center mb-6", children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-900 flex items-center", children: [_jsx(Home, { className: "h-6 w-6 mr-3 text-primary-600" }), " Active Households"] }), _jsxs("div", { className: "relative mt-4 md:mt-0", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: _jsx(Search, { className: "h-5 w-5 text-gray-400" }) }), _jsx("input", { type: "text", placeholder: "Search by name or Jamat No...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "input-field pl-10 w-full md:w-64" })] })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "th text-center", children: "Jamat No." }), _jsx("th", { className: "th text-center", children: "Head of House" }), _jsx("th", { className: "th text-center", children: "Members" }), _jsx("th", { className: "th text-center", children: "Contact" }), _jsx("th", { className: "th text-center", children: "Annual Amount" }), _jsx("th", { className: "th text-center", children: "Actions" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: filteredHouseholds.map((h) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "td font-mono text-center", children: h.house_number }), _jsx("td", { className: "td font-medium text-gray-900 text-center", children: h.head_of_house }), _jsx("td", { className: "td text-center", children: h.members_count }), _jsx("td", { className: "td text-center", children: h.contact_number }), _jsxs("td", { className: "td text-center", children: ["\u20B9", h.annual_amount.toLocaleString()] }), _jsx("td", { className: "td text-center", children: _jsx("div", { className: "flex justify-center", children: _jsx("button", { onClick: () => setEditingHousehold(h), className: "text-blue-600 hover:text-blue-800", title: "Edit", children: _jsx(Edit, { className: "h-5 w-5" }) }) }) })] }, h.id))) })] }) }), filteredHouseholds.length === 0 && (_jsxs("div", { className: "text-center py-12", children: [_jsx(Inbox, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900", children: "No Households Found" }), _jsx("p", { className: "text-gray-500 mt-1", children: "No active households match your search criteria." })] }))] })] }), editingHousehold && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50", children: _jsxs("div", { className: "bg-white rounded-lg p-6 w-full max-w-lg shadow-xl", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Edit Household" }), _jsxs("form", { onSubmit: handleUpdateHousehold, className: "space-y-4", children: [_jsx("input", { type: "text", value: editingHousehold.house_number, onChange: (e) => setEditingHousehold({ ...editingHousehold, house_number: e.target.value }), className: "input-field", placeholder: "Jamat Number" }), _jsx("input", { type: "text", value: editingHousehold.head_of_house, onChange: (e) => setEditingHousehold({ ...editingHousehold, head_of_house: e.target.value }), className: "input-field", placeholder: "Head of House" }), _jsx("input", { type: "number", value: editingHousehold.members_count, onChange: (e) => setEditingHousehold({ ...editingHousehold, members_count: parseInt(e.target.value) }), className: "input-field", placeholder: "Members Count" }), _jsx("input", { type: "text", value: editingHousehold.contact_number, onChange: (e) => setEditingHousehold({ ...editingHousehold, contact_number: e.target.value }), className: "input-field", placeholder: "Contact Number" }), _jsx("input", { type: "number", value: editingHousehold.annual_amount, onChange: (e) => setEditingHousehold({ ...editingHousehold, annual_amount: parseInt(e.target.value) }), className: "input-field", placeholder: "Annual Amount" }), _jsxs("div", { className: "pt-4 flex justify-between items-center", children: [_jsxs("button", { type: "button", onClick: handleDeleteFromEditModal, className: "btn-danger-outline", children: [_jsx(Trash2, { className: "h-5 w-5 mr-2" }), "Delete Household"] }), _jsxs("div", { className: "space-x-3", children: [_jsx("button", { type: "button", onClick: () => setEditingHousehold(null), className: "btn-secondary", children: "Cancel" }), _jsx("button", { type: "submit", className: "btn-primary", children: "Save Changes" })] })] })] })] }) })), deletingHousehold && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50", children: _jsxs("div", { className: "bg-white rounded-lg p-6 w-full max-w-md shadow-xl", children: [_jsxs("div", { className: "sm:flex sm:items-start", children: [_jsx("div", { className: "mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10", children: _jsx(AlertTriangle, { className: "h-6 w-6 text-red-600" }) }), _jsxs("div", { className: "mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Delete Household" }), _jsxs("p", { className: "text-sm text-gray-500 mt-2", children: ["Are you sure you want to delete the household of \"", deletingHousehold.head_of_house, "\"? This action cannot be undone."] })] })] }), _jsxs("div", { className: "mt-5 sm:mt-4 sm:flex sm:flex-row-reverse", children: [_jsx("button", { type: "button", onClick: handleConfirmDelete, className: "btn-danger w-full sm:ml-3 sm:w-auto", children: "Delete" }), _jsx("button", { type: "button", onClick: () => setDeletingHousehold(null), className: "btn-secondary mt-3 w-full sm:mt-0 sm:w-auto", children: "Cancel" })] })] }) }))] }));
};
export default mosqueAdminHouseholdsPage;
