import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  CreditCard, 
  Calendar, 
  IndianRupee, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  ArrowLeft,
  Upload,
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
    upi_id: string; 
  } | null;
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
      const { data: householdData, error: householdError } = await supabase
        .from('households')
        .select(`*, mosques(name, upi_id)`)
        .eq('user_id', user.id)
        .single();

      if (householdError) throw householdError;
      if (!householdData) {
        toast.error("Could not find household details.");
        setLoading(false);
        return;
      }
      setHousehold(householdData);
      console.log('Fetched household data:', householdData);

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

  const getPaymentForMonth = (month: number): Payment | null => {
    return payments.find(p => p.month === month) || null;
  };

  const handleMonthSelect = (month: number) => {
    const status = getPaymentForMonth(month)?.status;
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
  console.log('--- RLS DEBUGGING ---');
  console.log('Current User ID (auth.uid):', user?.id);
  console.log('Household ID being paid for:', household?.id);
  console.log('---------------------');
  if (!household || selectedMonths.length === 0 || !screenshotFile) {
    toast.error("Please select at least one month and upload a screenshot.");
    return;
  }

  setProcessing(true);
  try {
    // Step 1: Re-check selected months in DB
    const { data: currentPayments, error: checkError } = await supabase
      .from('payments')
      .select('id, month, status')
      .eq('household_id', household.id)
      .eq('year', currentYear)
      .in('month', selectedMonths);


    if (checkError) throw checkError;

    const monthlyAmount = household.annual_amount / 12;
    const totalAmount = selectedMonths.length * monthlyAmount;

    // Step 2: Upload screenshot
    const fileName = `${user?.id}/${Date.now()}_${screenshotFile.name}`;
    const { error: uploadError } = await supabase.storage
      .from('payment_screenshot')
      .upload(fileName, screenshotFile);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('payment_screenshot')
      .getPublicUrl(fileName);

    const paymentDate = new Date().toISOString();

    // Step 3: Create a new payment_group
    const { data: groupData, error: groupError } = await supabase
      .from('payment_groups')
      .insert({
        household_id: household.id,
        total_amount: totalAmount,
        screenshot_url: publicUrl,
        status: 'pending',
        paid_at: paymentDate,
        created_by: user?.id,
      })
      .select()
      .single();

    if (groupError) throw groupError;
    const groupId = groupData.id;

    // Step 4: Insert/Update monthly payments linked to group
    const dbOperations = selectedMonths.map(month => {
      const existingPayment = currentPayments.find(p => p.month === month);

      if (existingPayment && existingPayment.status === 'rejected') {
        return supabase.from('payments').update({
          status: 'pending',
          receipt_url: publicUrl,
          payment_date: paymentDate,
          payment_group_id: groupId,
          rejection_reason: null,
        }).eq('id', existingPayment.id);
      } else if (!existingPayment) {
        return supabase.from('payments').insert({
          household_id: household.id,
          amount: monthlyAmount,
          payment_date: paymentDate,
          month,
          year: currentYear,
          payment_method: 'upi',
          status: 'pending',
          receipt_url: publicUrl,
          payment_group_id: groupId,
          created_by: user?.id,
        });
      }
      return Promise.resolve({ error: null });
    });

    const results = await Promise.all(dbOperations);
    for (const result of results) {
      if (result && result.error) throw result.error;
    }

    toast.success("Payment submitted for verification!");

    // Step 5: Reset form + reload
    setSelectedMonths([]);
    setShowPaymentForm(false);
    setScreenshotFile(null);
    setPaymentStep(1);
    fetchData();

  } catch (error: any) {
    console.error("Error submitting payment group:", error);
    toast.error(error.message || "Submission failed. Please try again.");
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
                <p className="text-gray-600 mt-2">Please contact your mosque admin.</p>
            </div>
        </div>
      </div>
    );
  }

  const totalAmount = calculateTotal();
  const upiId = household?.mosques?.upi_id || 'your-mosque@upi';
  const upiLink = `upi://pay?pa=${upiId}&pn=mosque%20Collection&am=${totalAmount.toFixed(2)}&cu=INR`;

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        <div className="card mb-8 bg-white p-6 rounded-lg shadow-md">
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
              <p className="text-sm font-medium text-gray-600">Jamat Number</p>
              <p className="text-lg font-semibold text-gray-900">{household.house_number}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Head of House</p>
              <p className="text-lg font-semibold text-gray-900">{household.head_of_house}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Amount</p>
              <p className="text-lg font-semibold text-primary-600 flex items-center">
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
              const status = getPaymentForMonth(monthNumber)?.status || 'unpaid';
              const isSelected = selectedMonths.includes(monthNumber);
              const isPaid = status === 'paid';
              const isPending = status === 'pending';
              const isRejected = status === 'rejected';
              
              return (
                <button
                  key={month}
                  onClick={() => handleMonthSelect(monthNumber)}
                  disabled={isPaid || isPending}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    isPaid ? 'border-green-200 bg-green-50 cursor-not-allowed'
                    : isPending ? 'border-yellow-300 bg-yellow-50 cursor-not-allowed'
                    : isRejected ? 'border-red-300 bg-red-50 hover:bg-red-100'
                    : isSelected ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{month}</span>
                    {isPaid ? <CheckCircle className="h-5 w-5 text-green-600" />
                    : isPending ? <AlertCircle className="h-5 w-5 text-yellow-600" />
                    : isRejected ? <XCircle className="h-5 w-5 text-red-600" />
                    : isSelected ? <CheckCircle className="h-5 w-5 text-primary-600" />
                    : <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>}
                  </div>
                  <div className="text-xs text-gray-600 mb-1">₹{(household.annual_amount / 12).toFixed(0)}</div>
                  <div className={`text-xs font-medium px-2 py-1 rounded-full inline-block ${
                    isPaid ? 'bg-green-100 text-green-800'
                    : isPending ? 'bg-yellow-100 text-yellow-800'
                    : isRejected ? 'bg-red-100 text-red-800'
                    : isSelected ? 'bg-primary-100 text-primary-800'
                    : 'bg-gray-100 text-gray-800'
                  }`}>
                    {isPaid ? 'Paid' : isPending ? 'Pending' : isRejected ? 'Rejected' : isSelected ? 'Selected' : 'Unpaid'}
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
                  <div className="bg-red-50 rounded-lg p-4 mb-10 text">
                    <p className="text-sm text-black-600">1.Pay the total amount to the Masjid's UPI ID.</p>
                    <p className="text-sm text-black-600">2.Take Screenshot after payment</p>
                    <p className="text-sm text-black-600">3.Comeback after payment to upload Screenshot</p>
                    <p className="font-bold text-primary-600 text-lg my-2 text-center">{upiId}</p>
                    <p className="font-bold text-2xl text-center">₹{totalAmount.toLocaleString()}</p>
                    <a href={upiLink} className="btn-primary w-full mt-4" target="_blank" rel="noopener noreferrer">
                      Pay using UPI App
                    </a>
                  </div>
                  <div className="flex justify-between items-center">
                    <button onClick={() => { setShowPaymentForm(false); setPaymentStep(1); }} className="btn-primary">Cancel</button>
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
                    <button onClick={() => setPaymentStep(1)} className="btn-primary">Back</button>
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
