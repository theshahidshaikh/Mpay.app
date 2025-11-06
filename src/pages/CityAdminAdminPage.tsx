import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { UserCheck, Clock, User, Phone, Building, Users, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

// Interfaces for the data
interface PendingAdmin {
  id: string;
  full_name: string;
  email: string;
  contact_number: string;
}

interface ActiveAdmin {
  id: string;
  full_name: string;
  email: string;
  contact_number: string;
  mosque_name: string | null;
  mosque_id: string | null; // 👈 ADD THIS LINE
}

const CityAdminAdminsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingAdmins, setPendingAdmins] = useState<PendingAdmin[]>([]);
  const [activeAdmins, setActiveAdmins] = useState<ActiveAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_mosque_admins_for_city_admin', {
        p_user_id: user.id,
      });
      if (error) throw error;
      setPendingAdmins(data.pending_admins || []);
      setActiveAdmins(data.active_admins || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch mosque admins.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'city_admin') {
      fetchData();
    }
  }, [user, fetchData]);

  const handleApproveAdmin = async (adminId: string) => {
    const toastId = toast.loading('Approving admin...');
    try {
      const { error } = await supabase.functions.invoke('approve-request', {
        body: { requestId: adminId, requestType: 'user' },
      });
      if (error) throw new Error(error.message);
      toast.success('Admin approved successfully!', { id: toastId });
      fetchData(); // Refresh the list
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve admin.', { id: toastId });
    }
  };

  // --- 👇 NEW FUNCTION TO HANDLE mosque CLICK ---
  const handlemosqueClick = (e: React.MouseEvent, mosqueId: string | null) => {
    e.stopPropagation(); // Prevents the row's onClick from firing
    if (mosqueId) {
      navigate(`/mosques/${mosqueId}`);
    }
  };

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
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Manage mosque Admins</h1>
          <p className="text-lg text-gray-600 mt-1">Approve new admins and manage existing ones in <span className="font-medium text-primary-700">{user?.city}</span>.</p>
        </header>

        {/* --- Pending Approvals Section --- */}
        {pendingAdmins.length > 0 && (
          <section className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Clock className="h-6 w-6 mr-3 text-amber-500" /> Pending Approvals
            </h2>
            <div className="space-y-4">
              {pendingAdmins.map((admin) => (
                <div key={admin.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg bg-amber-50">
                  <div>
                    <p className="font-semibold text-gray-800">{admin.full_name}</p>
                    <p className="text-sm text-gray-600">{admin.email}</p>
                    <p className="text-sm text-gray-600 mt-1 flex items-center"><Phone className="h-4 w-4 mr-2" />{admin.contact_number}</p>
                  </div>
                  <button onClick={() => handleApproveAdmin(admin.id)} className="btn-primary mt-3 sm:mt-0 w-full sm:w-auto">
                    <UserCheck className="h-5 w-5 mr-2" />
                    Approve
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* --- Active Admins Table Section --- */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <User className="h-6 w-6 mr-3 text-primary-600" />Active mosque Admins
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned mosque</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">View</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeAdmins.map((admin) => (
                  <tr 
                    key={admin.id} 
                    onClick={() => navigate(`/city/admins/${admin.id}`)} 
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{admin.full_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div>{admin.email}</div>
                      <div className="text-gray-500">{admin.contact_number}</div>
                    </td>
                    {/* --- 👇 MODIFIED CELL --- */}
                    <td 
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-600"
                      onClick={(e) => handlemosqueClick(e, admin.mosque_id)}
                    >
                      {admin.mosque_name ? (
                        <span className="flex items-center hover:text-primary-700 hover:underline">
                          <Building className="h-4 w-4 mr-2 text-gray-400"/>
                          {admin.mosque_name}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Not Assigned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <span className="text-gray-400">
                        <ChevronRight className="h-6 w-6" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {activeAdmins.length === 0 && pendingAdmins.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Admins to Manage</h3>
              <p className="text-gray-500 mt-1">There are currently no active or pending mosque admins in your city.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default CityAdminAdminsPage;
