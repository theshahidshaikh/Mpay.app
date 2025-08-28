import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  ArrowLeft,
  Upload
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Household {
  id: string;
  house_number: string;
  head_of_house: string;
  annual_amount: number;
  mosques: {
    name: string;
    upi_id: string; // Assuming you have added this column to your 'mosques' table
  } | null; // Allow mosques to be null
}

interface Payment {
  id: string;
  month: number;
  year: number;
  amount: number;
  status: string;
}

const PaymentPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [household, setHousehold] = useState<Household | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [paymentStep, setPaymentStep] = useState(1);
  
  const currentYear = new Date().getFullYear();
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const fetchData = useCallback(async () => {
    if (!user) return;
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

      if (householdError) throw householdError;
      
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

      if (paymentsError) throw paymentsError;
      setPayments(paymentsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error loading payment information.');
    } finally {
      setLoading(false);
    }
  }, [user, currentYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getPaymentStatus = (month: number) => {
    const payment = payments.find(p => p.month === month);
    return payment?.status || 'unpaid';
  };

  const handleMonthSelect = (month: number) => {
    const status = getPaymentStatus(month);
    // Prevent selecting months that are already paid or pending
    if (status === 'paid' || status === 'pending_verification') return;

    setSelectedMonths(prev => 
      prev.includes(month) 
        ? prev.filter(m => m !== month)
        : [...prev, month].sort((a, b) => a - b)
    );
  };

  const calculateTotal = () => {
    if (!household) return 0;
    const monthlyAmount = household.annual_amount / 12;
    return selectedMonths.length * monthlyAmount;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      if (uploadError) throw uploadError;

      // 2. Get the public URL of the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('payment_screenshot')
        .getPublicUrl(fileName);

      // 3. Create a payment record for each selected month
      const paymentPromises = selectedMonths.map(month => 
        supabase.from('payments').insert({
          household_id: household.id,
          amount: monthlyAmount,
          payment_date: new Date().toISOString(),
          month,
          year: currentYear,
          payment_method: 'upi',
          status: 'pending_verification', // Set status to pending
          receipt_url: publicUrl, // Match the column name in your database schema
          created_by: user?.id,
        })
      );
      
      await Promise.all(paymentPromises);

      toast.success(`Payment submitted for verification!`);
      
      // Reset state after successful submission
      setSelectedMonths([]);
      setShowPaymentForm(false);
      setScreenshotFile(null);
      setPaymentStep(1);
      fetchData(); // Refresh data to show pending status

    } catch (error) {
      console.error('Error submitting for verification:', error);
      toast.error('Submission failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }
  
  if (!household) {
     return (
      <div>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
            <div className="card text-center py-16">
                <h2 className="text-xl font-semibold text-gray-800">Could Not Load Household Data</h2>
                <p className="text-gray-600 mt-2">Please check your connection or contact your mosque admin.</p>
            </div>
        </div>
      </div>
    );
  }

  const totalAmount = calculateTotal();
  const upiId = household?.mosques?.upi_id || 'your-mosque@upi';
  const upiLink = `upi://pay?pa=${upiId}&pn=Mosque%20Collection&am=${totalAmount.toFixed(2)}&cu=INR`;

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        <div className="mb-8">
          <button
            onClick={() => navigate('/household/dashboard')}
            className="hidden md:flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Make Payment</h1>
          <p className="text-gray-600 mt-2">Pay your monthly mosque collection via UPI and upload a receipt.</p>
        </div>

        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">House Number</p>
              <p className="text-lg font-semibold text-gray-900">{household.house_number}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Head of House</p>
              <p className="text-lg font-semibold text-gray-900">{household.head_of_house}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Amount</p>
              <p className="text-lg font-semibold text-primary-600 flex items-center">
                <DollarSign className="h-5 w-5 mr-1" />
                ₹{(household.annual_amount / 12).toFixed(0)}
              </p>
            </div>
          </div>
        </div>

        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Calendar className="h-6 w-6 mr-2 text-primary-600" />
            Select Months to Pay ({currentYear})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {months.map((month, index) => {
              const monthNumber = index + 1;
              const status = getPaymentStatus(monthNumber);
              const isSelected = selectedMonths.includes(monthNumber);
              const isPaid = status === 'paid';
              const isPending = status === 'pending_verification';
              
              return (
                <button
                  key={month}
                  onClick={() => handleMonthSelect(monthNumber)}
                  disabled={isPaid || isPending}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    isPaid ? 'border-green-200 bg-green-50 cursor-not-allowed'
                    : isPending ? 'border-yellow-300 bg-yellow-50 cursor-not-allowed'
                    : isSelected ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{month}</span>
                    {isPaid ? <CheckCircle className="h-5 w-5 text-green-600" />
                    : isPending ? <AlertCircle className="h-5 w-5 text-yellow-600" />
                    : isSelected ? <CheckCircle className="h-5 w-5 text-primary-600" />
                    : <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>}
                  </div>
                  <div className="text-xs text-gray-600 mb-1">₹{(household.annual_amount / 12).toFixed(0)}</div>
                  <div className={`text-xs font-medium px-2 py-1 rounded-full inline-block ${
                    isPaid ? 'bg-green-100 text-green-800'
                    : isPending ? 'bg-yellow-100 text-yellow-800'
                    : isSelected ? 'bg-primary-100 text-primary-800'
                    : 'bg-gray-100 text-gray-800'
                  }`}>
                    {isPaid ? 'Paid' : isPending ? 'Pending' : isSelected ? 'Selected' : 'Unpaid'}
                  </div>
                </button>
              );
            })}
          </div>
          {selectedMonths.length > 0 && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <p className="text-primary-700">
                  {selectedMonths.length} month(s) selected for a total of <span className="font-bold">₹{totalAmount.toLocaleString()}</span>
                </p>
                <button onClick={() => setShowPaymentForm(true)} className="btn-primary flex-shrink-0">
                  Proceed to Pay
                </button>
              </div>
            </div>
          )}
        </div>

        {showPaymentForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              {paymentStep === 1 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Step 1: Make UPI Payment</h3>
                  <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center">
                    <p className="text-sm text-gray-600">Pay the total amount to the mosque's UPI ID.</p>
                    <p className="font-bold text-primary-600 text-lg my-2">{upiId}</p>
                    <p className="font-bold text-2xl">₹{totalAmount.toLocaleString()}</p>
                    <a href={upiLink} className="btn-primary w-full mt-4" target="_blank" rel="noopener noreferrer">
                      Pay using UPI App
                    </a>
                  </div>
                  <div className="flex justify-between items-center">
                    <button onClick={() => { setShowPaymentForm(false); setPaymentStep(1); }} className="btn-secondary">Cancel</button>
                    <button onClick={() => setPaymentStep(2)} className="btn-primary">I have paid, Next Step</button>
                  </div>
                </div>
              )}
              {paymentStep === 2 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Step 2: Upload Screenshot</h3>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload your payment confirmation screenshot for verification.
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500">
                            <span>Upload a file</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        {screenshotFile && <p className="text-xs text-gray-500 mt-2">{screenshotFile.name}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <button onClick={() => setPaymentStep(1)} className="btn-secondary">Back</button>
                    <button onClick={submitForVerification} className="btn-primary" disabled={!screenshotFile || processing}>
                      {processing ? 'Submitting...' : 'Submit for Verification'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
