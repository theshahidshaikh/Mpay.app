import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Building, Users, IndianRupee, Eye, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// Interfaces for both active and pending mosques
interface Mosque {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  admin_full_name: string;
  households_count: number;
  total_collected: number;
}

interface PendingMosque {
  id: string;
  name: string;
  admin_full_name: string;
  admin_email: string;
}

const CityAdminMosquesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeMosques, setActiveMosques] = useState<Mosque[]>([]);
  const [pendingMosques, setPendingMosques] = useState<PendingMosque[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Call the new, correct function
      const { data, error } = await supabase.rpc('get_mosques_for_city_admin', {
        p_user_id: user.id,
      });

      if (error) throw error;
      setActiveMosques(data.active_mosques || []);
      setPendingMosques(data.pending_mosques || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch mosques.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'city_admin') {
      fetchData();
    }
  }, [user, fetchData]);

  const handleApproveMosque = async (mosqueId: string) => {
    const toastId = toast.loading('Approving mosque...');
    try {
      const { error } = await supabase.functions.invoke('approve-request', {
        body: { requestId: mosqueId, requestType: 'mosque' },
      });
      if (error) throw new Error(error.message);
      toast.success('Mosque approved successfully!', { id: toastId });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve mosque.', { id: toastId });
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

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mosque Management</h1>
          <p className="text-gray-600 mt-2">Approve and manage all mosques in your assigned city: {user?.city}</p>
        </div>

        {/* --- Pending Approvals Section --- */}
        {pendingMosques.length > 0 && (
          <div className="card mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Pending Mosque Approvals</h2>
            <div className="space-y-4">
              {pendingMosques.map((mosque) => (
                <div key={mosque.id} className="flex items-center justify-between p-4 border rounded-lg bg-amber-50">
                  <div>
                    <p className="font-semibold text-gray-800">{mosque.name}</p>
                    <p className="text-sm text-gray-600">Admin: {mosque.admin_full_name} ({mosque.admin_email})</p>
                  </div>
                  <button onClick={() => handleApproveMosque(mosque.id)} className="btn-primary">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Approve
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- Active Mosques Table --- */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Active Mosques</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mosque Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stats</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeMosques.map((mosque) => (
                  <tr 
                    key={mosque.id} 
                    onClick={() => navigate(`/mosques/${mosque.id}`)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{mosque.name}</div>
                      <div className="text-sm text-gray-500">{mosque.city}, {mosque.state}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {mosque.admin_full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Users className="h-4 w-4 text-gray-400 mr-2" /> {mosque.households_count} Households
                      </div>
                      <div className="text-sm text-gray-900 flex items-center mt-1">
                        <IndianRupee className="h-4 w-4 text-green-400 mr-2" /> ₹{mosque.total_collected.toLocaleString()} Collected
                      </div>
                    </td>
                    <td className="px-11 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/mosques/${mosque.id}`} className="text-gray-500 hover:text-blue-600 transition-colors" title="View Details">
                        <Eye className="h-5 w-5" />
                      </Link>
                    </td>
                  </tr> 
                ))}
              </tbody>
            </table>
          </div>
          {activeMosques.length === 0 && (
            <div className="text-center py-8">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No active mosques found in your city.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CityAdminMosquesPage;