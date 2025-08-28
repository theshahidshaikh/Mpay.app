import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Calendar, DollarSign, CheckCircle, AlertCircle, ArrowLeft, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
const PaymentPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [household, setHousehold] = useState(null);
    const [payments, setPayments] = useState([]);
    const [selectedMonths, setSelectedMonths] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [screenshotFile, setScreenshotFile] = useState(null);
    const [paymentStep, setPaymentStep] = useState(1);
    const currentYear = new Date().getFullYear();
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const fetchData = useCallback(async () => {
        if (!user)
            return;
        setLoading(true);
        try {
            // Use a left join to prevent crashes if a household is not linked to a mosque.
            const { data: householdData, error: householdError } = await supabase
                .from('households')
                .select(`
          *,
          mosques(name, upi_id) 
        `)
                .eq('user_id', user.id)
                .single();
            if (householdError)
                throw householdError;
            if (!householdData) {
                toast.error("Could not find household details.");
                setLoading(false);
                return;
            }
            setHousehold(householdData);
            // Fetch payments for the current year
            const { data: paymentsData, error: paymentsError } = await supabase
                .from('payments')
                .select('*')
                .eq('household_id', householdData.id)
                .eq('year', currentYear);
            if (paymentsError)
                throw paymentsError;
            setPayments(paymentsData || []);
        }
        catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Error loading payment information.');
        }
        finally {
            setLoading(false);
        }
    }, [user, currentYear]);
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    const getPaymentStatus = (month) => {
        const payment = payments.find(p => p.month === month);
        return payment?.status || 'unpaid';
    };
    const handleMonthSelect = (month) => {
        const status = getPaymentStatus(month);
        // Prevent selecting months that are already paid or pending
        if (status === 'paid' || status === 'pending_verification')
            return;
        setSelectedMonths(prev => prev.includes(month)
            ? prev.filter(m => m !== month)
            : [...prev, month].sort((a, b) => a - b));
    };
    const calculateTotal = () => {
        if (!household)
            return 0;
        const monthlyAmount = household.annual_amount / 12;
        return selectedMonths.length * monthlyAmount;
    };
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setScreenshotFile(e.target.files[0]);
        }
    };
    const submitForVerification = async () => {
        if (!household || selectedMonths.length === 0 || !screenshotFile) {
            toast.error("Please select at least one month and upload a screenshot.");
            return;
        }
        setProcessing(true);
        try {
            const monthlyAmount = household.annual_amount / 12;
            // 1. Upload the screenshot to Supabase Storage
            const fileName = `${user?.id}/${Date.now()}_${screenshotFile.name}`;
            const { error: uploadError } = await supabase.storage
                .from('payment_screenshot') // Ensure this bucket name is correct
                .upload(fileName, screenshotFile);
            if (uploadError)
                throw uploadError;
            // 2. Get the public URL of the uploaded file
            const { data: { publicUrl } } = supabase.storage
                .from('payment_screenshot')
                .getPublicUrl(fileName);
            // 3. Create a payment record for each selected month
            const paymentPromises = selectedMonths.map(month => supabase.from('payments').insert({
                household_id: household.id,
                amount: monthlyAmount,
                payment_date: new Date().toISOString(),
                month,
                year: currentYear,
                payment_method: 'upi',
                status: 'pending_verification', // Set status to pending
                receipt_url: publicUrl, // Match the column name in your database schema
                created_by: user?.id,
            }));
            await Promise.all(paymentPromises);
            toast.success(`Payment submitted for verification!`);
            // Reset state after successful submission
            setSelectedMonths([]);
            setShowPaymentForm(false);
            setScreenshotFile(null);
            setPaymentStep(1);
            fetchData(); // Refresh data to show pending status
        }
        catch (error) {
            console.error('Error submitting for verification:', error);
            toast.error('Submission failed. Please try again.');
        }
        finally {
            setProcessing(false);
        }
    };
    if (loading) {
        return (_jsxs("div", { children: [_jsx(Navbar, {}), _jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" }) })] }));
    }
    if (!household) {
        return (_jsxs("div", { children: [_jsx(Navbar, {}), _jsx("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20", children: _jsxs("div", { className: "card text-center py-16", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-800", children: "Could Not Load Household Data" }), _jsx("p", { className: "text-gray-600 mt-2", children: "Please check your connection or contact your mosque admin." })] }) })] }));
    }
    const totalAmount = calculateTotal();
    const upiId = household?.mosques?.upi_id || 'your-mosque@upi';
    const upiLink = `upi://pay?pa=${upiId}&pn=Mosque%20Collection&am=${totalAmount.toFixed(2)}&cu=INR`;
    return (_jsxs("div", { children: [_jsx(Navbar, {}), _jsxs("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20", children: [_jsxs("div", { className: "mb-8", children: [_jsxs("button", { onClick: () => navigate('/household/dashboard'), className: "hidden md:flex items-center text-primary-600 hover:text-primary-700 mb-4", children: [_jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }), "Back to Dashboard"] }), _jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Make Payment" }), _jsx("p", { className: "text-gray-600 mt-2", children: "Pay your monthly mosque collection via UPI and upload a receipt." })] }), _jsxs("div", { className: "card mb-8", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-4", children: "Payment Details" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "House Number" }), _jsx("p", { className: "text-lg font-semibold text-gray-900", children: household.house_number })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Head of House" }), _jsx("p", { className: "text-lg font-semibold text-gray-900", children: household.head_of_house })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Monthly Amount" }), _jsxs("p", { className: "text-lg font-semibold text-primary-600 flex items-center", children: [_jsx(DollarSign, { className: "h-5 w-5 mr-1" }), "\u20B9", (household.annual_amount / 12).toFixed(0)] })] })] })] }), _jsxs("div", { className: "card mb-8", children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-900 mb-6 flex items-center", children: [_jsx(Calendar, { className: "h-6 w-6 mr-2 text-primary-600" }), "Select Months to Pay (", currentYear, ")"] }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6", children: months.map((month, index) => {
                                    const monthNumber = index + 1;
                                    const status = getPaymentStatus(monthNumber);
                                    const isSelected = selectedMonths.includes(monthNumber);
                                    const isPaid = status === 'paid';
                                    const isPending = status === 'pending_verification';
                                    return (_jsxs("button", { onClick: () => handleMonthSelect(monthNumber), disabled: isPaid || isPending, className: `p-4 rounded-lg border-2 transition-all duration-200 text-left ${isPaid ? 'border-green-200 bg-green-50 cursor-not-allowed'
                                            : isPending ? 'border-yellow-300 bg-yellow-50 cursor-not-allowed'
                                                : isSelected ? 'border-primary-500 bg-primary-50'
                                                    : 'border-gray-200 bg-white hover:border-gray-300'}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium text-gray-900", children: month }), isPaid ? _jsx(CheckCircle, { className: "h-5 w-5 text-green-600" })
                                                        : isPending ? _jsx(AlertCircle, { className: "h-5 w-5 text-yellow-600" })
                                                            : isSelected ? _jsx(CheckCircle, { className: "h-5 w-5 text-primary-600" })
                                                                : _jsx("div", { className: "h-5 w-5 rounded-full border-2 border-gray-300" })] }), _jsxs("div", { className: "text-xs text-gray-600 mb-1", children: ["\u20B9", (household.annual_amount / 12).toFixed(0)] }), _jsx("div", { className: `text-xs font-medium px-2 py-1 rounded-full inline-block ${isPaid ? 'bg-green-100 text-green-800'
                                                    : isPending ? 'bg-yellow-100 text-yellow-800'
                                                        : isSelected ? 'bg-primary-100 text-primary-800'
                                                            : 'bg-gray-100 text-gray-800'}`, children: isPaid ? 'Paid' : isPending ? 'Pending' : isSelected ? 'Selected' : 'Unpaid' })] }, month));
                                }) }), selectedMonths.length > 0 && (_jsx("div", { className: "bg-primary-50 border border-primary-200 rounded-lg p-4", children: _jsxs("div", { className: "flex flex-col sm:flex-row justify-between sm:items-center gap-2", children: [_jsxs("p", { className: "text-primary-700", children: [selectedMonths.length, " month(s) selected for a total of ", _jsxs("span", { className: "font-bold", children: ["\u20B9", totalAmount.toLocaleString()] })] }), _jsx("button", { onClick: () => setShowPaymentForm(true), className: "btn-primary flex-shrink-0", children: "Proceed to Pay" })] }) }))] }), showPaymentForm && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: _jsxs("div", { className: "bg-white rounded-lg p-6 w-full max-w-md", children: [paymentStep === 1 && (_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Step 1: Make UPI Payment" }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4 mb-6 text-center", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Pay the total amount to the mosque's UPI ID." }), _jsx("p", { className: "font-bold text-primary-600 text-lg my-2", children: upiId }), _jsxs("p", { className: "font-bold text-2xl", children: ["\u20B9", totalAmount.toLocaleString()] }), _jsx("a", { href: upiLink, className: "btn-primary w-full mt-4", target: "_blank", rel: "noopener noreferrer", children: "Pay using UPI App" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("button", { onClick: () => { setShowPaymentForm(false); setPaymentStep(1); }, className: "btn-secondary", children: "Cancel" }), _jsx("button", { onClick: () => setPaymentStep(2), className: "btn-primary", children: "I have paid, Next Step" })] })] })), paymentStep === 2 && (_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Step 2: Upload Screenshot" }), _jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Upload your payment confirmation screenshot for verification." }), _jsx("div", { className: "mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md", children: _jsxs("div", { className: "space-y-1 text-center", children: [_jsx(Upload, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsxs("div", { className: "flex text-sm text-gray-600", children: [_jsxs("label", { htmlFor: "file-upload", className: "relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500", children: [_jsx("span", { children: "Upload a file" }), _jsx("input", { id: "file-upload", name: "file-upload", type: "file", className: "sr-only", onChange: handleFileChange, accept: "image/*" })] }), _jsx("p", { className: "pl-1", children: "or drag and drop" })] }), screenshotFile && _jsx("p", { className: "text-xs text-gray-500 mt-2", children: screenshotFile.name })] }) })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("button", { onClick: () => setPaymentStep(1), className: "btn-secondary", children: "Back" }), _jsx("button", { onClick: submitForVerification, className: "btn-primary", disabled: !screenshotFile || processing, children: processing ? 'Submitting...' : 'Submit for Verification' })] })] }))] }) }))] })] }));
};
export default PaymentPage;
