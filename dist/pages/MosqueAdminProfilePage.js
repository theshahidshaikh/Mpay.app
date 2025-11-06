import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Save, Edit, X, LogOut, Building, Wallet } from 'lucide-react'; // 👈 Added Wallet icon
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
const mosqueAdminProfilePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [mosque, setmosque] = useState(null);
    const [originalProfile, setOriginalProfile] = useState(null);
    const [originalmosque, setOriginalmosque] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const fetchData = useCallback(async () => {
        if (!user)
            return;
        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('get_mosque_admin_profile', { p_user_id: user.id });
            if (error)
                throw error;
            if (data) {
                setProfile(data.profile);
                setmosque(data.mosque);
                setOriginalProfile(data.profile);
                setOriginalmosque(data.mosque);
            }
        }
        catch (error) {
            toast.error(error.message || 'Failed to load profile.');
        }
        finally {
            setLoading(false);
        }
    }, [user]);
    useEffect(() => { fetchData(); }, [fetchData]);
    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!user || !profile || !mosque)
            return;
        setIsUpdating(true);
        const toastId = toast.loading('Updating profile...');
        try {
            // The existing edge function should handle the new 'upi_id' field automatically 
            // as long as it's passed in the 'mosqueUpdates' object.
            const { error } = await supabase.functions.invoke('update-mosque-profile', {
                body: { userId: user.id, profileUpdates: profile, mosqueUpdates: mosque },
            });
            if (error)
                throw new Error(error.message);
            toast.success('Profile updated successfully!', { id: toastId });
            setOriginalProfile(profile);
            setOriginalmosque(mosque);
            setIsEditing(false);
        }
        catch (error) {
            toast.error(error.message || 'Failed to update profile.', { id: toastId });
        }
        finally {
            setIsUpdating(false);
        }
    };
    const handleCancelEdit = () => {
        setProfile(originalProfile);
        setmosque(originalmosque);
        setIsEditing(false);
    };
    const handlePasswordChangeSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword)
            return toast.error('Passwords do not match.');
        if (newPassword.length < 6)
            return toast.error('Password must be at least 6 characters.');
        setIsUpdating(true);
        const toastId = toast.loading('Changing password...');
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        setIsUpdating(false);
        if (error) {
            toast.error(error.message || 'Failed to change password.', { id: toastId });
        }
        else {
            toast.success('Password changed successfully!', { id: toastId });
            setShowPasswordModal(false);
            setNewPassword('');
            setConfirmNewPassword('');
        }
    };
    const handleLogout = async () => {
        const toastId = toast.loading('Logging out...');
        const { error } = await supabase.auth.signOut();
        if (error) {
            toast.error(error.message, { id: toastId });
        }
        else {
            toast.success('Logged out successfully', { id: toastId });
            navigate('/login');
        }
    };
    if (loading || !profile || !mosque) {
        return (_jsxs("div", { className: "bg-gray-50 min-h-screen", children: [_jsx(Navbar, {}), _jsx("div", { className: "flex items-center justify-center pt-32", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" }) })] }));
    }
    return (_jsxs("div", { className: "bg-gray-50 min-h-screen", children: [_jsx(Navbar, {}), _jsxs("main", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [_jsxs("form", { onSubmit: handleUpdate, children: [_jsx("header", { className: "mb-8", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold tracking-tight text-gray-900", children: "My Profile" }), _jsx("p", { className: "text-lg text-gray-600 mt-1", children: "Manage your personal and mosque details." })] }), !isEditing && (_jsxs("button", { type: "button", onClick: () => setIsEditing(true), className: "btn-secondary", children: [_jsx(Edit, { className: "h-4 w-4 mr-2" }), " Edit Profile"] }))] }) }), _jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "bg-white p-6 rounded-lg shadow-md", children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-900 mb-6 flex items-center", children: [_jsx(User, { className: "h-6 w-6 mr-3 text-primary-600" }), " Personal Information"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "label", children: "Full Name" }), _jsx("input", { type: "text", value: profile.full_name, onChange: (e) => setProfile({ ...profile, full_name: e.target.value }), readOnly: !isEditing, className: `input-field ${!isEditing ? 'bg-gray-100' : ''}` })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Contact Number" }), _jsx("input", { type: "text", value: profile.contact_number || '', onChange: (e) => setProfile({ ...profile, contact_number: e.target.value }), readOnly: !isEditing, className: `input-field ${!isEditing ? 'bg-gray-100' : ''}` })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Email Address" }), _jsx("input", { type: "email", value: profile.email || '', readOnly: true, className: "input-field bg-gray-100 cursor-not-allowed" })] })] })] }), _jsxs("div", { className: "bg-white p-6 rounded-lg shadow-md", children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-900 mb-6 flex items-center", children: [_jsx(Building, { className: "h-6 w-6 mr-3 text-primary-600" }), " mosque Details"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "label", children: "mosque Name" }), _jsx("input", { type: "text", value: mosque.name, onChange: (e) => setmosque({ ...mosque, name: e.target.value }), readOnly: !isEditing, className: `input-field ${!isEditing ? 'bg-gray-100' : ''}` })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Default Annual Amount" }), _jsx("input", { type: "number", value: mosque.annual_amount, onChange: (e) => setmosque({ ...mosque, annual_amount: parseInt(e.target.value) }), readOnly: !isEditing, className: `input-field ${!isEditing ? 'bg-gray-100' : ''}` })] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "label", children: "mosque Address" }), _jsx("input", { type: "text", value: mosque.address, onChange: (e) => setmosque({ ...mosque, address: e.target.value }), readOnly: !isEditing, className: `input-field ${!isEditing ? 'bg-gray-100' : ''}` })] }), _jsxs("div", { className: "md:col-span-2", children: [_jsxs("label", { className: "label flex items-center", children: [_jsx(Wallet, { className: "h-4 w-4 mr-2 text-gray-500" }), " UPI ID for Collections"] }), _jsx("input", { type: "text", value: mosque.upi_id || '', onChange: (e) => setmosque({ ...mosque, upi_id: e.target.value }), readOnly: !isEditing, className: `input-field ${!isEditing ? 'bg-gray-100' : ''}`, placeholder: !isEditing ? 'Not set' : 'e.g., mosque-name@upi' })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "City" }), _jsx("input", { type: "text", value: profile.city || '', readOnly: true, className: "input-field bg-gray-100 cursor-not-allowed" })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "State" }), _jsx("input", { type: "text", value: profile.state || '', readOnly: true, className: "input-field bg-gray-100 cursor-not-allowed" })] })] })] })] }), isEditing && (_jsxs("div", { className: "mt-8 flex justify-end space-x-3", children: [_jsxs("button", { type: "button", onClick: handleCancelEdit, className: "btn-secondary", children: [_jsx(X, { className: "h-5 w-5 mr-2" }), " Cancel"] }), _jsxs("button", { type: "submit", className: "btn-primary", disabled: isUpdating, children: [_jsx(Save, { className: "h-5 w-5 mr-2" }), " ", isUpdating ? 'Saving...' : 'Save Changes'] })] }))] }), _jsxs("div", { className: "bg-white p-6 rounded-lg shadow-md mt-8", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-6", children: "Account Security" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center p-4 border rounded-lg", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium text-gray-800", children: "Password" }), _jsx("p", { className: "text-sm text-gray-500", children: "Change your password to keep your account secure." })] }), _jsx("button", { onClick: () => setShowPasswordModal(true), className: "btn-secondary", children: "Change" })] }), _jsxs("div", { className: "flex justify-between items-center p-4 border rounded-lg bg-red-50 border-red-200", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium text-red-800", children: "Log Out" }), _jsx("p", { className: "text-sm text-red-600", children: "You will be returned to the login screen." })] }), _jsxs("button", { onClick: handleLogout, className: "btn-danger-outline", children: [_jsx(LogOut, { className: "h-4 w-4 mr-2" }), "Log Out"] })] })] })] })] }), showPasswordModal && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50", children: _jsxs("div", { className: "bg-white rounded-lg p-6 w-full max-w-md shadow-xl", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Change Password" }), _jsxs("form", { onSubmit: handlePasswordChangeSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "New Password" }), _jsx("input", { type: "password", value: newPassword, onChange: (e) => setNewPassword(e.target.value), className: "input-field mt-1", placeholder: "At least 6 characters", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Confirm New Password" }), _jsx("input", { type: "password", value: confirmNewPassword, onChange: (e) => setConfirmNewPassword(e.target.value), className: "input-field mt-1", required: true })] }), _jsx("div", { className: "pt-4 flex justify-end items-center", children: _jsxs("div", { className: "space-x-3", children: [_jsx("button", { type: "button", onClick: () => setShowPasswordModal(false), className: "btn-secondary", children: "Cancel" }), _jsx("button", { type: "submit", className: "btn-primary", disabled: isUpdating, children: isUpdating ? 'Saving...' : 'Save' })] }) })] })] }) }))] }));
};
export default mosqueAdminProfilePage;
