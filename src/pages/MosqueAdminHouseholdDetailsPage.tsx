import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Home, Phone, Check, X } from 'lucide-react';
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

const mosqueAdminHouseholdDetailsPage: React.FC = () => {
  const { user } = useAuth();
  const { householdId } = useParams<{ householdId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialStartMonth = parseInt(queryParams.get('startMonth') || '1');
  const initialStartYear = parseInt(queryParams.get('startYear') || new Date().getFullYear().toString());
  const initialEndMonth = parseInt(queryParams.get('endMonth') || '12');
  const initialEndYear = parseInt(queryParams.get('endYear') || new Date().getFullYear().toString());

  const [details, setDetails] = useState<HouseholdDetails | null>(null);
  const [monthStatuses, setMonthStatuses] = useState<MonthStatus[]>([]);
  const [loading, setLoading] = useState(true);

  // --- NEW: State for the editable date range filters ---
  const [startMonth, setStartMonth] = useState(initialStartMonth);
  const [startYear, setStartYear] = useState(initialStartYear);
  const [endMonth, setEndMonth] = useState(initialEndMonth);
  const [endYear, setEndYear] = useState(initialEndYear);

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = [new Date().getFullYear() - 2, new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1];

  const fetchData = useCallback(async () => {
    if (!householdId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_household_payment_details', {
        p_household_id: householdId,
        start_year: initialStartYear,
        start_month: initialStartMonth,
        end_year: initialEndYear,
        end_month: initialEndMonth,
      });

      if (error) throw error;
      setDetails(data.details);

      const allMonths: MonthStatus[] = [];
      const paidMonths = new Set(data.payments.map((p: Payment) => `${p.month}-${p.year}`));
      
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

    } catch (error: any) {
      toast.error(error.message || 'Failed to load details.');
      navigate(-1);
    } finally {
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
          <Link to="/admin/dashboard" className="flex items-center text-base font-medium text-gray-500 hover:text-gray-800 transition-colors mb-4">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Reporting
          </Link>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{details.head_of_house}</h1>
            <div className="text-lg text-gray-600 mt-2 space-y-2">
                <p className="flex items-center"><Home className="h-5 w-5 mr-3 text-gray-400"/>House No: <span className="font-medium ml-2">{details.house_number}</span></p>
                <p className="flex items-center"><Phone className="h-5 w-5 mr-3 text-gray-400"/>Contact: <span className="font-medium ml-2">{details.contact_number}</span></p>
            </div>
          </div>
        </header>

        {/* --- NEW: Date Range Filter Card --- */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Date Range</label>
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <p className="text-xs text-gray-500">From</p>
                            <div className="flex gap-2">
                                <select value={startMonth} onChange={(e) => setStartMonth(Number(e.target.value))} className="input-field w-full">
                                    {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                                </select>
                                <select value={startYear} onChange={(e) => setStartYear(Number(e.target.value))} className="input-field w-full">
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-gray-500">To</p>
                            <div className="flex gap-2">
                                <select value={endMonth} onChange={(e) => setEndMonth(Number(e.target.value))} className="input-field w-full">
                                    {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                                </select>
                                <select value={endYear} onChange={(e) => setEndYear(Number(e.target.value))} className="input-field w-full">
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <button onClick={handleFilterApply} className="btn-primary w-full">Apply Filter</button>
            </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment History</h2>
            
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

            <ul className="space-y-3">
                {monthStatuses.map((item, index) => (
                    <li key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div>
                            <p className="font-semibold text-gray-800">{item.month} <span className="text-gray-500 font-normal">{item.year}</span></p>
                        </div>
                        <div className="flex items-center space-x-4">
                            {item.status === 'paid' ? 
                                (<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><Check className="h-4 w-4 mr-1.5"/> Paid</span>) : 
                                (<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700"><X className="h-4 w-4 mr-1.5" /> Unpaid</span>)
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

export default mosqueAdminHouseholdDetailsPage;