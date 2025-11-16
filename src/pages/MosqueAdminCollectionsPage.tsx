import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { IndianRupee, Search, Inbox, PlusCircle, X, Check, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

// Interfaces for Payment Groups
interface PaymentGroup {
  id: string;
  paid_at: string;
  head_of_house: string;
  house_number: string;
  total_amount: number;
  months: string[];
  payment_method: string;
  status: 'paid' | 'pending' | 'rejected';
  screenshot_url: string | null; // Added in previous step
}

interface PendingPaymentGroup {
  id: string;
  paid_at: string;
  head_of_house: string;
  house_number: string;
  total_amount: number;
  months: string[];
  screenshot_url: string;
}

interface HouseholdOption {
  id: string;
  name: string;
}

const mosqueAdminCollectionsPage: React.FC = () => {
  const { user } = useAuth();
  const [pendingPaymentGroups, setPendingPaymentGroups] = useState<PendingPaymentGroup[]>([]);
  const [transactionGroups, setTransactionGroups] = useState<PaymentGroup[]>([]);
  const [householdOptions, setHouseholdOptions] = useState<HouseholdOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);

  const [startDate, setStartDate] = useState(format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const [showAddModal, setShowAddModal] = useState(false);
  const [newPayment, setNewPayment] = useState({
    household_id: '',
    amount: '',
    payment_date: format(new Date(), 'yyyy-MM-dd'),
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    payment_method: 'Cash'
  });

  const [rejectingPayment, setRejectingPayment] = useState<PendingPaymentGroup | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = [new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1];

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [pendingData, transactionsData, householdsData] = await Promise.all([
        supabase.rpc('get_pending_payment_groups_for_mosque', { admin_user_id: user.id }),
        supabase.rpc('get_payment_groups_for_mosque', { admin_user_id: user.id, start_date: startDate, end_date: endDate }),
        supabase.rpc('get_all_households_for_mosque', { admin_user_id: user.id })
      ]);

      if (pendingData.error) throw pendingData.error;
      if (transactionsData.error) throw transactionsData.error;
      if (householdsData.error) throw householdsData.error;

      setPendingPaymentGroups(pendingData.data || []);
      setTransactionGroups(transactionsData.data || []);
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

  const handleViewReceipt = async (screenshotUrl: string | null) => {
    if (!screenshotUrl) {
      toast.error("No receipt URL provided.");
      return;
    }
    const toastId = toast.loading('Generating secure link...');
    try {
      const url = new URL(screenshotUrl);
      const pathParts = url.pathname.split('/');
      const bucketName = 'payment_screenshot';
      const bucketIndex = pathParts.indexOf(bucketName);

      if (bucketIndex === -1) {
        throw new Error('Invalid receipt URL structure. Bucket not found.');
      }
      const filePath = pathParts.slice(bucketIndex + 1).join('/');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Authentication error: No active session.");

      const { data, error } = await supabase.functions.invoke('get-signed-receipt-url', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: { filePath },
      });

      if (error) throw error;

      window.open(data.signedUrl, '_blank');
      toast.dismiss(toastId);
    } catch (error: any) {
      toast.error(error.message || 'Could not open receipt.', { id: toastId });
    }
  };

  const handleApprove = async (groupId: string) => {
    const toastId = toast.loading('Approving...');
    try {
      // const { error } = await supabase.from('payment_groups').update({ status: 'paid' }).eq('id', groupId);
      // if (error) throw error;
      const { error } = await supabase.rpc('approve_payment_group', { p_group_id: groupId });
      if (error) throw error;
      toast.success('Payment approved!', { id: toastId });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve.', { id: toastId });
    }
  };

  // In src/pages/mosqueAdminCollectionsPage.tsx

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingPayment || !rejectionReason) return;
    const toastId = toast.loading('Rejecting...');
    try {
      // Step 1: Update the payment_groups table (your existing code)
      const { error: groupError } = await supabase
        .from('payment_groups')
        .update({ status: 'rejected', rejection_reason: rejectionReason })
        .eq('id', rejectingPayment.id);

      if (groupError) throw groupError;

      // --- 👇 NEW: UPDATE the related payments table records ---
      const { error: paymentsError } = await supabase
        .from('payments')
        .update({ status: 'rejected', rejection_reason: rejectionReason })
        .eq('payment_group_id', rejectingPayment.id);

      if (paymentsError) throw paymentsError;
      // --- END of new code ---

      toast.success('Payment rejected.', { id: toastId });
      setRejectingPayment(null);
      setRejectionReason('');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject.', { id: toastId });
    }
  };

  const handleAddPaymentGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading('Adding payment...');
    try {
      const { data: groupData, error: groupError } = await supabase
        .from('payment_groups')
        .insert({
          household_id: newPayment.household_id,
          total_amount: parseFloat(newPayment.amount),
          paid_at: newPayment.payment_date,
          status: 'paid',
        })
        .select('id')
        .single();

      if (groupError) throw groupError;
      if (!groupData) throw new Error("Failed to create payment group.");

      const paymentGroupId = groupData.id;

      const { error: paymentError } = await supabase.from('payments').insert({
        payment_group_id: paymentGroupId,
        month: newPayment.month,
        year: newPayment.year,
        amount: parseFloat(newPayment.amount),
        payment_method: newPayment.payment_method,
      });

      if (paymentError) {
        await supabase.from('payment_groups').delete().eq('id', paymentGroupId);
        throw paymentError;
      }

      toast.success('Payment added successfully!', { id: toastId });
      setShowAddModal(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add payment.', { id: toastId });
    }
  };

  const filteredTransactionGroups = transactionGroups.filter(t =>
    t.head_of_house.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.house_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpand = (groupId: string) => {
    setExpandedGroupId(prevId => (prevId === groupId ? null : groupId));
  };

  if (loading) { return <div className="flex justify-center items-center h-screen"><p>Loading...</p></div> }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="card mb-8 bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Collections</h1>
          <p className="text-lg text-gray-600 mt-1">View and manage all payment transactions.</p>
        </header>

        {pendingPaymentGroups.length > 0 && (
          <div className="card bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Pending Approvals ({pendingPaymentGroups.length})</h2>
            <div className="space-y-4">
              {pendingPaymentGroups.map(p => (
                <div key={p.id} className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                  <div className="flex justify-between items-start">
                        {/* LEFT SIDE: Info & Expand Indicator */}
                        <div className="flex-grow cursor-pointer pr-4" onClick={() => toggleExpand(p.id)}>
                            <div className="flex items-center justify-start gap-2">
                                <p className="font-bold text-gray-800">{p.head_of_house} <span className="font-normal text-gray-600">(House: {p.house_number})</span></p>
                                {expandedGroupId === p.id ? <ChevronUp className="h-5 w-5 text-gray-600" /> : <ChevronDown className="h-5 w-5 text-gray-600" />}
                            </div>
                            <p className="text-sm text-gray-600">Paid **₹{p.total_amount.toLocaleString()}** for {p.months.length} month(s)</p>
                        </div>
                        {/* RIGHT SIDE: Action Buttons */}
                    <div className="flex items-center gap-2 w-auto flex-shrink-0">
                      <button 
                            onClick={(e) => { e.stopPropagation(); handleViewReceipt(p.screenshot_url); }} 
                            className="text-primary-600 hover:bg-gray-100 hover:text-primary-800 transition p-1 rounded-md flex flex-col items-center justify-center text-sm"
                        >
                            <Eye className="h-5 w-5" />
                            <span className="text-xs mt-0.5">Receipt</span>
                        </button>
                      <button 
                            onClick={(e) => { e.stopPropagation(); setRejectingPayment(p); }} 
                            className="text-red-600 hover:bg-red-50 hover:text-red-800 transition p-1 rounded-md flex flex-col items-center justify-center text-sm"
                        >
                            <X className="h-5 w-5" />
                            <span className="text-xs mt-0.5">Reject</span>
                        </button>
                      <button 
                            onClick={(e) => { e.stopPropagation(); handleApprove(p.id); }} 
                            className="text-green-600 hover:bg-green-50 hover:text-green-800 transition p-1 rounded-md flex flex-col items-center justify-center text-sm"
                        >
                            <Check className="h-5 w-5" />
                            <span className="text-xs mt-0.5">Approve</span>
                        </button>
                    </div>
                  </div>
                  {expandedGroupId === p.id && (
                    <div className="mt-4 pt-4 border-t border-yellow-200">
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">Months Included:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        {p.months.sort().map(monthStr => {
                          const [m, y] = monthStr.split('-');
                          return <li key={monthStr}>{months[parseInt(m) - 1]} {y}</li>
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Date</label>
              <div className="flex items-center gap-4">
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input-field" />
                <span className="text-gray-500">to</span>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input-field" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search by Name or Jamat No.</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-gray-400" /></div>
                <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field pl-10" />
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Transaction Log</h2>
            <button onClick={() => setShowAddModal(true)} className="btn-primary">
              <PlusCircle className="h-5 w-5 mr-2" />
              Add Payment
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="th text-center">Date</th>
                  <th className="th text-center">Head of House</th>
                  <th className="th text-center">Jamat No.</th>
                  <th className="th text-center">Amount</th>
                  <th className="th text-center">Months</th>
                  <th className="th text-center">Method</th>
                  <th className="th text-center">Status</th>
                  <th className="th text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactionGroups.map((t) => (
                  <React.Fragment key={t.id}>
                    <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleExpand(t.id)}>
                      <td className="td text-center">{format(new Date(t.paid_at), 'dd MMM, yyyy')}</td>
                      <td className="td font-medium text-gray-900 text-center">{t.head_of_house}</td>
                      <td className="td font-mono text-center">{t.house_number}</td>
                      <td className="td font-semibold text-green-600 text-center">₹{t.total_amount.toLocaleString()}</td>
                      <td className="td text-center">{t.months.length} month(s) {expandedGroupId === t.id ? <ChevronUp className="h-4 w-4 inline-block ml-1" /> : <ChevronDown className="h-4 w-4 inline-block ml-1" />}</td>
                      <td className="td text-center"><span className="badge-blue">{t.payment_method || 'N/A'}</span></td>
                      <td className="td text-center">
                        <span className={`capitalize badge-${t.status === 'paid' ? 'green' : t.status === 'pending' ? 'yellow' : 'red'}`}>{t.status}</span>
                      </td>
                      <td className="td text-center">
                        {t.screenshot_url ? (
                          <button onClick={(e) => { e.stopPropagation(); handleViewReceipt(t.screenshot_url); }} className="text-gray-500 hover:text-primary-600">
                            <Eye className="h-6 w-6 mx-auto" />
                          </button>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                    {expandedGroupId === t.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={8} className="p-4">
                          <div className="pl-8">
                            <h4 className="font-semibold text-sm text-gray-700 mb-2">Months Included:</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                              {t.months.sort().map(monthStr => {
                                const [m, y] = monthStr.split('-');
                                return <li key={monthStr}>{months[parseInt(m) - 1]} {y}</li>
                              })}
                            </ul>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          {filteredTransactionGroups.length === 0 && (
            <div className="text-center py-12"><Inbox className="h-12 w-12 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900">No Transactions Found</h3><p className="text-gray-500 mt-1">No payments were recorded in the selected date range.</p></div>
          )}
        </div>
      </main>

      {rejectingPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Reject Payment</h3>
            <p className="text-sm text-gray-600 mb-4">Please provide a reason for rejecting this payment for {rejectingPayment.head_of_house}.</p>
            <form onSubmit={handleReject}>
              <textarea
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                className="input-field w-full"
                rows={3}
                placeholder="e.g., Screenshot is unclear, amount does not match..."
                required
              />
              <div className="mt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setRejectingPayment(null)} className="btn-primary">Cancel</button>
                <button type="submit" className="btn-danger">Confirm Rejection</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add New Payment</h3>
              <button onClick={() => setShowAddModal(false)}><X className="h-6 w-6 text-gray-500" /></button>
            </div>
            <form onSubmit={handleAddPaymentGroup} className="space-y-4">
              <div>
                <label className="label">Select Household</label>
                <select required value={newPayment.household_id} onChange={e => setNewPayment({ ...newPayment, household_id: e.target.value })} className="input-field">
                  <option value="" disabled>-- Select a household --</option>
                  {householdOptions.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Amount</label>
                <input type="number" required value={newPayment.amount} onChange={e => setNewPayment({ ...newPayment, amount: e.target.value })} className="input-field" placeholder="e.g., 500" />
              </div>
              <div>
                <label className="label">Payment for Month/Year</label>
                <div className="flex gap-2">
                  <select value={newPayment.month} onChange={e => setNewPayment({ ...newPayment, month: Number(e.target.value) })} className="input-field w-full">
                    {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                  <select value={newPayment.year} onChange={e => setNewPayment({ ...newPayment, year: Number(e.target.value) })} className="input-field w-full">
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
              </div>
              </div>
              <div>
                <label className="label">Payment Date</label>
                <input type="date" required value={newPayment.payment_date} onChange={e => setNewPayment({ ...newPayment, payment_date: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="label">Payment Method</label>
                <select value={newPayment.payment_method} onChange={e => setNewPayment({ ...newPayment, payment_method: e.target.value })} className="input-field">
                  <option>Cash</option>
                  <option>Online</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-primary">Cancel</button>
                <button type="submit" className="btn-primary">Save Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default mosqueAdminCollectionsPage;