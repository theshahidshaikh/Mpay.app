import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Eye, UserCog, Search, CheckCircle, FileClock } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminDetailsModal from '../components/AdminDetailsModal';
const indianStates = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"];
const CityAdminsPage = () => {
    const { user } = useAuth();
    const [pendingAdmins, setPendingAdmins] = useState([]);
    const [activeAdmins, setActiveAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    // --- NEW: State for modal visibility and selected admin ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    // State for filters
    const [selectedState, setSelectedState] = useState('');
    const [cityFilter, setCityFilter] = useState('');
    // --- NEW: Debounced state for the city filter ---
    const [debouncedCity, setDebouncedCity] = useState('');
    // --- NEW: useEffect to debounce the city input ---
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedCity(cityFilter);
        }, 500); // Wait 500ms after the user stops typing
        return () => {
            clearTimeout(handler);
        };
    }, [cityFilter]);
    const fetchAdmins = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('get_city_admins_with_pending', {
                p_state: selectedState || null,
                // --- CHANGED: Use the debounced city value for the API call ---
                p_city: debouncedCity || null,
            });
            if (error)
                throw error;
            if (data) {
                setPendingAdmins(data.pending_admins || []);
                setActiveAdmins(data.active_admins || []);
            }
        }
        catch (error) {
            toast.error(error.message || 'Failed to fetch city admins.');
        }
        finally {
            setLoading(false);
        }
    }, [selectedState, debouncedCity]); // --- CHANGED: Depend on the debounced value ---
    useEffect(() => {
        if (user?.role === 'super_admin') {
            fetchAdmins();
        }
    }, [user, fetchAdmins]);
    // --- NEW: Handlers for opening and closing the modal ---
    const handleRowClick = (admin) => {
        setSelectedAdmin(admin);
        setIsModalOpen(true);
    };
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedAdmin(null);
    };
    const handleApproveAdmin = async (admin) => {
        const toastId = toast.loading('Approving admin...');
        try {
            const { error } = await supabase.functions.invoke('set-city-admin-role', {
                body: { userId: admin.id, city: admin.city },
            });
            if (error)
                throw new Error(error.message);
            const { error: profileError } = await supabase
                .from('admin_profiles')
                .update({ status: 'active' })
                .eq('id', admin.id);
            if (profileError)
                throw profileError;
            toast.success('Admin approved and role assigned!', { id: toastId });
            fetchAdmins();
        }
        catch (error) {
            toast.error(error.message || 'Failed to approve admin.', { id: toastId });
        }
    };
    const handleDeleteAdmin = (adminId) => {
        toast('Delete functionality requires a Supabase Edge Function.');
    };
    // --- CHANGED: Only show full-page loader on the initial load ---
    if (loading && pendingAdmins.length === 0 && activeAdmins.length === 0) {
        return (_jsxs("div", { children: [_jsx(Navbar, {}), _jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" }) })] }));
    }
    return (_jsxs("div", { className: "bg-gray-50 min-h-screen", children: [_jsx(Navbar, {}), _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [_jsxs("div", { className: "flex flex-col sm:flex-row justify-between sm:items-center mb-8", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold tracking-tight text-gray-900", children: "City Admin Management" }), _jsx("p", { className: "text-lg text-gray-600 mt-1", children: "Approve new registrations and manage existing city admins." })] }), _jsx(Link, { to: "/super/requests", className: "mt-4 sm:mt-0 w-full sm:w-auto", children: _jsxs("button", { className: "btn-secondary w-full", children: [_jsx(FileClock, { className: "h-5 w-5 mr-2" }), "View Change Requests"] }) })] }), _jsx("div", { className: "bg-white p-6 rounded-lg shadow-md mb-8", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Filter by State" }), _jsxs("select", { value: selectedState, onChange: (e) => setSelectedState(e.target.value), className: "input-field", children: [_jsx("option", { value: "", children: "All States" }), indianStates.map(state => _jsx("option", { value: state, children: state }, state))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Search by City" }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: _jsx(Search, { className: "h-5 w-5 text-gray-400" }) }), _jsx("input", { type: "text", placeholder: "e.g., Mumbai", value: cityFilter, onChange: (e) => setCityFilter(e.target.value), className: "input-field pl-10" })] })] })] }) }), _jsxs("div", { className: `space-y-8 transition-opacity ${loading ? 'opacity-50' : 'opacity-100'}`, children: [pendingAdmins.length > 0 && (_jsxs("div", { className: "bg-white p-6 rounded-lg shadow-md", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-6", children: "Pending Approvals" }), _jsx("div", { className: "space-y-4", children: pendingAdmins.map((admin) => (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg bg-amber-50", children: [_jsxs("div", { children: [_jsxs("p", { className: "font-semibold text-gray-800", children: [admin.full_name, " (", admin.email, ")"] }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Location: ", admin.city, ", ", admin.state] })] }), _jsxs("button", { onClick: () => handleApproveAdmin(admin), className: "btn-primary", children: [_jsx(CheckCircle, { className: "h-5 w-5 mr-2" }), "Approve"] })] }, admin.id))) })] })), _jsxs("div", { className: "bg-white p-6 rounded-lg shadow-md", children: [_jsx("div", { className: "flex justify-between items-center mb-6", children: _jsxs("h2", { className: "text-xl font-semibold text-gray-900 flex items-center", children: [_jsx(UserCog, { className: "h-6 w-6 mr-3 text-primary-600" }), "Active City Admins"] }) }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Name" }), _jsx("th", { className: "px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Contact" }), _jsx("th", { className: "px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Assigned Location" }), _jsx("th", { className: "px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Action" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: activeAdmins.map((admin) => (_jsxs("tr", { onClick: () => handleRowClick(admin), 
                                                        // --- CHANGED: Added 'group' for hover effect on children ---
                                                        className: "group hover:bg-gray-50 cursor-pointer", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap font-medium text-gray-900 text-center", children: admin.full_name }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-gray-600 text-center", children: [_jsx("div", { children: admin.email }), _jsx("div", { children: admin.contact_number || 'N/A' })] }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-gray-600 text-center", children: [admin.city, ", ", admin.state] }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-center text-sm font-medium", children: _jsx(Eye, { className: "h-5 w-5 mx-auto text-gray-400 transition-all group-hover:scale-125 group-hover:text-primary-600" }) })] }, admin.id))) })] }) })] })] })] }), selectedAdmin && (_jsx(AdminDetailsModal, { isOpen: isModalOpen, onClose: handleCloseModal, admin: selectedAdmin, onDataChange: fetchAdmins }))] }));
};
export default CityAdminsPage;
