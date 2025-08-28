import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Building, Users, IndianRupee, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

// Interfaces for the new data structure
interface Totals {
  total_mosques: number;
  total_households: number;
  total_population: number;
  total_collection: number;
}

interface MosqueStat {
  id: string;
  name: string;
  admin_full_name: string;
  households_count: number;
  population_count: number;
}

const CityAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [totals, setTotals] = useState<Totals | null>(null);
  const [mosques, setMosques] = useState<MosqueStat[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_city_admin_dashboard_data', {
        p_user_id: user.id,
      });
      if (error) throw error;
      if (data) {
        setTotals(data.totals);
        setMosques(data.mosques_list || []);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'city_admin') {
      fetchData();
    }
  }, [user, fetchData]);

  const handleMosqueClick = (mosqueId: string) => {
    navigate(`/mosques/${mosqueId}`);
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
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user?.full_name || 'Admin'}
          </h1>
          <p className="text-gray-600 mt-2">
            City Admin Dashboard | {user?.city}
          </p>
        </div>

        {/* --- Key Metric Cards --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card text-center">
            <Building className="h-8 w-8 mx-auto text-primary-600 mb-2" />
            <p className="text-3xl font-bold text-gray-900">{totals?.total_mosques.toLocaleString() || 0}</p>
            <p className="text-gray-500">Total Mosques</p>
          </div>
          <div className="card text-center">
            <Users className="h-8 w-8 mx-auto text-primary-600 mb-2" />
            <p className="text-3xl font-bold text-gray-900">{totals?.total_households.toLocaleString() || 0}</p>
            <p className="text-gray-500">Total Households</p>
          </div>
          <div className="card text-center">
            <Users className="h-8 w-8 mx-auto text-indigo-500 mb-2" />
            <p className="text-3xl font-bold text-gray-900">{totals?.total_population.toLocaleString() || 0}</p>
            <p className="text-gray-500">Total Population</p>
          </div>
          <div className="card text-center">
            <IndianRupee className="h-8 w-8 mx-auto text-green-500 mb-2" />
            <p className="text-3xl font-bold text-gray-900">₹{totals?.total_collection.toLocaleString() || 0}</p>
            <p className="text-gray-500">Collection (This Year)</p>
          </div>
        </div>

        {/* --- Table View --- */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Building className="h-6 w-6 mr-3 text-primary-600" />
            Mosques in {user?.city}
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mosque</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Households</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Population</th>
                  <th className="relative px-6 py-3"><span className="sr-only">View</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mosques.map((mosque) => (
                  <tr key={mosque.id} onClick={() => handleMosqueClick(mosque.id)} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{mosque.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{mosque.admin_full_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{mosque.households_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{mosque.population_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {mosques.length === 0 && !loading && (
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

export default CityAdminDashboard;