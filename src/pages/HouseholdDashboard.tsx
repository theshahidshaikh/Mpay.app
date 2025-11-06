import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Calendar, CreditCard, CheckCircle, XCircle, Users, Filter, RotateCcw, Home, BarChart2, AlertCircle, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface Household {
  id: string;
  house_number: string;
  head_of_house: string;
  members_count: number;
  male_count: number;
  female_count: number;
  contact_number: string;
  annual_amount: number;
  mosques: {
    name:string;
  } | null;
}

interface Payment {
  id: string;
  month: number;
  year: number;
  amount: number;
  status: string;
  rejection_reason: string | null;
}

const HouseholdDashboard: React.FC = () => {
  const { user } = useAuth();
  const [household, setHousehold] = useState<Household | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'all' | 'paid' | 'unpaid' | 'pending_verification' | 'rejected'>('all');
  const [fromMonth, setFromMonth] = useState<number>(1);
  const [toMonth, setToMonth] = useState<number>(12);
  const [showFilters, setShowFilters] = useState(false);


  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const availableYears = [
    new Date().getFullYear(),
    new Date().getFullYear() - 1,
    new Date().getFullYear() - 2,
    new Date().getFullYear() - 3,
  ];

  const fetchHouseholdData = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('households')
        .select(`*, mosques (name)`)
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      setHousehold(data);
    } catch (error) {
      console.error('Error fetching household data:', error);
      toast.error('Error loading household data');
    }
  }, [user]);

  const fetchPayments = useCallback(async () => {
    if (!household) return;
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('household_id', household.id)
        .eq('year', selectedYear);
      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Error loading payment data');
    } finally {
      setLoading(false);
    }
  }, [household, selectedYear]);

  useEffect(() => {
    setLoading(true);
    fetchHouseholdData();
  }, [fetchHouseholdData]);

  useEffect(() => {
    if (household) {
      fetchPayments();
    } else {
      setLoading(false);
    }
  }, [household, fetchPayments]);

  const getPaymentForMonth = (month: number): Payment | null => {
    return payments.find(p => p.month === month) || null;
  };

  const getFilteredMonths = () => {
    const monthsInRange = [];
    for (let i = fromMonth; i <= toMonth; i++) {
      monthsInRange.push(i);
    }

    return monthsInRange.filter(month => {
      const payment = getPaymentForMonth(month);
      const status = payment?.status || 'unpaid';
      if (paymentStatusFilter === 'all') return true;
      return status === paymentStatusFilter;
    });
  };

  const resetFilters = () => {
    setSelectedYear(new Date().getFullYear());
    setPaymentStatusFilter('all');
    setFromMonth(1);
    setToMonth(12);
  };

  const monthlyAmount = household?.annual_amount ? household.annual_amount / 12 : 0;
  
  // Updated Summary Calculations
  const paidMonthsForYear = payments.filter(p => p.status === 'paid');
  const pendingMonthsForYear = payments.filter(p => p.status === 'pending_verification');
  
  const totalPaidForYear = paidMonthsForYear.reduce((sum, p) => sum + p.amount, 0);
  const totalPendingForYear = pendingMonthsForYear.reduce((sum, p) => sum + p.amount, 0);

  // FIX: Total Due now accounts for both paid and pending amounts
  const totalDue = (household?.annual_amount || 0) - totalPaidForYear;
  
  const filteredMonths = getFilteredMonths();

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Assalam wailaikum, {household?.head_of_house || user?.email}</p>
        </div>

        {household ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            <div className="lg:col-span-1 space-y-8">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Home className="h-5 w-5 mr-2 text-primary-600" />
                  Household Information
                </h3>
                <div className="space-y-3">
                  <InfoRow label="Jamat Number" value={household.house_number} />
                  <InfoRow label="Head of House" value={household.head_of_house} />
                  <InfoRow label="Masjid" value={household.mosques?.name || 'N/A'} />
                  <InfoRow label="Contact" value={household.contact_number} />
                  <InfoRow label="Members" value={`${household.members_count} (${household.male_count}M, ${household.female_count}F)`} />
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <BarChart2 className="h-5 w-5 mr-2 text-primary-600" />
                    Summary for {selectedYear}
                </h3>
                <div className="space-y-3">
                    <SummaryRow label="Paid Months" value={`${paidMonthsForYear.length} / 12`} color="green" />
                    <SummaryRow label="Total Payments" value={`₹${totalPaidForYear.toLocaleString()}`} color="green" />
                    <SummaryRow label="Pending Approval" value={`₹${totalPendingForYear.toLocaleString()}`} color="yellow" />
                    <SummaryRow label="Remaining Due" value={`₹${totalDue.toLocaleString()}`} color="orange" />
                    <SummaryRow label="Monthly Amount" value={`₹${monthlyAmount.toLocaleString()}`} color="gray" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 card">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Calendar className="h-6 w-6 mr-2 text-primary-600" />
                  Payment Status
                </h2>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="btn-secondary flex items-center text-sm"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </button>
                  <button
                    onClick={resetFilters}
                    className="btn-secondary flex items-center text-sm"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </button>
                </div>
              </div>

              {showFilters && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6 border">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        {availableYears.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                      <select
                        value={paymentStatusFilter}
                        onChange={(e) => setPaymentStatusFilter(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="all">All Statuses</option>
                        <option value="paid">Paid</option>
                        <option value="unpaid">Unpaid</option>
                        <option value="pending_verification">Pending</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">From Month</label>
                      <select
                        value={fromMonth}
                        onChange={(e) => setFromMonth(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        {months.map((month, index) => (
                          <option key={index + 1} value={index + 1}>{month}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">To Month</label>
                      <select
                        value={toMonth}
                        onChange={(e) => setToMonth(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        {months.map((month, index) => (
                          <option key={index + 1} value={index + 1}>{month}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredMonths.map(monthNum => {
                  const payment = getPaymentForMonth(monthNum);
                  const status = payment?.status || 'unpaid';
                  return <MonthCard key={monthNum} month={months[monthNum - 1]} status={status} reason={payment?.rejection_reason} />;
                })}
              </div>
              
              {filteredMonths.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                      <p className="font-medium">No months found for the selected filters.</p>
                  </div>
              )}

              <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row gap-4">
                <Link to="/household/payment" className="w-full sm:w-auto">
                  <button className="btn-primary flex items-center justify-center w-full">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Make a Payment
                  </button>
                </Link>
                <Link to="/household/history" className="w-full sm:w-auto">
                  <button className="btn-secondary flex items-center justify-center w-full">
                    View Payment History
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="card text-center py-16">
            <h2 className="text-xl font-semibold text-gray-800">Registration Pending</h2>
            <p className="text-gray-600 mt-2 max-w-md mx-auto">
              Your household registration is currently awaiting approval.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between items-center text-sm">
    <span className="text-gray-600">{label}</span>
    <span className="font-semibold text-gray-900 text-right">{value}</span>
  </div>
);

const SummaryRow: React.FC<{ label: string; value: string; color: 'green' | 'blue' | 'orange' | 'gray' | 'yellow' }> = ({ label, value, color }) => {
    const colors = {
        green: 'bg-green-100 text-green-800',
        blue: 'bg-blue-100 text-blue-800',
        orange: 'bg-orange-100 text-orange-800',
        gray: 'bg-gray-100 text-gray-800',
        yellow: 'bg-yellow-100 text-yellow-800'
    }
    return (
        <div className={`flex justify-between items-center p-3 rounded-lg ${colors[color]}`}>
            <span className="font-medium text-sm">{label}</span>
            <span className="font-bold text-sm">{value}</span>
        </div>
    )
};

const MonthCard: React.FC<{ month: string, status: string, reason?: string | null }> = ({ month, status, reason }) => {
  const statusConfig = {
    paid: {
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      style: 'border-green-200 bg-green-100',
      text: 'Paid',
      textColor: 'text-green-700'
    },
    pending: {
      icon: <AlertCircle className="h-5 w-5 text-yellow-600" />,
      style: 'border-yellow-300 bg-yellow-100',
      text: 'Pending',
      textColor: 'text-yellow-700'
    },
    rejected: {
      icon: <XCircle className="h-5 w-5 text-red-600" />,
      style: 'border-red-300 bg-red-100',
      text: 'Rejected',
      textColor: 'text-red-700'
    },
    unpaid: {
      icon: <HelpCircle className="h-5 w-5 text-red-600" />,
      style: 'border-red-300 bg-grey-100',
      text: 'Unpaid',
      textColor: 'text-red-700'
    }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.unpaid;

  return (
    <div className={`p-4 rounded-lg border-2 relative ${config.style}`}>
      {status === 'rejected' && reason && (
        <div className="group absolute top-0 right-0 p-1">
          <HelpCircle className="h-5 w-5 text-red-600 cursor-pointer" />
          <div className="absolute bottom-full right-0 mb-2 w-48 p-2 text-xs text-white bg-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <span className="font-bold">Reason:</span> {reason}
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-gray-900">{month}</h4>
        {config.icon}
      </div>
      <p className={`text-sm font-medium ${config.textColor}`}>
        {config.text}
      </p>
    </div>
  );
};

export default HouseholdDashboard;
