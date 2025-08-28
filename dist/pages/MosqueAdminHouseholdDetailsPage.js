import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Home, Phone, Check } from 'lucide-react';
import toast from 'react-hot-toast';
const MosqueAdminHouseholdDetailsPage = () => {
    const { user } = useAuth();
    const { householdId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    // Get date range from query parameters
    const queryParams = new URLSearchParams(location.search);
    const startMonth = parseInt(queryParams.get('startMonth') || '1');
    const startYear = parseInt(queryParams.get('startYear') || new Date().getFullYear().toString());
    const endMonth = parseInt(queryParams.get('endMonth') || '12');
    const endYear = parseInt(queryParams.get('endYear') || new Date().getFullYear().toString());
    const [details, setDetails] = useState(null);
    const [monthStatuses, setMonthStatuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const fetchData = useCallback(async () => {
        if (!householdId)
            return;
        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('get_household_payment_details', {
                p_household_id: householdId,
                start_year: startYear,
                start_month: startMonth,
                end_year: endYear,
                end_month: endMonth,
            });
            if (error)
                throw error;
            setDetails(data.details);
            // Generate all months in the range and set their status
            const allMonths = [];
            const paidMonths = new Set(data.payments.map((p) => `${p.month}-${p.year}`));
            let currentDate = new Date(startYear, startMonth - 1);
            const lastDate = new Date(endYear, endMonth - 1);
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
    }, [householdId, startMonth, startYear, endMonth, endYear, navigate]);
    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user, fetchData]);
    const markPaymentAsPaid = async (month, year) => {
        if (!details)
            return;
        const toastId = toast.loading('Marking payment as paid...');
        try {
            const { error } = await supabase.from('payments').insert({
                household_id: details.id,
                amount: details.annual_amount / 12,
                payment_date: new Date().toISOString(),
                month: month,
                year: year,
                status: 'paid',
            });
            if (error)
                throw error;
            toast.success('Payment marked as paid', { id: toastId });
            fetchData();
        }
        catch (error) {
            toast.error(error.message || 'Error updating payment', { id: toastId });
        }
    };
    const totalPaid = monthStatuses.filter(m => m.status === 'paid').length;
    const totalUnpaid = monthStatuses.filter(m => m.status === 'unpaid').length;
    const monthlyAmount = details ? details.annual_amount / 12 : 0;
    const totalDue = totalUnpaid * monthlyAmount;
    if (loading || !details) {
        return (_jsxs("div", { className: "bg-gray-50 min-h-screen", children: [_jsx(Navbar, {}), _jsx("div", { className: "flex items-center justify-center pt-32", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" }) })] }));
    }
    return (_jsxs("div", { className: "bg-gray-50 min-h-screen", children: [_jsx(Navbar, {}), _jsxs("main", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [_jsxs("header", { className: "mb-8", children: [_jsxs("button", { onClick: () => navigate(-1), className: "flex items-center text-base font-medium text-gray-500 hover:text-gray-800 transition-colors mb-4", children: [_jsx(ArrowLeft, { className: "h-5 w-5 mr-2" }), "Back to Dashboard"] }), _jsxs("div", { className: "bg-white p-6 rounded-lg shadow-md", children: [_jsx("h1", { className: "text-3xl font-bold tracking-tight text-gray-900", children: details.head_of_house }), _jsxs("div", { className: "text-lg text-gray-600 mt-2 space-y-2", children: [_jsxs("p", { className: "flex items-center", children: [_jsx(Home, { className: "h-5 w-5 mr-3 text-gray-400" }), "House No: ", _jsx("span", { className: "font-medium ml-2", children: details.house_number })] }), _jsxs("p", { className: "flex items-center", children: [_jsx(Phone, { className: "h-5 w-5 mr-3 text-gray-400" }), "Contact: ", _jsx("span", { className: "font-medium ml-2", children: details.contact_number })] })] })] })] }), _jsxs("div", { className: "bg-white p-6 rounded-lg shadow-md", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-6", children: "Payment History" }), _jsxs("div", { className: "grid grid-cols-3 gap-4 mb-6 border-b pb-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm text-gray-500", children: "Paid Months" }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: totalPaid })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm text-gray-500", children: "Unpaid Months" }), _jsx("p", { className: "text-2xl font-bold text-red-600", children: totalUnpaid })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm text-gray-500", children: "Total Due" }), _jsxs("p", { className: "text-2xl font-bold text-gray-800", children: ["\u20B9", totalDue.toLocaleString()] })] })] }), _jsx("ul", { className: "space-y-3", children: monthStatuses.map((item, index) => (_jsxs("li", { className: "flex items-center justify-between p-3 rounded-lg bg-gray-50", children: [_jsx("div", { children: _jsxs("p", { className: "font-semibold text-gray-800", children: [item.month, " ", _jsx("span", { className: "text-gray-500 font-normal", children: item.year })] }) }), _jsx("div", { className: "flex items-center space-x-4", children: item.status === 'paid' ?
                                                (_jsxs("span", { className: "status-paid inline-flex items-center", children: [_jsx(Check, { className: "h-4 w-4 mr-1.5" }), " Paid"] })) :
                                                (_jsx("button", { onClick: () => markPaymentAsPaid(item.month_number, item.year), className: "btn-primary-outline text-sm", children: "Mark as Paid" })) })] }, index))) })] })] })] }));
};
export default MosqueAdminHouseholdDetailsPage;
