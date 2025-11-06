import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, User, Phone, Mail, MapPin, Building, AlertTriangle, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
const CityAdminmosqueAdminDetailsPage = () => {
    const { user } = useAuth();
    const { adminId } = useParams();
    const navigate = useNavigate();
    const [details, setDetails] = useState(null);
    const [mosques, setmosques] = useState([]);
    const [loading, setLoading] = useState(true);
    // State for delete modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const fetchData = useCallback(async () => {
        if (!adminId)
            return;
        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('get_mosque_admin_details', {
                p_admin_id: adminId,
            });
            if (error)
                throw error;
            if (data && data.details) {
                setDetails(data.details);
                setmosques(data.mosques || []);
            }
            else {
                throw new Error("Admin data not found.");
            }
        }
        catch (error) {
            toast.error(error.message || 'Failed to load admin details.');
            navigate(-1);
        }
        finally {
            setLoading(false);
        }
    }, [adminId, navigate]);
    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user, fetchData]);
    const confirmDelete = async () => {
        if (!details)
            return;
        setIsDeleting(true);
        const toastId = toast.loading('Deleting admin...');
        try {
            const { error } = await supabase.functions.invoke('delete-user', {
                body: { userId: details.id },
            });
            if (error)
                throw new Error(error.message);
            toast.success('Admin deleted successfully!', { id: toastId });
            navigate('/city/admins'); // Navigate back to the admins list
        }
        catch (error) {
            toast.error(error.message || 'Failed to delete admin.', { id: toastId });
            setIsDeleting(false);
        }
    };
    if (loading || !details) {
        return (_jsxs("div", { className: "bg-gray-50 min-h-screen", children: [_jsx(Navbar, {}), _jsx("div", { className: "flex items-center justify-center pt-32", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" }) })] }));
    }
    return (_jsxs("div", { className: "bg-gray-50 min-h-screen", children: [_jsx(Navbar, {}), _jsxs("main", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [_jsxs("header", { className: "mb-8", children: [_jsxs("button", { onClick: () => navigate(-1), className: "flex items-center text-base font-medium text-gray-500 hover:text-gray-800 transition-colors mb-6", children: [_jsx(ArrowLeft, { className: "h-5 w-5 mr-2" }), "Back to Admins List"] }), _jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-4xl font-extrabold tracking-tight text-gray-900", children: details.full_name }), _jsx("p", { className: "text-lg text-gray-600 mt-1", children: "mosque Admin Details" })] }), user?.role === 'city_admin' && (_jsx("button", { onClick: () => setShowDeleteModal(true), className: "btn-Denger ml-4", children: "Delete Admin" }))] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8", children: [_jsx("div", { className: "md:col-span-1", children: _jsxs("div", { className: "bg-white p-6 rounded-lg shadow-md", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-4", children: "Contact Information" }), _jsxs("dl", { className: "divide-y divide-gray-200", children: [_jsxs("div", { className: "py-3 flex items-center justify-between", children: [_jsxs("dt", { className: "text-sm font-medium text-gray-500 flex items-center", children: [_jsx(User, { className: "h-5 w-5 mr-3 text-gray-400" }), "Name"] }), _jsx("dd", { className: "text-sm text-gray-900", children: details.full_name })] }), _jsxs("div", { className: "py-3 flex items-center justify-between", children: [_jsxs("dt", { className: "text-sm font-medium text-gray-500 flex items-center", children: [_jsx(Mail, { className: "h-5 w-5 mr-3 text-gray-400" }), "Email"] }), _jsx("dd", { className: "text-sm text-gray-900", children: details.email })] }), _jsxs("div", { className: "py-3 flex items-center justify-between", children: [_jsxs("dt", { className: "text-sm font-medium text-gray-500 flex items-center", children: [_jsx(Phone, { className: "h-5 w-5 mr-3 text-gray-400" }), "Phone"] }), _jsx("dd", { className: "text-sm text-gray-900", children: details.phone || 'N/A' })] }), _jsxs("div", { className: "py-3 flex items-center justify-between", children: [_jsxs("dt", { className: "text-sm font-medium text-gray-500 flex items-center", children: [_jsx(MapPin, { className: "h-5 w-5 mr-3 text-gray-400" }), "City"] }), _jsx("dd", { className: "text-sm text-gray-900", children: details.city })] })] })] }) }), _jsx("div", { className: "md:col-span-2", children: _jsxs("div", { className: "bg-white p-6 rounded-lg shadow-md", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-4", children: "Assigned mosque(s)" }), mosques.length > 0 ? (_jsx("ul", { className: "divide-y divide-gray-200", children: mosques.map(mosque => (_jsxs("li", { className: "py-4 flex items-center justify-between hover:bg-gray-100 rounded-md px-2 -mx-2 transition-colors", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Building, { className: "h-6 w-6 mr-4 text-primary-600" }), _jsx("span", { className: "text-gray-800 font-medium", children: mosque.name })] }), _jsx(ChevronRight, { className: "h-5 w-5 text-gray-400" })] }, mosque.id))) })) : (_jsxs("div", { className: "text-center py-12", children: [_jsx(Building, { className: "h-12 w-12 text-gray-300 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900", children: "No Assigned mosques" }), _jsx("p", { className: "text-gray-500 mt-1", children: "This admin is not currently assigned to any active mosques." })] }))] }) })] })] }), showDeleteModal && details && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50", children: _jsxs("div", { className: "bg-white rounded-lg p-6 w-full max-w-md shadow-xl transform transition-all", children: [_jsxs("div", { className: "sm:flex sm:items-start", children: [_jsx("div", { className: "mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10", children: _jsx(AlertTriangle, { className: "h-6 w-6 text-red-600" }) }), _jsxs("div", { className: "mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left", children: [_jsx("h3", { className: "text-lg leading-6 font-medium text-gray-900", children: "Delete Admin" }), _jsx("div", { className: "mt-2", children: _jsxs("p", { className: "text-sm text-gray-500", children: ["Are you sure you want to delete \"", details.full_name, "\"? This action is permanent and cannot be undone."] }) })] })] }), _jsxs("div", { className: "mt-5 sm:mt-4 sm:flex sm:flex-row-reverse", children: [_jsx("button", { type: "button", className: "btn-danger w-full sm:ml-3 sm:w-auto", onClick: confirmDelete, disabled: isDeleting, children: isDeleting ? 'Deleting...' : 'Delete' }), _jsx("button", { type: "button", className: "btn-secondary mt-3 w-full sm:mt-0 sm:w-auto", onClick: () => setShowDeleteModal(false), children: "Cancel" })] })] }) }))] }));
};
export default CityAdminmosqueAdminDetailsPage;
