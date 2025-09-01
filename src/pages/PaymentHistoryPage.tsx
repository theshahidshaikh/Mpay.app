import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  History, 
  Calendar, 
  DollarSign, 
  CreditCard, 
  Download,
  Filter,
  ArrowLeft,
  CheckCircle,
  Receipt
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface Payment {
  id: string;
  amount: number;
  payment_date: string;
  month: number;
  year: number;
  payment_method: string;
  transaction_id: string | null;
  status: string;
  created_at: string;
}

interface Household {
  id: string;
  house_number: string;
  head_of_house: string;
  mosque: {
    name: string;
  };
}

const PaymentHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [household, setHousehold] = useState<Household | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, filterYear]);

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch household data
      const { data: householdData, error: householdError } = await supabase
        .from('households')
        .select(`
          *,
          mosque:mosques(name)
        `)
        .eq('user_id', user.id)
        .single();

      if (householdError) throw householdError;
      setHousehold(householdData);

      // Fetch payment history
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('household_id', householdData.id)
        .eq('year', filterYear)
        .eq('status', 'paid')
        .order('payment_date', { ascending: false });

      if (paymentsError) throw paymentsError;
      setPayments(paymentsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error loading payment history');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredPayments = () => {
    let filtered = payments;

    if (filterMethod !== 'all') {
      filtered = filtered.filter(payment => payment.payment_method === filterMethod);
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(a.payment_date).getTime();
      const dateB = new Date(b.payment_date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  };

  const generateReport = () => {
    const filteredPayments = getFilteredPayments();
    
    if (filteredPayments.length === 0) {
      toast.error('No payments to export');
      return;
    }

    const csvContent = [
      ['Date', 'Month', 'Year', 'Amount', 'Payment Method', 'Transaction ID', 'Status'],
      ...filteredPayments.map(payment => [
        format(new Date(payment.payment_date), 'dd/MM/yyyy'),
        months[payment.month - 1],
        payment.year.toString(),
        `₹${payment.amount.toFixed(2)}`,
        payment.payment_method.toUpperCase(),
        payment.transaction_id || 'N/A',
        payment.status.toUpperCase()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `payment-history-${filterYear}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast.success('Payment history exported successfully');
  };

  const getTotalPaid = () => {
    return getFilteredPayments().reduce((total, payment) => total + payment.amount, 0);
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'upi':
      case 'card':
      case 'netbanking':
        return <CreditCard className="h-4 w-4" />;
      case 'cash':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method.toLowerCase()) {
      case 'upi':
        return 'bg-blue-100 text-blue-800';
      case 'card':
        return 'bg-purple-100 text-purple-800';
      case 'netbanking':
        return 'bg-green-100 text-green-800';
      case 'cash':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const filteredPayments = getFilteredPayments();
  const totalPaid = getTotalPaid();
  const availableYears = [2024, 2025, 2026, 2027, 2028];
  const paymentMethods = ['all', 'upi', 'card', 'netbanking', 'cash'];

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pt-4 pb-20">
        <div className="mb-8">
          <button
            onClick={() => navigate('/household/dashboard')}
            className="hidden md:flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <History className="h-8 w-8 mr-3 text-primary-600" />
                Payment History
              </h1>
              <p className="text-gray-600 mt-2">Track all your payment transactions</p>
            </div>
            
            {filteredPayments.length > 0 && (
              <button
                onClick={generateReport}
                className="btn-primary flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </button>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        {household && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-primary-100">
                  <DollarSign className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">₹{totalPaid.toLocaleString()}</h3>
                  <p className="text-sm text-gray-600">Total Paid ({filterYear})</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">{filteredPayments.length}</h3>
                  <p className="text-sm text-gray-600">Transactions</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <Receipt className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">{household.house_number}</h3>
                  <p className="text-sm text-gray-600">House Number</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Year</label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(parseInt(e.target.value))}
                className="text-sm border-gray-300 rounded-md"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Payment Method</label>
              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="text-sm border-gray-300 rounded-md"
              >
                {paymentMethods.map(method => (
                  <option key={method} value={method}>
                    {method === 'all' ? 'All Methods' : method.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sort Order</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
                className="text-sm border-gray-300 rounded-md"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payment History Display */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Transaction History</h2>
          
          {filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment History</h3>
              <p className="text-gray-600">
                {filterMethod !== 'all' || filterYear !== new Date().getFullYear()
                  ? 'No payments found for the selected filters.'
                  : 'You haven\'t made any payments yet.'}
              </p>
              <button
                onClick={() => navigate('/household/payment')}
                className="btn-primary mt-4"
              >
                Make Your First Payment
              </button>
            </div>
          ) : (
            <div>
              {/* --- 👇 NEW: Mobile Card View --- */}
              <div className="space-y-4 md:hidden">
                {filteredPayments.map((payment) => (
                  <div key={payment.id} className="bg-gray-50 p-4 rounded-lg border">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-gray-900 text-lg">₹{payment.amount.toLocaleString()}</p>
                        <p className="text-sm font-medium text-gray-700">{months[payment.month - 1]} {payment.year}</p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentMethodColor(payment.payment_method)}`}>
                        {getPaymentMethodIcon(payment.payment_method)}
                        <span className="ml-1">{payment.payment_method.toUpperCase()}</span>
                      </span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-600 space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Date:</span>
                        <span>{format(new Date(payment.payment_date), 'MMM dd, yyyy - HH:mm')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Transaction ID:</span>
                        <span className="font-mono break-all">{payment.transaction_id || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Status:</span>
                        <span className="status-paid"><CheckCircle className="h-3 w-3 mr-1 inline" />Paid</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* --- Existing Desktop Table View --- */}
              <div className="overflow-x-auto hidden md:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month/Year</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{format(new Date(payment.payment_date), 'MMM dd, yyyy')}</div>
                              <div className="text-sm text-gray-500">{format(new Date(payment.payment_date), 'HH:mm')}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{months[payment.month - 1]} {payment.year}</td>
                        <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-semibold text-gray-900">₹{payment.amount.toLocaleString()}</div></td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentMethodColor(payment.payment_method)}`}>
                            {getPaymentMethodIcon(payment.payment_method)}
                            <span className="ml-1">{payment.payment_method.toUpperCase()}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{payment.transaction_id || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="status-paid"><CheckCircle className="h-3 w-3 mr-1 inline" />Paid</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentHistoryPage;
