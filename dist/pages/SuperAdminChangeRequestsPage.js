import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabase';
import { Check, X, User, MapPin, ArrowRight, Clock, Inbox } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
const SuperAdminChangeRequestsPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('get_all_profile_change_requests');
            if (error)
                throw error;
            setRequests(data || []);
        }
        catch (error) {
            toast.error(error.message || 'Failed to load change requests.');
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    const handleRequest = async (requestId, action) => {
        const toastId = toast.loading(`${action === 'approve' ? 'Approving' : 'Rejecting'} request...`);
        try {
            const { error } = await supabase.functions.invoke('approve-request', {
                body: { requestId, requestType: 'profile_change', action },
            });
            if (error)
                throw new Error(error.message);
            toast.success(`Request ${action === 'approve' ? 'approved' : 'rejected'} successfully!`, { id: toastId });
            fetchData(); // Refresh the list
        }
        catch (error) {
            toast.error(error.message || 'Failed to process request.', { id: toastId });
        }
    };
    if (loading) {
        return (_jsxs("div", { className: "bg-gray-50 min-h-screen", children: [_jsx(Navbar, {}), _jsx("div", { className: "flex items-center justify-center pt-32", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" }) })] }));
    }
    return (_jsxs("div", { className: "bg-gray-50 min-h-screen", children: [_jsx(Navbar, {}), _jsxs("main", { className: "max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [_jsxs("header", { className: "mb-8", children: [_jsx("h1", { className: "text-3xl font-bold tracking-tight text-gray-900", children: "Profile Change Requests" }), _jsx("p", { className: "text-lg text-gray-600 mt-1", children: "Review and approve location changes for City Admins." })] }), _jsx("div", { className: "bg-white p-6 rounded-lg shadow-md", children: requests.length > 0 ? (_jsx("div", { className: "space-y-6", children: requests.map((req) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "flex flex-col sm:flex-row justify-between sm:items-center mb-4", children: [_jsxs("div", { children: [_jsxs("p", { className: "font-semibold text-lg text-gray-900 flex items-center", children: [_jsx(User, { className: "h-5 w-5 mr-2 text-gray-500" }), req.full_name] }), _jsxs("p", { className: "text-sm text-gray-500 flex items-center mt-1", children: [_jsx(Clock, { className: "h-4 w-4 mr-2" }), "Requested on: ", format(new Date(req.requested_at), 'PPP')] })] }), _jsxs("div", { className: "flex space-x-3 mt-4 sm:mt-0", children: [_jsxs("button", { onClick: () => handleRequest(req.request_id, 'reject'), className: "btn-danger-outline", children: [_jsx(X, { className: "h-5 w-5 mr-2" }), " Reject"] }), _jsxs("button", { onClick: () => handleRequest(req.request_id, 'approve'), className: "btn-primary", children: [_jsx(Check, { className: "h-5 w-5 mr-2" }), " Approve"] })] })] }), _jsxs("div", { className: "bg-gray-50 rounded-md p-4 flex items-center justify-center space-x-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-xs text-gray-500 uppercase", children: "From" }), _jsxs("p", { className: "font-medium text-gray-800 flex items-center", children: [_jsx(MapPin, { className: "h-4 w-4 mr-1" }), " ", req.current_city, ", ", req.current_state] })] }), _jsx(ArrowRight, { className: "h-6 w-6 text-gray-400 flex-shrink-0" }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-xs text-primary-700 uppercase font-semibold", children: "To" }), _jsxs("p", { className: "font-bold text-primary-700 flex items-center", children: [_jsx(MapPin, { className: "h-4 w-4 mr-1" }), " ", req.new_city, ", ", req.new_state] })] })] })] }, req.request_id))) })) : (_jsxs("div", { className: "text-center py-12", children: [_jsx(Inbox, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900", children: "All Clear!" }), _jsx("p", { className: "text-gray-500 mt-1", children: "There are no pending profile change requests." })] })) })] })] }));
};
export default SuperAdminChangeRequestsPage;
