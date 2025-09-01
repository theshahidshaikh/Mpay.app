import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  Users, DollarSign, Search, Inbox, CheckCircle, TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

// Interfaces
interface HouseholdReport {
  id: string; 
  head_of_house: string; 
  contact_number: string; 
  annual_amount: number;
  paid_months: number; 
  unpaid_months: number;
}
interface SummaryStats {
    total_households: number;
    total_population: number;
    expected_collection: number;
    total_collected: number;
    total_pending: number;
}

const MosqueAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [households, setHouseholds] = useState<HouseholdReport[]>([]);
  const [summaryStats, setSummaryStats] = useState<SummaryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // State for date range selection
  const [startMonth, setStartMonth] = useState(1);
  const [startYear, setStartYear] = useState(new Date().getFullYear());
  const [endMonth, setEndMonth] = useState(new Date().getMonth() + 1);
  const [endYear, setEndYear] = useState(new Date().getFullYear());
  
  // --- NEW: State for the payment status filter ---
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = [new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1];

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [reportData, summaryData] = await Promise.all([
        supabase.rpc('get_mosque_reporting_data', {
            admin_user_id: user.id, 
            start_year: startYear, 
            start_month: startMonth, 
            end_year: endYear, 
            end_month: endMonth,
        }),
        supabase.rpc('get_mosque_summary_stats', {
            admin_user_id: user.id, 
            start_year: startYear, 
            start_month: startMonth, 
            end_year: endYear, 
            end_month: endMonth,
        })
      ]);

      if (reportData.error) throw reportData.error;
      if (summaryData.error) throw summaryData.error;
      
      setHouseholds(reportData.data.households || []);
      setSummaryStats(summaryData.data);

    } catch (error: any) {
      toast.error(error.message || 'Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user, startMonth, startYear, endMonth, endYear]);

  useEffect(() => {
    if (user?.role === 'mosque_admin') {
      fetchData();
    }
  }, [user, fetchData]);

  // --- UPDATED: Filtering logic now includes payment status ---
  const filteredHouseholds = households
    .filter(h => {
        if (paymentStatusFilter === 'all') {
            return true;
        }
        if (paymentStatusFilter === 'fully_paid') {
            return h.unpaid_months === 0;
        }
        if (paymentStatusFilter === 'partially_unpaid') {
            return h.unpaid_months > 0;
        }
        return true;
    })
    .filter(h =>
        h.head_of_house.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (h.contact_number && h.contact_number.includes(searchTerm))
    );

  if (loading) {
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Household Reporting</h1>
            <p className="text-lg text-gray-600 mt-1">View payment summaries for a selected date range.</p>
        </header>

        {/* Summary Stats Section */}
        {summaryStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <div className="stat-card"><Users className="stat-icon" /><div><p className="stat-label">Total Households</p><p className="stat-value">{summaryStats.total_households}</p></div></div>
                <div className="stat-card"><Users className="stat-icon" /><div><p className="stat-label">Total Population</p><p className="stat-value">{summaryStats.total_population}</p></div></div>
                <div className="stat-card"><DollarSign className="stat-icon text-blue-500" /><div><p className="stat-label">Expected Collection</p><p className="stat-value">₹{summaryStats.expected_collection.toLocaleString()}</p></div></div>
                <div className="stat-card"><CheckCircle className="stat-icon text-green-500" /><div><p className="stat-label">Total Collected</p><p className="stat-value">₹{summaryStats.total_collected.toLocaleString()}</p></div></div>
                <div className="stat-card"><TrendingUp className="stat-icon text-amber-500" /><div><p className="stat-label">Total Pending</p><p className="stat-value">₹{summaryStats.total_pending.toLocaleString()}</p></div></div>
            </div>
        )}

        {/* --- UPDATED: Filter Controls Section --- */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
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
                {/* NEW: Payment Status Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                    <select
                        value={paymentStatusFilter}
                        onChange={(e) => setPaymentStatusFilter(e.target.value)}
                        className="input-field w-full"
                    >
                        <option value="all">All</option>
                        <option value="fully_paid">Fully Paid</option>
                        <option value="partially_unpaid">Partially/Unpaid</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search by Name or Contact</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-gray-400" /></div>
                        <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field pl-10" />
                    </div>
                </div>
            </div>
        </div>
        
        {/* Household Data Table */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Household Payment Summary</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="th">Head of House</th>
                  <th className="th">Contact Number</th>
                  <th className="th">Paid Months</th>
                  <th className="th">Unpaid Months</th>
                  <th className="th">Total Due</th>
                  <th className="th">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHouseholds.map((h) => {
                    const monthlyAmount = h.annual_amount / 12;
                    const totalDue = h.unpaid_months * monthlyAmount;
                    const linkTo = `/mosque/household/${h.id}?startMonth=${startMonth}&startYear=${startYear}&endMonth=${endMonth}&endYear=${endYear}`;
                    return (
                        <tr key={h.id} className="hover:bg-gray-50">
                            <td className="td text-center font-medium text-gray-900">{h.head_of_house}</td>
                            <td className="td text-center font-mono">{h.contact_number}</td>
                            <td className="td text-center text-green-600 font-semibold">{h.paid_months}</td>
                            <td className="td text-center text-red-600 font-semibold">{h.unpaid_months}</td>
                            <td className="td text-center font-bold">₹{totalDue.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0}) }</td>
                            <td className="td text-center">
                                <Link to={linkTo} className="font-medium text-primary-600 hover:text-primary-800">
                                    View Details
                                </Link>
                            </td>
                        </tr>
                    );
                })}
              </tbody>
            </table>
          </div>
          {filteredHouseholds.length === 0 && (
            <div className="text-center py-12"><Inbox className="h-12 w-12 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900">No Households Found</h3><p className="text-gray-500 mt-1">No active households match your search criteria for the selected date range.</p></div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MosqueAdminDashboard;