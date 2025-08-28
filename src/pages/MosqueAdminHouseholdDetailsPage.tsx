import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, User, Home, Phone, Check, X, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

// Interfaces for the data
interface HouseholdDetails {
  id: string;
  head_of_house: string;
  house_number: string;
  contact_number: string;
  annual_amount: number;
}
interface Payment {
  month: number;
  year: number;
}
interface MonthStatus {
    month: string;
    month_number: number;
    year: number;
    status: 'paid' | 'unpaid';
}

const MosqueAdminHouseholdDetailsPage: React.FC = () => {
  const { user } = useAuth();
  const { householdId } = useParams<{ householdId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Get date range from query parameters
  const queryParams = new URLSearchParams(location.search);
  const startMonth = parseInt(queryParams.get('startMonth') || '1');
  const startYear = parseInt(queryParams.get('startYear') || new Date().getFullYear().toString());
  const endMonth = parseInt(queryParams.get('endMonth') || '12');
  const endYear = parseInt(queryParams.get('endYear') || new Date().getFullYear().toString());

  const [details, setDetails] = useState<HouseholdDetails | null>(null);
  const [monthStatuses, setMonthStatuses] = useState<MonthStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const fetchData = useCallback(async () => {
    if (!householdId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_household_payment_details', {
        p_household_id: householdId,
        start_year: startYear,
        start_month: startMonth,
        end_year: endYear,
        end_month: endMonth,
      });

      if (error) throw error;
      setDetails(data.details);

      // Generate all months in the range and set their status
      const allMonths: MonthStatus[] = [];
      const paidMonths = new Set(data.payments.map((p: Payment) => `${p.month}-${p.year}`));
      
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

    } catch (error: any) {
      toast.error(error.message || 'Failed to load details.');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }, [householdId, startMonth, startYear, endMonth, endYear, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  const markPaymentAsPaid = async (month: number, year: number) => {
    if (!details) return;
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
      if (error) throw error;
      toast.success('Payment marked as paid', { id: toastId });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Error updating payment', { id: toastId });
    }
  };

  const totalPaid = monthStatuses.filter(m => m.status === 'paid').length;
  const totalUnpaid = monthStatuses.filter(m => m.status === 'unpaid').length;
  const monthlyAmount = details ? details.annual_amount / 12 : 0;
  const totalDue = totalUnpaid * monthlyAmount;

  if (loading || !details) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center text-base font-medium text-gray-500 hover:text-gray-800 transition-colors mb-4">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{details.head_of_house}</h1>
            <div className="text-lg text-gray-600 mt-2 space-y-2">
                <p className="flex items-center"><Home className="h-5 w-5 mr-3 text-gray-400"/>House No: <span className="font-medium ml-2">{details.house_number}</span></p>
                <p className="flex items-center"><Phone className="h-5 w-5 mr-3 text-gray-400"/>Contact: <span className="font-medium ml-2">{details.contact_number}</span></p>
            </div>
          </div>
        </header>

        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment History</h2>
            
            {/* Payment Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6 border-b pb-6">
                <div className="text-center">
                    <p className="text-sm text-gray-500">Paid Months</p>
                    <p className="text-2xl font-bold text-green-600">{totalPaid}</p>
                </div>
                <div className="text-center">
                    <p className="text-sm text-gray-500">Unpaid Months</p>
                    <p className="text-2xl font-bold text-red-600">{totalUnpaid}</p>
                </div>
                <div className="text-center">
                    <p className="text-sm text-gray-500">Total Due</p>
                    <p className="text-2xl font-bold text-gray-800">₹{totalDue.toLocaleString()}</p>
                </div>
            </div>

            {/* Monthly Status List */}
            <ul className="space-y-3">
                {monthStatuses.map((item, index) => (
                    <li key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div>
                            <p className="font-semibold text-gray-800">{item.month} <span className="text-gray-500 font-normal">{item.year}</span></p>
                        </div>
                        <div className="flex items-center space-x-4">
                            {item.status === 'paid' ? 
                                (<span className="status-paid inline-flex items-center"><Check className="h-4 w-4 mr-1.5"/> Paid</span>) : 
                                (<button onClick={() => markPaymentAsPaid(item.month_number, item.year)} className="btn-primary-outline text-sm">Mark as Paid</button>)
                            }
                        </div>
                    </li>
                ))}
            </ul>
        </div>
      </main>
    </div>
  );
};

export default MosqueAdminHouseholdDetailsPage;
