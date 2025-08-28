import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { DollarSign, Search, Inbox, PlusCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

// Interfaces
interface Transaction {
  id: string;
  payment_date: string;
  head_of_house: string;
  house_number: string;
  amount: number;
  month: number;
  year: number;
  payment_method: string;
}
interface HouseholdOption {
    id: string;
    name: string;
}

const MosqueAdminCollectionsPage: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [householdOptions, setHouseholdOptions] = useState<HouseholdOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for filters
  const [startDate, setStartDate] = useState(format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // State for Add Payment Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPayment, setNewPayment] = useState({
      household_id: '',
      amount: '',
      payment_date: format(new Date(), 'yyyy-MM-dd'),
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      payment_method: 'Cash'
  });

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = [new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1];

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [transactionsData, householdsData] = await Promise.all([
        supabase.rpc('get_mosque_collections', {
            admin_user_id: user.id,
            start_date: startDate,
            end_date: endDate,
        }),
        supabase.rpc('get_all_households_for_mosque', {
            admin_user_id: user.id
        })
      ]);

      if (transactionsData.error) throw transactionsData.error;
      if (householdsData.error) throw householdsData.error;
      
      setTransactions(transactionsData.data || []);
      setHouseholdOptions(householdsData.data || []);

    } catch (error: any) {
      toast.error(error.message || 'Error loading collections data');
    } finally {
      setLoading(false);
    }
  }, [user, startDate, endDate]);

  useEffect(() => {
    if (user?.role === 'mosque_admin') {
      fetchData();
    }
  }, [user, fetchData]);

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading('Adding payment...');
    try {
        const { error } = await supabase.from('payments').insert({
            ...newPayment,
            amount: parseFloat(newPayment.amount),
            status: 'paid' // Manual entries are always considered paid
        });
        if (error) throw error;
        toast.success('Payment added successfully!', { id: toastId });
        setShowAddModal(false);
        fetchData(); // Refresh the transaction list
    } catch (error: any) {
        toast.error(error.message || 'Failed to add payment.', { id: toastId });
    }
  };

  const filteredTransactions = transactions.filter(t =>
    t.head_of_house.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.house_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) { /* ... (loading UI remains the same) ... */ }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Collections</h1>
            <p className="text-lg text-gray-600 mt-1">View and manage all payment transactions.</p>
        </header>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Date</label>
                    <div className="flex items-center gap-4">
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input-field"/>
                        <span className="text-gray-500">to</span>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input-field"/>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search by Name or House No.</label>
                     <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-gray-400" /></div>
                        <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field pl-10" />
                    </div>
                </div>
            </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Transaction Log</h2>
            <button onClick={() => setShowAddModal(true)} className="btn-primary">
                <PlusCircle className="h-5 w-5 mr-2"/>
                Add Payment
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="th">Date</th>
                  <th className="th">Head of House</th>
                  <th className="th">House No.</th>
                  <th className="th">Amount</th>
                  <th className="th">For Month</th>
                  <th className="th">Method</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                        <td className="td">{format(new Date(t.payment_date), 'dd MMM, yyyy')}</td>
                        <td className="td font-medium text-gray-900">{t.head_of_house}</td>
                        <td className="td font-mono">{t.house_number}</td>
                        <td className="td font-semibold text-green-600">₹{t.amount.toLocaleString()}</td>
                        <td className="td">{months[t.month - 1]} {t.year}</td>
                        <td className="td"><span className="badge-blue">{t.payment_method || 'N/A'}</span></td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredTransactions.length === 0 && (
            <div className="text-center py-12"><Inbox className="h-12 w-12 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900">No Transactions Found</h3><p className="text-gray-500 mt-1">No payments were recorded in the selected date range.</p></div>
          )}
        </div>
      </main>

      {/* Add Payment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add New Payment</h3>
                <button onClick={() => setShowAddModal(false)}><X className="h-6 w-6 text-gray-500"/></button>
            </div>
            <form onSubmit={handleAddPayment} className="space-y-4">
                <div>
                    <label className="label">Select Household</label>
                    <select required value={newPayment.household_id} onChange={e => setNewPayment({...newPayment, household_id: e.target.value})} className="input-field">
                        <option value="" disabled>-- Select a household --</option>
                        {householdOptions.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="label">Amount</label>
                    <input type="number" required value={newPayment.amount} onChange={e => setNewPayment({...newPayment, amount: e.target.value})} className="input-field" placeholder="e.g., 500"/>
                </div>
                <div>
                    <label className="label">Payment for Month/Year</label>
                    <div className="flex gap-2">
                        <select value={newPayment.month} onChange={e => setNewPayment({...newPayment, month: Number(e.target.value)})} className="input-field w-full">
                            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                        </select>
                        <select value={newPayment.year} onChange={e => setNewPayment({...newPayment, year: Number(e.target.value)})} className="input-field w-full">
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="label">Payment Date</label>
                    <input type="date" required value={newPayment.payment_date} onChange={e => setNewPayment({...newPayment, payment_date: e.target.value})} className="input-field"/>
                </div>
                <div>
                    <label className="label">Payment Method</label>
                    <select value={newPayment.payment_method} onChange={e => setNewPayment({...newPayment, payment_method: e.target.value})} className="input-field">
                        <option>Cash</option>
                        <option>Online</option>
                        <option>Other</option>
                    </select>
                </div>
                <div className="pt-4 flex justify-end space-x-3">
                    <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
                    <button type="submit" className="btn-primary">Save Payment</button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MosqueAdminCollectionsPage;
