import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Hourglass, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
const AwaitingApprovalPage = () => {
    const navigate = useNavigate();
    const handleLogout = async () => {
        const toastId = toast.loading('Logging out...');
        try {
            const { error } = await supabase.auth.signOut();
            if (error)
                throw error;
            toast.success('Logged out successfully', { id: toastId });
            navigate('/login');
        }
        catch (error) {
            toast.error(error.message || 'Failed to log out.', { id: toastId });
        }
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50", children: _jsxs("div", { className: "max-w-md w-full text-center p-8 bg-white rounded-xl shadow-lg", children: [_jsx("div", { className: "flex justify-center", children: _jsx(Hourglass, { className: "h-16 w-16 text-primary-600" }) }), _jsx("h2", { className: "mt-6 text-3xl font-bold text-gray-900", children: "Registration Submitted" }), _jsx("p", { className: "mt-4 text-gray-600", children: "Thank you for registering. Your account is currently pending approval from an administrator." }), _jsx("p", { className: "mt-2 text-gray-600", children: "You will be notified once your account has been activated." }), _jsx("div", { className: "mt-8", children: _jsxs("button", { onClick: handleLogout, className: "btn-secondary w-full flex items-center justify-center", children: [_jsx(LogOut, { className: "h-5 w-5 mr-2" }), "Log Out"] }) })] }) }));
};
export default AwaitingApprovalPage;
