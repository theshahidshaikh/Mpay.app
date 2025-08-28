import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Shield, Save } from 'lucide-react';
import toast from 'react-hot-toast';
const indianStates = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"];
const AdminRegistrationPage = () => {
    const [role, setRole] = useState('city_admin');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading('Submitting registration...');
        try {
            const { data, error } = await supabase.functions.invoke('create-admin', {
                body: {
                    email,
                    password,
                    fullName,
                    role,
                    contactNumber,
                    city: role === 'city_admin' ? city : undefined,
                    state: role === 'city_admin' ? state : undefined,
                },
            });
            if (error)
                throw new Error(error.message);
            if (data.error)
                throw new Error(data.error);
            toast.success('Registration successful! Please wait for approval.', { id: toastId });
            navigate('/awaiting-approval');
        }
        catch (error) {
            toast.error(error.message || 'Failed to register.', { id: toastId });
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4", children: _jsxs("div", { className: "max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg", children: [_jsxs("div", { className: "text-center", children: [_jsx(Shield, { className: "h-12 w-12 text-primary-600 mx-auto" }), _jsx("h2", { className: "mt-6 text-3xl font-bold text-gray-900", children: "Admin Registration" })] }), _jsxs("form", { className: "mt-8 space-y-4", onSubmit: handleSubmit, children: [_jsxs("select", { value: role, onChange: (e) => setRole(e.target.value), className: "input-field", required: true, children: [_jsx("option", { value: "city_admin", children: "City Admin" }), _jsx("option", { value: "super_admin", children: "Super Admin" })] }), _jsx("input", { type: "text", placeholder: "Full Name", value: fullName, onChange: (e) => setFullName(e.target.value), className: "input-field", required: true }), _jsx("input", { type: "email", placeholder: "Email", value: email, onChange: (e) => setEmail(e.target.value), className: "input-field", required: true }), _jsx("input", { type: "password", placeholder: "Password (min. 6 characters)", value: password, onChange: (e) => setPassword(e.target.value), className: "input-field", required: true }), _jsx("input", { type: "text", placeholder: "Contact Number", value: contactNumber, onChange: (e) => setContactNumber(e.target.value), className: "input-field" }), role === 'city_admin' && (_jsxs(_Fragment, { children: [_jsxs("select", { value: state, onChange: (e) => setState(e.target.value), className: "input-field", required: role === 'city_admin', children: [_jsx("option", { value: "", disabled: true, children: "-- Select Assigned State --" }), indianStates.map(s => _jsx("option", { value: s, children: s }, s))] }), _jsx("input", { type: "text", placeholder: "Assigned City", required: role === 'city_admin', value: city, onChange: (e) => setCity(e.target.value), className: "input-field" })] })), _jsx("div", { className: "pt-4", children: _jsxs("button", { type: "submit", disabled: loading, className: "btn-primary w-full", children: [_jsx(Save, { className: "h-5 w-5 mr-2" }), loading ? 'Submitting...' : 'Submit for Approval'] }) })] })] }) }));
};
export default AdminRegistrationPage;
