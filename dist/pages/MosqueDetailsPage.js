import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { MapPin, ArrowLeft, Users, DollarSign, TrendingUp, User, Phone, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
const MosqueDetailsPage = () => {
    const { user } = useAuth();
    const { mosqueId } = useParams();
    const navigate = useNavigate();
    const [details, setDetails] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    // State for delete modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const fetchData = useCallback(async () => {
        if (!mosqueId)
            return;
        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('get_mosque_details_with_year', {
                p_mosque_id: mosqueId,
                p_year: selectedYear,
            });
            if (error)
                throw error;
            if (data && data.details && data.stats) {
                setDetails(data.details);
                setStats(data.stats);
            }
            else {
                throw new Error("Mosque data not found.");
            }
        }
        catch (error) {
            toast.error(error.message || 'Failed to load mosque details.');
            navigate(-1);
        }
        finally {
            setLoading(false);
        }
    }, [mosqueId, selectedYear, navigate]);
    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user, fetchData]);
    const confirmDelete = async () => {
        if (!details)
            return;
        setIsDeleting(true);
        const toastId = toast.loading('Deleting mosque...');
        try {
            const { error } = await supabase.functions.invoke('delete-mosque', {
                body: { mosqueId: details.id },
            });
            if (error)
                throw new Error(error.message);
            toast.success('Mosque deleted successfully!', { id: toastId });
            navigate('/super/mosques');
        }
        catch (error) {
            toast.error(error.message || 'Failed to delete mosque.', { id: toastId });
            setIsDeleting(false);
        }
    };
    if (loading || !details || !stats) {
        return (_jsxs("div", { children: [_jsx(Navbar, {}), _jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" }) })] }));
    }
    return (_jsxs("div", { children: [_jsx(Navbar, {}), _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [_jsxs("div", { className: "mb-8", children: [_jsxs("button", { onClick: () => navigate(-1), className: "flex items-center text-base text-gray-500 hover:text-gray-700 mb-4", children: [_jsx(ArrowLeft, { className: "h-5 w-5 mr-2 " }), "Back"] }), _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: details.name }), _jsxs("p", { className: "text-gray-600 mt-2 flex items-center", children: [_jsx(MapPin, { className: "h-5 w-5 mr-2" }), " ", details.address, ", ", details.city, ", ", details.state] }), _jsxs("div", { className: "mt-4 space-y-2 text-gray-700", children: [_jsxs("p", { className: "flex items-center", children: [_jsx(User, { className: "h-5 w-5 mr-2" }), " Admin: ", _jsx("span", { className: "font-medium ml-1", children: details.admin_name })] }), _jsxs("p", { className: "flex items-center", children: [_jsx(Phone, { className: "h-5 w-5 mr-2" }), " Contact: ", _jsx("span", { className: "font-medium ml-1", children: details.admin_contact || 'N/A' })] })] })] }), (user?.role === 'super_admin' || user?.role === 'city_admin') && (_jsx("button", { onClick: () => setShowDeleteModal(true), className: "btn-Denger ml-4", children: "Delete Mosque" }))] })] }), _jsxs("div", { className: "mb-8", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "View Stats for Year" }), _jsx("select", { value: selectedYear, onChange: (e) => setSelectedYear(parseInt(e.target.value)), className: "input-field w-full md:w-1/4", children: [2024, 2025, 2026].map(year => _jsx("option", { value: year, children: year }, year)) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "card", children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-900 mb-4", children: ["Financial Overview (", selectedYear, ")"] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("span", { className: "text-gray-600 flex items-center", children: [_jsx(TrendingUp, { className: "mr-2 h-5 w-5" }), "Expected Collection"] }), " ", _jsxs("span", { className: "font-bold text-lg", children: ["\u20B9", stats.expected_collection.toLocaleString()] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("span", { className: "text-gray-600 flex items-center", children: [_jsx(DollarSign, { className: "mr-2 h-5 w-5 text-green-500" }), "Total Collected"] }), " ", _jsxs("span", { className: "font-bold text-lg text-green-600", children: ["\u20B9", stats.total_collected.toLocaleString()] })] })] })] }), _jsxs("div", { className: "card", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-4", children: "Community Stats" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("span", { className: "text-gray-600 flex items-center", children: [_jsx(Users, { className: "mr-2 h-5 w-5" }), "Total Households"] }), " ", _jsx("span", { className: "font-bold text-lg", children: stats.total_households })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("span", { className: "text-gray-600 flex items-center", children: [_jsx(Users, { className: "mr-2 h-5 w-5" }), "Total Population"] }), " ", _jsx("span", { className: "font-bold text-lg", children: stats.total_population })] }), _jsxs("div", { className: "flex justify-between items-center pl-4", children: [_jsx("span", { className: "text-gray-500", children: "Male" }), " ", _jsx("span", { className: "font-medium", children: stats.male_population })] }), _jsxs("div", { className: "flex justify-between items-center pl-4", children: [_jsx("span", { className: "text-gray-500", children: "Female" }), " ", _jsx("span", { className: "font-medium", children: stats.female_population })] })] })] })] })] }), showDeleteModal && details && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50", children: _jsxs("div", { className: "bg-white rounded-lg p-6 w-full max-w-md shadow-xl", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10", children: _jsx(AlertTriangle, { className: "h-6 w-6 text-red-600" }) }), _jsxs("div", { className: "mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left", children: [_jsx("h3", { className: "text-lg leading-6 font-medium text-gray-900", children: "Delete Mosque" }), _jsx("div", { className: "mt-2", children: _jsxs("p", { className: "text-sm text-gray-500", children: ["Are you sure you want to delete \"", details.name, "\"? This action cannot be undone."] }) })] })] }), _jsxs("div", { className: "mt-5 sm:mt-4 sm:flex sm:flex-row-reverse", children: [_jsx("button", { type: "button", className: "w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 disabled:opacity-50 sm:ml-3 sm:w-auto sm:text-sm", onClick: confirmDelete, disabled: isDeleting, children: isDeleting ? 'Deleting...' : 'Delete' }), _jsx("button", { type: "button", className: "mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm", onClick: () => setShowDeleteModal(false), children: "Cancel" })] })] }) }))] }));
};
export default MosqueDetailsPage;
