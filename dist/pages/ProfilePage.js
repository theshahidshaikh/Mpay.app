import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Phone, Mail, Home, Users, Building, Edit, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
const ProfilePage = () => {
    const { user } = useAuth();
    const [household, setHousehold] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        head_of_house: '',
        members_count: 0,
        male_count: 0,
        female_count: 0,
        contact_number: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    useEffect(() => {
        if (user) {
            fetchHouseholdProfile();
        }
    }, [user]);
    const fetchHouseholdProfile = async () => {
        if (!user)
            return;
        try {
            const { data, error } = await supabase
                .from('households')
                .select(`
          *,
          mosques!inner(name, address)
        `)
                .eq('user_id', user.id)
                .single();
            if (error)
                throw error;
            setHousehold(data);
            setEditData({
                head_of_house: data.head_of_house,
                members_count: data.members_count,
                male_count: data.male_count,
                female_count: data.female_count,
                contact_number: data.contact_number,
            });
        }
        catch (error) {
            console.error('Error fetching household profile:', error);
            toast.error('Error loading profile information');
        }
        finally {
            setLoading(false);
        }
    };
    const handleSave = async () => {
        if (!household)
            return;
        // Validate data
        if (editData.male_count + editData.female_count !== editData.members_count) {
            toast.error('Total members count should equal male + female count');
            return;
        }
        setSaving(true);
        try {
            const { error } = await supabase
                .from('households')
                .update({
                head_of_house: editData.head_of_house,
                members_count: editData.members_count,
                male_count: editData.male_count,
                female_count: editData.female_count,
                contact_number: editData.contact_number,
                updated_at: new Date().toISOString(),
            })
                .eq('id', household.id);
            if (error)
                throw error;
            toast.success('Profile updated successfully');
            setIsEditing(false);
            fetchHouseholdProfile();
        }
        catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Error updating profile');
        }
        finally {
            setSaving(false);
        }
    };
    const handleCancel = () => {
        setEditData({
            head_of_house: household?.head_of_house || '',
            members_count: household?.members_count || 0,
            male_count: household?.male_count || 0,
            female_count: household?.female_count || 0,
            contact_number: household?.contact_number || '',
        });
        setIsEditing(false);
    };
    if (loading) {
        return (_jsxs("div", { children: [_jsx(Navbar, {}), _jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" }) })] }));
    }
    if (!household) {
        return (_jsxs("div", { children: [_jsx(Navbar, {}), _jsx("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: _jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900 mb-4", children: "Profile Not Found" }), _jsx("p", { className: "text-gray-600", children: "No household profile found. Please contact your mosque administrator." })] }) })] }));
    }
    return (_jsxs("div", { children: [_jsx(Navbar, {}), _jsxs("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [_jsxs("div", { className: "mb-8 flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Household Profile" }), _jsx("p", { className: "text-gray-600 mt-2", children: "Manage your household information" })] }), !isEditing ? (_jsxs("button", { onClick: () => setIsEditing(true), className: "btn-primary flex items-center", children: [_jsx(Edit, { className: "h-4 w-4 mr-2" }), "Edit Profile"] })) : (_jsxs("div", { className: "flex space-x-3", children: [_jsxs("button", { onClick: handleCancel, className: "btn-secondary flex items-center", disabled: saving, children: [_jsx(X, { className: "h-4 w-4 mr-2" }), "Cancel"] }), _jsxs("button", { onClick: handleSave, className: "btn-primary flex items-center", disabled: saving, children: [saving ? (_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" })) : (_jsx(Save, { className: "h-4 w-4 mr-2" })), "Save Changes"] })] }))] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsx("div", { className: "lg:col-span-1", children: _jsxs("div", { className: "card", children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-900 mb-6 flex items-center", children: [_jsx(User, { className: "h-6 w-6 mr-2 text-primary-600" }), "Account Information"] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-600 mb-1", children: "Full Name" }), _jsx("p", { className: "text-lg font-semibold text-gray-900", children: user?.full_name })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-600 mb-1", children: "Email Address" }), _jsxs("p", { className: "text-gray-900 flex items-center", children: [_jsx(Mail, { className: "h-4 w-4 mr-2 text-gray-400" }), user?.email] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-600 mb-1", children: "Account Type" }), _jsx("span", { className: "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800", children: "Household User" })] })] })] }) }), _jsx("div", { className: "lg:col-span-2", children: _jsxs("div", { className: "card", children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-900 mb-6 flex items-center", children: [_jsx(Home, { className: "h-6 w-6 mr-2 text-primary-600" }), "Household Details"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-600 mb-1", children: "House Number" }), _jsx("p", { className: "text-lg font-semibold text-gray-900", children: household.house_number })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-600 mb-1", children: "Head of House" }), isEditing ? (_jsx("input", { type: "text", value: editData.head_of_house, onChange: (e) => setEditData({ ...editData, head_of_house: e.target.value }), className: "input-field" })) : (_jsx("p", { className: "text-lg font-semibold text-gray-900", children: household.head_of_house }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-600 mb-1", children: "Contact Number" }), isEditing ? (_jsx("input", { type: "tel", value: editData.contact_number, onChange: (e) => setEditData({ ...editData, contact_number: e.target.value }), className: "input-field" })) : (_jsxs("p", { className: "text-gray-900 flex items-center", children: [_jsx(Phone, { className: "h-4 w-4 mr-2 text-gray-400" }), household.contact_number] }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-600 mb-1", children: "Total Members" }), isEditing ? (_jsx("input", { type: "number", min: "1", value: editData.members_count, onChange: (e) => setEditData({ ...editData, members_count: parseInt(e.target.value) }), className: "input-field" })) : (_jsxs("p", { className: "text-lg font-semibold text-gray-900 flex items-center", children: [_jsx(Users, { className: "h-5 w-5 mr-2 text-primary-600" }), household.members_count] }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-600 mb-1", children: "Male Members" }), isEditing ? (_jsx("input", { type: "number", min: "0", value: editData.male_count, onChange: (e) => setEditData({ ...editData, male_count: parseInt(e.target.value) }), className: "input-field" })) : (_jsx("p", { className: "text-lg font-semibold text-gray-900", children: household.male_count }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-600 mb-1", children: "Female Members" }), isEditing ? (_jsx("input", { type: "number", min: "0", value: editData.female_count, onChange: (e) => setEditData({ ...editData, female_count: parseInt(e.target.value) }), className: "input-field" })) : (_jsx("p", { className: "text-lg font-semibold text-gray-900", children: household.female_count }))] })] }), isEditing && editData.male_count + editData.female_count !== editData.members_count && (_jsx("div", { className: "mt-4 p-3 bg-red-50 border border-red-200 rounded-lg", children: _jsxs("p", { className: "text-sm text-red-600", children: ["Total members (", editData.members_count, ") should equal male (", editData.male_count, ") + female (", editData.female_count, ") count."] }) }))] }) })] }), _jsx("div", { className: "mt-8", children: _jsxs("div", { className: "card", children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-900 mb-6 flex items-center", children: [_jsx(Building, { className: "h-6 w-6 mr-2 text-primary-600" }), "Mosque Information"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-600 mb-1", children: "Mosque Name" }), _jsx("p", { className: "text-lg font-semibold text-gray-900", children: household.mosque?.name })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-600 mb-1", children: "Address" }), _jsx("p", { className: "text-gray-900", children: household.mosque?.address })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-600 mb-1", children: "Annual Collection Amount" }), _jsxs("p", { className: "text-lg font-semibold text-primary-600", children: ["\u20B9", household.annual_amount.toLocaleString()] }), _jsxs("p", { className: "text-sm text-gray-500", children: ["Monthly: \u20B9", (household.annual_amount / 12).toFixed(0)] })] })] })] }) })] })] }));
};
export default ProfilePage;
