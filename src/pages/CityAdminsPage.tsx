import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom'; // 👈 Import Link
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Edit, Trash2, UserCog, Search, CheckCircle, FileClock } from 'lucide-react'; // 👈 Import FileClock
import toast from 'react-hot-toast';

interface Admin {
  id: string;
  full_name: string;
  email: string;
  contact_number?: string;
  city: string;
  state: string;
}

const indianStates = [ "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal" ];

const CityAdminsPage: React.FC = () => {
  const { user } = useAuth();
  const [pendingAdmins, setPendingAdmins] = useState<Admin[]>([]);
  const [activeAdmins, setActiveAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);

  // State for filters
  const [selectedState, setSelectedState] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_city_admins_with_pending', {
        p_state: selectedState || null,
        p_city: cityFilter || null,
      });
      if (error) throw error;
      if (data) {
        setPendingAdmins(data.pending_admins || []);
        setActiveAdmins(data.active_admins || []);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch city admins.');
    } finally {
      setLoading(false);
    }
  }, [selectedState, cityFilter]);

  useEffect(() => {
    if (user?.role === 'super_admin') {
      fetchAdmins();
    }
  }, [user, fetchAdmins]);
  
  const handleApproveAdmin = async (adminId: string) => {
    const toastId = toast.loading('Approving admin...');
    try {
      const { error } = await supabase.functions.invoke('approve-request', { // Changed to 'approve-request'
        body: { requestId: adminId, requestType: 'user' }, // Adjusted body
      });
      if (error) throw new Error(error.message);
      toast.success('Admin approved successfully!', { id: toastId });
      fetchAdmins(); // Refresh the list
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve admin.', { id: toastId });
    }
  };

  const handleDeleteAdmin = (adminId: string) => {
    toast('Delete functionality requires a Supabase Edge Function.');
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

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* --- 👇 MODIFIED HEADER --- */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">City Admin Management</h1>
                <p className="text-lg text-gray-600 mt-1">Approve new registrations and manage existing city admins.</p>
            </div>
            <Link to="/super/requests" className="mt-4 sm:mt-0 w-full sm:w-auto">
                <button className="btn-secondary w-full">
                    <FileClock className="h-5 w-5 mr-2" />
                    View Change Requests
                </button>
            </Link>
        </div>

        {/* --- Filter Section --- */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by State</label>
              <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className="input-field">
                <option value="">All States</option>
                {indianStates.map(state => <option key={state} value={state}>{state}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search by City</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input type="text" placeholder="e.g., Mumbai" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="input-field pl-10" />
              </div>
            </div>
          </div>
        </div>

        {/* --- Pending Approvals Section --- */}
        {pendingAdmins.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Pending Approvals</h2>
            <div className="space-y-4">
              {pendingAdmins.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between p-4 border rounded-lg bg-amber-50">
                  <div>
                    <p className="font-semibold text-gray-800">{admin.full_name} ({admin.email})</p>
                    <p className="text-sm text-gray-600">Location: {admin.city}, {admin.state}</p>
                  </div>
                  <button onClick={() => handleApproveAdmin(admin.id)} className="btn-primary">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Approve
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- Active Admins Table --- */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <UserCog className="h-6 w-6 mr-3 text-primary-600" />
              Active City Admins
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{admin.full_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      <div>{admin.email}</div>
                      <div>{admin.contact_number || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{admin.city}, {admin.state}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-4">
                        <button className="text-blue-600 hover:text-blue-800"><Edit className="h-5 w-5" /></button>
                        <button onClick={() => handleDeleteAdmin(admin.id)} className="text-red-600 hover:text-red-800"><Trash2 className="h-5 w-5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CityAdminsPage;
