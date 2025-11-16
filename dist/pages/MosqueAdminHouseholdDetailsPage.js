import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Home, Phone, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
const mosqueAdminHouseholdDetailsPage = () => {
    const { user } = useAuth();
    const { householdId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialStartMonth = parseInt(queryParams.get('startMonth') || '1');
    const initialStartYear = parseInt(queryParams.get('startYear') || new Date().getFullYear().toString());
    const initialEndMonth = parseInt(queryParams.get('endMonth') || '12');
    const initialEndYear = parseInt(queryParams.get('endYear') || new Date().getFullYear().toString());
    const [details, setDetails] = useState(null);
    const [monthStatuses, setMonthStatuses] = useState([]);
    const [loading, setLoading] = useState(true);
    // --- NEW: State for the editable date range filters ---
    const [startMonth, setStartMonth] = useState(initialStartMonth);
    const [startYear, setStartYear] = useState(initialStartYear);
    const [endMonth, setEndMonth] = useState(initialEndMonth);
    const [endYear, setEndYear] = useState(initialEndYear);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const years = [new Date().getFullYear() - 2, new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1];
    const fetchData = useCallback(async () => {
        if (!householdId)
            return;
        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('get_household_payment_details', {
                p_household_id: householdId,
                start_year: initialStartYear,
                start_month: initialStartMonth,
                end_year: initialEndYear,
                end_month: initialEndMonth,
            });
            if (error)
                throw error;
            setDetails(data.details);
            const allMonths = [];
            const paidMonths = new Set(data.payments.map((p) => `${p.month}-${p.year}`));
            let currentDate = new Date(initialStartYear, initialStartMonth - 1);
            const lastDate = new Date(initialEndYear, initialEndMonth - 1);
            while (currentDate <= lastDate) {
                const month = currentDate.getMonth() + 1;
                const year = currentDate.getFullYear();
                allMonths.push({
                    month: months[month - 1],
                    month_number: month,
                    year: year,
                    status: paidMonths.has(`${month}-${year}`) ? 'paid' : 'unpaid',
                });
                currentDate.setMonth(currentDate.getMonth() + 1);
            }
            setMonthStatuses(allMonths);
        }
        catch (error) {
            toast.error(error.message || 'Failed to load details.');
            navigate(-1);
        }
        finally {
            setLoading(false);
        }
    }, [householdId, initialStartMonth, initialStartYear, initialEndMonth, initialEndYear, navigate]);
    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user, fetchData]);
    // --- NEW: Handler to apply the new date range ---
    const handleFilterApply = () => {
        navigate(`?startMonth=${startMonth}&startYear=${startYear}&endMonth=${endMonth}&endYear=${endYear}`);
    };
    const totalPaid = monthStatuses.filter(m => m.status === 'paid').length;
    const totalUnpaid = monthStatuses.filter(m => m.status === 'unpaid').length;
    const monthlyAmount = details ? details.annual_amount / 12 : 0;
    const totalDue = totalUnpaid * monthlyAmount;
    if (loading || !details) {
        return (_jsxs("div", { className: "bg-gray-50 min-h-screen", children: [_jsx(Navbar, {}), _jsx("div", { className: "flex items-center justify-center pt-32", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" }) })] }));
    }
    return (_jsxs("div", { className: "bg-gray-50 min-h-screen", children: [_jsx(Navbar, {}), _jsxs("main", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [_jsxs("header", { className: "mb-8", children: [_jsxs(Link, { to: "/admin/dashboard", className: "flex items-center text-base font-medium text-gray-500 hover:text-gray-800 transition-colors mb-4", children: [_jsx(ArrowLeft, { className: "h-5 w-5 mr-2" }), "Back to Reporting"] }), _jsxs("div", { className: "bg-white p-6 rounded-lg shadow-md", children: [_jsx("h1", { className: "text-3xl font-bold tracking-tight text-gray-900", children: details.head_of_house }), _jsxs("div", { className: "text-lg text-gray-600 mt-2 space-y-2", children: [_jsxs("p", { className: "flex items-center", children: [_jsx(Home, { className: "h-5 w-5 mr-3 text-gray-400" }), "House No: ", _jsx("span", { className: "font-medium ml-2", children: details.house_number })] }), _jsxs("p", { className: "flex items-center", children: [_jsx(Phone, { className: "h-5 w-5 mr-3 text-gray-400" }), "Contact: ", _jsx("span", { className: "font-medium ml-2", children: details.contact_number })] })] })] })] }), _jsx("div", { className: "bg-white p-6 rounded-lg shadow-md mb-8", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 items-end", children: [_jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Select Date Range" }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-xs text-gray-500", children: "From" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("select", { value: startMonth, onChange: (e) => setStartMonth(Number(e.target.value)), className: "input-field w-full", children: months.map((m, i) => _jsx("option", { value: i + 1, children: m }, i)) }), _jsx("select", { value: startYear, onChange: (e) => setStartYear(Number(e.target.value)), className: "input-field w-full", children: years.map(y => _jsx("option", { value: y, children: y }, y)) })] })] }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-xs text-gray-500", children: "To" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("select", { value: endMonth, onChange: (e) => setEndMonth(Number(e.target.value)), className: "input-field w-full", children: months.map((m, i) => _jsx("option", { value: i + 1, children: m }, i)) }), _jsx("select", { value: endYear, onChange: (e) => setEndYear(Number(e.target.value)), className: "input-field w-full", children: years.map(y => _jsx("option", { value: y, children: y }, y)) })] })] })] })] }), _jsx("button", { onClick: handleFilterApply, className: "btn-primary w-full", children: "Apply Filter" })] }) }), _jsxs("div", { className: "bg-white p-6 rounded-lg shadow-md", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-6", children: "Payment History" }), _jsxs("div", { className: "grid grid-cols-3 gap-4 mb-6 border-b pb-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm text-gray-500", children: "Paid Months" }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: totalPaid })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm text-gray-500", children: "Unpaid Months" }), _jsx("p", { className: "text-2xl font-bold text-red-600", children: totalUnpaid })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm text-gray-500", children: "Total Due" }), _jsxs("p", { className: "text-2xl font-bold text-gray-800", children: ["\u20B9", totalDue.toLocaleString()] })] })] }), _jsx("ul", { className: "space-y-3", children: monthStatuses.map((item, index) => (_jsxs("li", { className: "flex items-center justify-between p-3 rounded-lg bg-gray-50", children: [_jsx("div", { children: _jsxs("p", { className: "font-semibold text-gray-800", children: [item.month, " ", _jsx("span", { className: "text-gray-500 font-normal", children: item.year })] }) }), _jsx("div", { className: "flex items-center space-x-4", children: item.status === 'paid' ?
                                                (_jsxs("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800", children: [_jsx(Check, { className: "h-4 w-4 mr-1.5" }), " Paid"] })) :
                                                (_jsxs("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700", children: [_jsx(X, { className: "h-4 w-4 mr-1.5" }), " Unpaid"] })) })] }, index))) })] })] })] }));
};
export default mosqueAdminHouseholdDetailsPage;
