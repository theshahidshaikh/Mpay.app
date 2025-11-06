import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Building, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];
const RegisterPage = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [role, setRole] = useState('household');
    // State for the new contact number field
    const [contactNumber, setContactNumber] = useState('');
    const [mosquesInCity, setmosquesInCity] = useState([]);
    const [selectedmosqueId, setSelectedmosqueId] = useState('');
    const [householdDetails, setHouseholdDetails] = useState({
        house_number: '',
        male_count: '',
        female_count: '',
        monthly_amount: '',
    });
    const [minMonthlyAmount, setMinMonthlyAmount] = useState(null);
    const [mosqueDetails, setmosqueDetails] = useState({ name: '', address: '', monthly_amount: '500' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchmosques = async () => {
            if (city.length < 3) {
                setmosquesInCity([]);
                return;
            }
            try {
                const { data, error } = await supabase.rpc('get_mosques_by_city', { city_name: city });
                if (error)
                    throw error;
                setmosquesInCity(data || []);
            }
            catch (error) {
                console.error('Error fetching mosques:', error);
                setmosquesInCity([]);
            }
        };
        const handler = setTimeout(() => {
            if (role === 'household') {
                fetchmosques();
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [city, role]);
    useEffect(() => {
        const fetchmosqueDetails = async () => {
            if (!selectedmosqueId) {
                setMinMonthlyAmount(null);
                setHouseholdDetails(prev => ({ ...prev, monthly_amount: '' }));
                return;
            }
            try {
                const { data, error } = await supabase
                    .from('mosques')
                    .select('annual_amount')
                    .eq('id', selectedmosqueId)
                    .single();
                if (error)
                    throw error;
                if (data) {
                    const minAmount = Math.round(data.annual_amount / 12);
                    setMinMonthlyAmount(minAmount);
                    setHouseholdDetails(prev => ({ ...prev, monthly_amount: minAmount.toString() }));
                }
            }
            catch (error) {
                toast.error("Could not fetch mosque details.");
            }
        };
        fetchmosqueDetails();
    }, [selectedmosqueId]);
    const handleMonthlyAmountChange = (e) => {
        setHouseholdDetails({ ...householdDetails, monthly_amount: e.target.value });
    };
    const handleMonthlyAmountBlur = () => {
        if (minMonthlyAmount !== null) {
            const currentAmount = parseInt(householdDetails.monthly_amount) || 0;
            if (currentAmount < minMonthlyAmount) {
                toast.error(`Amount cannot be less than the minimum of ₹${minMonthlyAmount}.`);
                setHouseholdDetails({ ...householdDetails, monthly_amount: minMonthlyAmount.toString() });
            }
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword)
            return toast.error('Passwords do not match');
        if (password.length < 6)
            return toast.error('Password must be at least 6 characters');
        const monthlyAmount = parseInt(householdDetails.monthly_amount) || 0;
        if (role === 'household' && minMonthlyAmount && monthlyAmount < minMonthlyAmount) {
            return toast.error(`Contribution cannot be less than the minimum of ₹${minMonthlyAmount}.`);
        }
        setLoading(true);
        const maleCount = parseInt(householdDetails.male_count) || 0;
        const femaleCount = parseInt(householdDetails.female_count) || 0;
        const mosqueMonthlyAmount = parseInt(mosqueDetails.monthly_amount) || 0;
        const body = {
            email, password, fullName, city, state, role,
            contactNumber: contactNumber, // Pass the contact number for both roles
            mosqueId: role === 'household' ? selectedmosqueId : undefined,
            householdDetails: role === 'household' ? {
                ...householdDetails,
                male_count: maleCount,
                female_count: femaleCount,
                members_count: maleCount + femaleCount,
                annual_amount: monthlyAmount * 12,
            } : undefined,
            mosqueDetails: role === 'mosque_admin' ? {
                name: mosqueDetails.name,
                address: mosqueDetails.address,
                annual_amount: mosqueMonthlyAmount * 12
            } : undefined,
        };
        try {
            const { error } = await supabase.functions.invoke('unified-signup', { body });
            if (error)
                throw new Error(error.message);
            toast.success('Registration successful! Please wait for approval.');
            navigate('/awaiting-approval');
        }
        catch (error) {
            toast.error(error.message || 'Sign-up failed.');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4", children: _jsxs("div", { className: "max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "flex justify-center", children: _jsx(Building, { className: "h-12 w-12 text-primary-600" }) }), _jsx("h2", { className: "mt-6 text-3xl font-bold text-gray-900", children: "Create your account" })] }), _jsxs("form", { className: "mt-8 space-y-6", onSubmit: handleSubmit, children: [_jsxs("div", { className: "space-y-4", children: [_jsx("input", { type: "text", placeholder: "Your Full Name", required: true, value: fullName, onChange: (e) => setFullName(e.target.value), className: "input-field" }), _jsx("input", { type: "email", placeholder: "Email Address", required: true, value: email, onChange: (e) => setEmail(e.target.value), className: "input-field" }), _jsx("input", { type: "tel", placeholder: "Contact Number", required: true, value: contactNumber, onChange: (e) => setContactNumber(e.target.value), className: "input-field" }), _jsxs("select", { value: state, onChange: (e) => setState(e.target.value), className: "input-field", required: true, children: [_jsx("option", { value: "", disabled: true, children: "-- Select Your State --" }), indianStates.map(s => _jsx("option", { value: s, children: s }, s))] }), _jsx("input", { type: "text", placeholder: "City", required: true, value: city, onChange: (e) => setCity(e.target.value), className: "input-field" }), _jsxs("select", { value: role, onChange: (e) => setRole(e.target.value), className: "input-field", children: [_jsx("option", { value: "household", children: "Join a mosque (as a Household)" }), _jsx("option", { value: "mosque_admin", children: "Register a New mosque (as an Admin)" })] })] }), _jsx("hr", {}), role === 'household' && (_jsxs("div", { className: "space-y-4 p-4 border rounded-lg", children: [_jsx("h3", { className: "font-semibold text-center text-gray-700", children: "Household Details" }), _jsx("p", { className: "text-xs text-center text-gray-500 -mt-2", children: "The person registering is considered the head of the house." }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: ["Select a mosque in ", city || 'your city'] }), _jsxs("select", { value: selectedmosqueId, onChange: (e) => setSelectedmosqueId(e.target.value), className: "input-field", required: true, children: [_jsx("option", { value: "", disabled: true, children: "-- Select a mosque --" }), mosquesInCity.map((mosque) => (_jsx("option", { value: mosque.id, children: mosque.name }, mosque.id)))] })] }), _jsx("input", { type: "text", placeholder: "Jamat Number", required: true, value: householdDetails.house_number, onChange: (e) => setHouseholdDetails({ ...householdDetails, house_number: e.target.value }), className: "input-field" }), _jsx("input", { type: "number", placeholder: "Number of Male Members", required: true, min: "0", value: householdDetails.male_count, onChange: (e) => setHouseholdDetails({ ...householdDetails, male_count: e.target.value }), className: "input-field" }), _jsx("input", { type: "number", placeholder: "Number of Female Members", required: true, min: "0", value: householdDetails.female_count, onChange: (e) => setHouseholdDetails({ ...householdDetails, female_count: e.target.value }), className: "input-field" }), selectedmosqueId && minMonthlyAmount !== null && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Your Monthly Contribution" }), _jsx("input", { type: "number", placeholder: "Monthly Amount", required: true, min: minMonthlyAmount, value: householdDetails.monthly_amount, onChange: handleMonthlyAmountChange, onBlur: handleMonthlyAmountBlur, className: "input-field" }), _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: ["Minimum amount for this mosque is \u20B9", minMonthlyAmount, "."] })] }))] })), role === 'mosque_admin' && (_jsxs("div", { className: "space-y-4 p-4 border rounded-lg", children: [_jsx("h3", { className: "font-semibold text-center text-gray-700", children: "New mosque Details" }), _jsx("input", { type: "text", placeholder: "mosque Name", required: true, value: mosqueDetails.name, onChange: (e) => setmosqueDetails({ ...mosqueDetails, name: e.target.value }), className: "input-field" }), _jsx("input", { type: "text", placeholder: "mosque Address", required: true, value: mosqueDetails.address, onChange: (e) => setmosqueDetails({ ...mosqueDetails, address: e.target.value }), className: "input-field" }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Default Monthly Amount" }), _jsx("input", { type: "number", required: true, value: mosqueDetails.monthly_amount, onChange: (e) => setmosqueDetails({ ...mosqueDetails, monthly_amount: e.target.value }), className: "input-field" })] })] })), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Password *" }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: showPassword ? 'text' : 'password', required: true, value: password, onChange: (e) => setPassword(e.target.value), className: "input-field", placeholder: "Create a password" }), _jsx("button", { type: "button", className: "absolute inset-y-0 right-0 pr-3 flex items-center", onClick: () => setShowPassword(!showPassword), children: showPassword ? _jsx(EyeOff, { className: "h-5 w-5 text-gray-400" }) : _jsx(Eye, { className: "h-5 w-5 text-gray-400" }) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Confirm Password *" }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: showConfirmPassword ? 'text' : 'password', required: true, value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), className: "input-field", placeholder: "Confirm your password" }), _jsx("button", { type: "button", className: "absolute inset-y-0 right-0 pr-3 flex items-center", onClick: () => setShowConfirmPassword(!showConfirmPassword), children: showConfirmPassword ? _jsx(EyeOff, { className: "h-5 w-5 text-gray-400" }) : _jsx(Eye, { className: "h-5 w-5 text-gray-400" }) })] })] })] }), _jsx("div", { children: _jsx("button", { type: "submit", disabled: loading, className: "btn-primary w-full", children: loading ? _jsx("div", { className: "animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto" }) : 'Create Account' }) }), _jsx("div", { className: "text-center", children: _jsxs("p", { className: "text-sm text-gray-600", children: ["Already have an account?", ' ', _jsx(Link, { to: "/login", className: "font-medium text-primary-600 hover:text-primary-500", children: "Sign in here" })] }) })] })] }) }));
};
export default RegisterPage;
