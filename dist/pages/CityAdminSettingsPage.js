import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Save, Edit, X, LogOut, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
const CityAdminProfilePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState({ full_name: '', email: '', contact_number: '', city: '', state: '' });
    const [originalProfile, setOriginalProfile] = useState({ full_name: '', email: '', contact_number: '', city: '', state: '' });
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [pendingChange, setPendingChange] = useState(null);
    // State for the password change modal
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const fetchData = useCallback(async () => {
        if (!user)
            return;
        setLoading(true);
        try {
            // Fetch profile data
            const { data: profileData, error: profileError } = await supabase.rpc('get_city_admin_profile', {
                p_user_id: user.id,
            });
            if (profileError)
                throw profileError;
            if (profileData) {
                const fetchedProfile = {
                    full_name: profileData.full_name,
                    email: profileData.email,
                    contact_number: profileData.contact_number,
                    city: profileData.city,
                    state: profileData.state,
                };
                setProfile(fetchedProfile);
                setOriginalProfile(fetchedProfile);
            }
            // Check for pending change requests
            const { data: changeRequestData, error: changeRequestError } = await supabase
                .from('profile_change_requests')
                .select('new_city, new_state')
                .eq('user_id', user.id)
                .eq('status', 'pending')
                .maybeSingle();
            if (changeRequestError)
                throw changeRequestError;
            setPendingChange(changeRequestData);
        }
        catch (error) {
            toast.error(error.message || 'Failed to load profile.');
        }
        finally {
            setLoading(false);
        }
    }, [user]);
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!user)
            return;
        setIsUpdating(true);
        const toastId = toast.loading('Saving changes...');
        const locationChanged = profile.city !== originalProfile.city || profile.state !== originalProfile.state;
        const detailsChanged = profile.full_name !== originalProfile.full_name || profile.contact_number !== originalProfile.contact_number;
        try {
            if (locationChanged) {
                const { error: requestError } = await supabase.functions.invoke('request-profile-change', {
                    body: { userId: user.id, newCity: profile.city, newState: profile.state },
                });
                if (requestError)
                    throw new Error(requestError.message);
                toast.success('Location change request submitted for approval.', { id: toastId });
            }
            if (detailsChanged) {
                const { error: updateError } = await supabase
                    .from('admin_profiles')
                    .update({ full_name: profile.full_name, contact_number: profile.contact_number })
                    .eq('id', user.id);
                if (updateError)
                    throw updateError;
                if (!locationChanged) {
                    toast.success('Profile updated successfully!', { id: toastId });
                }
            }
            if (!locationChanged && !detailsChanged) {
                toast.dismiss(toastId);
                toast.success('No changes to save.');
            }
            setIsEditing(false);
            fetchData();
        }
        catch (error) {
            toast.error(error.message || 'Failed to save changes.', { id: toastId });
        }
        finally {
            setIsUpdating(false);
        }
    };
    const handleCancelEdit = () => {
        setProfile(originalProfile);
        setIsEditing(false);
    };
    const handlePasswordChangeSubmit = async (e) => {
        e.preventDefault();
        if (!currentPassword) {
            return toast.error('Please enter your current password.');
        }
        if (newPassword !== confirmNewPassword) {
            return toast.error('New passwords do not match.');
        }
        if (newPassword.length < 6) {
            return toast.error('Password must be at least 6 characters long.');
        }
        setIsUpdating(true);
        const toastId = toast.loading('Verifying and changing password...');
        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: profile.email,
                password: currentPassword,
            });
            if (signInError) {
                throw new Error('Incorrect current password. Please try again.');
            }
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword,
            });
            if (updateError)
                throw updateError;
            toast.success('Password changed successfully!', { id: toastId });
            setShowPasswordModal(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        }
        catch (error) {
            toast.error(error.message || 'Failed to change password.', { id: toastId });
        }
        finally {
            setIsUpdating(false);
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
    if (loading) {
        return (_jsxs("div", { className: "bg-gray-50 min-h-screen", children: [_jsx(Navbar, {}), _jsx("div", { className: "flex items-center justify-center pt-32", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" }) })] }));
    }
    return (_jsxs("div", { className: "bg-gray-50 min-h-screen", children: [_jsx(Navbar, {}), _jsxs("main", { className: "max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [_jsxs("div", { className: "bg-white rounded-lg shadow-md p-6 mb-8 flex items-center space-x-6", children: [_jsx("div", { className: "flex-shrink-0 h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center", children: _jsx(User, { className: "h-10 w-10 text-primary-600" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: profile.full_name }), _jsx("p", { className: "text-gray-600", children: profile.email }), _jsx("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2", children: "City Administrator" })] })] }), pendingChange && (_jsx("div", { className: "bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-r-lg", children: _jsxs("div", { className: "flex", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx(AlertCircle, { className: "h-5 w-5 text-yellow-400" }) }), _jsx("div", { className: "ml-3", children: _jsxs("p", { className: "text-sm text-yellow-700", children: ["You have a pending request to change your location to ", _jsxs("span", { className: "font-medium", children: [pendingChange.new_city, ", ", pendingChange.new_state] }), "."] }) })] }) })), _jsx("div", { className: "bg-white p-6 rounded-lg shadow-md mb-8", children: _jsxs("form", { onSubmit: handleUpdateProfile, children: [_jsxs("div", { className: "flex justify-between items-center mb-6 border-b pb-4", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Personal Information" }), !isEditing && (_jsxs("button", { type: "button", onClick: () => setIsEditing(true), className: "btn-secondary", children: [_jsx(Edit, { className: "h-4 w-4 mr-2" }), "Edit Profile"] }))] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-3 items-center", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Full Name" }), _jsx("div", { className: "col-span-2", children: isEditing ? (_jsx("input", { type: "text", value: profile.full_name, onChange: (e) => setProfile({ ...profile, full_name: e.target.value }), className: "input-field" })) : (_jsx("p", { className: "text-gray-800", children: profile.full_name })) })] }), _jsxs("div", { className: "grid grid-cols-3 items-center", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Contact Number" }), _jsx("div", { className: "col-span-2", children: isEditing ? (_jsx("input", { type: "text", value: profile.contact_number || '', onChange: (e) => setProfile({ ...profile, contact_number: e.target.value }), className: "input-field" })) : (_jsx("p", { className: "text-gray-800", children: profile.contact_number || 'N/A' })) })] }), _jsxs("div", { className: "grid grid-cols-3 items-center", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "State" }), _jsx("div", { className: "col-span-2", children: isEditing ? (_jsx("input", { type: "text", value: profile.state || '', onChange: (e) => setProfile({ ...profile, state: e.target.value }), disabled: !!pendingChange, className: `input-field ${!!pendingChange ? 'bg-gray-100 cursor-not-allowed' : ''}` })) : (_jsx("p", { className: "text-gray-800", children: profile.state })) })] }), _jsxs("div", { className: "grid grid-cols-3 items-center", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "City" }), _jsx("div", { className: "col-span-2", children: isEditing ? (_jsx("input", { type: "text", value: profile.city || '', onChange: (e) => setProfile({ ...profile, city: e.target.value }), disabled: !!pendingChange, className: `input-field ${!!pendingChange ? 'bg-gray-100 cursor-not-allowed' : ''}` })) : (_jsx("p", { className: "text-gray-800", children: profile.city })) })] })] }), isEditing && (_jsxs("div", { className: "pt-6 mt-6 border-t flex justify-end space-x-3", children: [_jsxs("button", { type: "button", onClick: handleCancelEdit, className: "btn-secondary", children: [_jsx(X, { className: "h-5 w-5 mr-2" }), " Cancel"] }), _jsxs("button", { type: "submit", className: "btn-primary", disabled: isUpdating, children: [_jsx(Save, { className: "h-5 w-5 mr-2" }), " ", isUpdating ? 'Saving...' : 'Save Changes'] })] }))] }) }), _jsxs("div", { className: "bg-white p-6 rounded-lg shadow-md", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-6", children: "Account Security" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center p-4 border rounded-lg", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium text-gray-800", children: "Password" }), _jsx("p", { className: "text-sm text-gray-500", children: "Change your password to keep your account secure." })] }), _jsx("button", { onClick: () => setShowPasswordModal(true), className: "btn-secondary", children: "Change" })] }), _jsxs("div", { className: "flex justify-between items-center p-4 border rounded-lg bg-red-50 border-red-200", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium text-red-800", children: "Log Out" }), _jsx("p", { className: "text-sm text-red-600", children: "You will be returned to the login screen." })] }), _jsxs("button", { onClick: handleLogout, className: "btn-danger-outline", children: [_jsx(LogOut, { className: "h-4 w-4 mr-2" }), "Log Out"] })] })] })] })] }), showPasswordModal && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50", children: _jsxs("div", { className: "bg-white rounded-lg p-6 w-full max-w-md shadow-xl", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Change Password" }), _jsxs("form", { onSubmit: handlePasswordChangeSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Current Password" }), _jsx("input", { type: "password", value: currentPassword, onChange: (e) => setCurrentPassword(e.target.value), className: "input-field mt-1", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "New Password" }), _jsx("input", { type: "password", value: newPassword, onChange: (e) => setNewPassword(e.target.value), className: "input-field mt-1", placeholder: "At least 6 characters", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Confirm New Password" }), _jsx("input", { type: "password", value: confirmNewPassword, onChange: (e) => setConfirmNewPassword(e.target.value), className: "input-field mt-1", required: true })] }), _jsx("div", { className: "pt-4 flex justify-end items-center", children: _jsxs("div", { className: "space-x-3", children: [_jsx("button", { type: "button", onClick: () => setShowPasswordModal(false), className: "btn-secondary", children: "Cancel" }), _jsx("button", { type: "submit", className: "btn-primary", disabled: isUpdating, children: isUpdating ? 'Saving...' : 'Save' })] }) })] })] }) }))] }));
};
export default CityAdminProfilePage;
