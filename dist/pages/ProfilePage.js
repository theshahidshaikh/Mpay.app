import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Mail, Home, Edit, Save, X, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
const ProfilePage = () => {
    const { user, signOut } = useAuth(); // ✅ Destructure signOut from useAuth
    const navigate = useNavigate();
    const [household, setHousehold] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        full_name: '',
        head_of_house: '',
        members_count: 0,
        male_count: 0,
        female_count: 0,
        contact_number: '',
        house_number: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    useEffect(() => {
        if (user) {
            fetchHouseholdProfile();
        }
    }, [user]);
    useEffect(() => {
        if (user && household) {
            setEditData({
                full_name: user.full_name || '',
                head_of_house: household.head_of_house,
                members_count: household.members_count,
                male_count: household.male_count,
                female_count: household.female_count,
                contact_number: household.contact_number,
                house_number: household.house_number,
            });
            setLoading(false);
        }
        else if (user && !household) {
            setLoading(false);
        }
    }, [user, household]);
    const fetchHouseholdProfile = async () => {
        if (!user)
            return;
        try {
            const { data, error } = await supabase
                .from('households')
                .select('*, mosque:mosques!inner(name, address)')
                .eq('user_id', user.id)
                .maybeSingle();
            if (error)
                throw error;
            setHousehold(data);
        }
        catch (error) {
            console.error('Error fetching household profile:', error);
            toast.error('Error loading profile information');
            setLoading(false);
        }
    };
    const handleSave = async () => {
        if (!household || !user) {
            toast.error("User or household data is missing.");
            return;
        }
        if (editData.male_count + editData.female_count !== editData.members_count) {
            toast.error('Total members count should equal male + female count');
            return;
        }
        setSaving(true);
        try {
            const { error: householdError } = await supabase
                .from('households')
                .update({
                head_of_house: editData.head_of_house,
                members_count: editData.members_count,
                male_count: editData.male_count,
                female_count: editData.female_count,
                contact_number: editData.contact_number,
                house_number: editData.house_number,
                updated_at: new Date().toISOString(),
            })
                .eq('id', household.id);
            if (householdError)
                throw householdError;
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                full_name: editData.full_name,
                phone: editData.contact_number,
                updated_at: new Date().toISOString(),
            })
                .eq('id', user.id);
            if (profileError)
                throw profileError;
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
        if (user && household) {
            setEditData({
                full_name: user.full_name || '',
                head_of_house: household.head_of_house,
                members_count: household.members_count,
                male_count: household.male_count,
                female_count: household.female_count,
                contact_number: household.contact_number,
                house_number: household.house_number,
            });
        }
        setIsEditing(false);
    };
    const handleMaleCountChange = (e) => {
        const value = e.target.value;
        const maleCount = value === '' ? 0 : parseInt(value) || 0;
        const femaleCount = editData.female_count;
        setEditData({
            ...editData,
            male_count: maleCount,
            members_count: maleCount + femaleCount,
        });
    };
    const handleFemaleCountChange = (e) => {
        const value = e.target.value;
        const femaleCount = value === '' ? 0 : parseInt(value) || 0;
        const maleCount = editData.male_count;
        setEditData({
            ...editData,
            female_count: femaleCount,
            members_count: maleCount + femaleCount,
        });
    };
    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };
    if (loading) {
        return (_jsxs("div", { children: [_jsx(Navbar, {}), _jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" }) })] }));
    }
    if (!household) {
        return (_jsxs("div", { children: [_jsx(Navbar, {}), _jsx("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: _jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900 mb-4", children: "Profile Not Found" }), _jsx("p", { className: "text-gray-600", children: "No household profile found. Please contact your mosque administrator." })] }) })] }));
    }
    return (_jsxs("div", { className: "bg-gray-50 min-h-screen pb-10", children: [_jsx(Navbar, {}), _jsxs("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [_jsxs("div", { className: "mb-8 flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Profile" }), _jsx("p", { className: "text-gray-600 mt-2", children: "Manage your information" })] }), !isEditing ? (_jsxs("button", { onClick: () => setIsEditing(true), className: "btn-primary flex items-center", children: [_jsx(Edit, { className: "h-4 w-4 mr-2" }), " Edit Profile"] })) : (_jsxs("div", { className: "flex space-x-3", children: [_jsxs("button", { onClick: handleCancel, className: "btn-primary flex items-center", disabled: saving, children: [_jsx(X, { className: "h-4 w-4 mr-2" }), " Cancel"] }), _jsxs("button", { onClick: handleSave, className: "btn-primary flex items-center", disabled: saving, children: [saving ? (_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" })) : (_jsx(Save, { className: "h-4 w-4 mr-2" })), "Save Changes"] })] }))] }), _jsxs("div", { className: "card mb-8", children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-900 mb-6 flex items-center", children: [_jsx(User, { className: "h-6 w-6 mr-2 text-primary-600" }), "Account Information"] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-600 mb-1", children: "Full Name" }), isEditing ? (_jsx("input", { type: "text", value: editData.full_name, onChange: (e) => setEditData({ ...editData, full_name: e.target.value }), className: "input-field" })) : (_jsx("p", { className: "text-lg font-semibold text-gray-900", children: editData.full_name }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-600 mb-1", children: "Head of Household" }), isEditing ? (_jsx("input", { type: "text", value: editData.head_of_house, onChange: (e) => setEditData({ ...editData, head_of_house: e.target.value }), className: "input-field" })) : (_jsx("p", { className: "text-lg font-semibold text-gray-900", children: household.head_of_house }))] }), _jsxs("div", { className: "grid grid-cols-3 gap-4 items-end", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-600 mb-1", children: "Total Members" }), _jsx("p", { className: "text-lg font-semibold text-gray-900", children: editData.members_count })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-600 mb-1", children: "Male Count" }), isEditing ? (_jsx("input", { type: "number", value: editData.male_count === 0 ? '' : editData.male_count, onChange: handleMaleCountChange, className: "input-field" })) : (_jsx("p", { className: "text-lg font-semibold text-gray-900", children: household.male_count }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-600 mb-1", children: "Female Count" }), isEditing ? (_jsx("input", { type: "number", value: editData.female_count === 0 ? '' : editData.female_count, onChange: handleFemaleCountChange, className: "input-field" })) : (_jsx("p", { className: "text-lg font-semibold text-gray-900", children: household.female_count }))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-600 mb-1", children: "Contact Number" }), isEditing ? (_jsx("input", { type: "text", value: editData.contact_number, onChange: (e) => setEditData({ ...editData, contact_number: e.target.value }), className: "input-field" })) : (_jsx("p", { className: "text-lg font-semibold text-gray-900", children: household.contact_number }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-600 mb-1", children: "Jamat Number" }), isEditing ? (_jsx("input", { type: "text", value: editData.house_number, onChange: (e) => setEditData({ ...editData, house_number: e.target.value }), className: "input-field" })) : (_jsx("p", { className: "text-lg font-semibold text-gray-900", children: household.house_number }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-600 mb-1", children: "Email Address" }), _jsxs("p", { className: "text-gray-900 flex items-center", children: [_jsx(Mail, { className: "h-4 w-4 mr-2 text-gray-400" }), user?.email] })] })] })] }), _jsxs("div", { className: "card", children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-900 mb-6 flex items-center", children: [_jsx(Home, { className: "h-6 w-6 mr-2 text-primary-600" }), "Household Information"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Mosque Name" }), _jsx("p", { className: "text-lg font-semibold text-gray-900", children: household.mosque.name })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Mosque Address" }), _jsx("p", { className: "text-lg font-semibold text-gray-900", children: household.mosque.address })] })] })] }), _jsx("div", { className: "mt-8 flex justify-end", children: _jsxs("button", { onClick: handleLogout, className: "btn-Denger flex items-center", children: [_jsx(LogOut, { className: "h-4 w-4 mr-2" }), " Log Out"] }) })] })] }));
};
export default ProfilePage;
