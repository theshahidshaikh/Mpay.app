import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Building, Users, DollarSign, Search, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

// Interface for a mosque
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

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const MosquesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [selectedState, setSelectedState] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  const fetchMosques = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_all_mosques_with_stats', {
        p_user_id: user.id,
        p_state: selectedState || null,
        p_city: cityFilter || null,
      });

      if (error) throw error;
      setMosques(data || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch mosques.');
    } finally {
      setLoading(false);
    }
  }, [user, selectedState, cityFilter]);

  useEffect(() => {
    if (user?.role) {
      fetchMosques();
    }
  }, [fetchMosques, user?.role]);

  // --- NEW: Central navigation function ---
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
          <h1 className="text-3xl font-bold text-gray-900">Mosque Management</h1>
          <p className="text-gray-600 mt-2">View details for all active mosques.</p>
        </div>

        {/* Filters (Unchanged) */}
        {user?.role === 'super_admin' && (
          <div className="card mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by State</label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="input-field"
                >
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
                  <input
                    type="text"
                    placeholder="e.g., Mumbai"
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="card">
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
                {mosques.map((mosque) => (
                  <tr 
                    key={mosque.id} 
                    onClick={() => handleMosqueClick(mosque.id)} // Use the new handler function
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
                        <DollarSign className="h-4 w-4 text-green-400 mr-2" /> ₹{mosque.total_collected.toLocaleString()} Collected
                      </div>
                    </td>
                    <td className="px-11 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/super/mosques/${mosque.id}`} className="text-gray-500 hover:text-blue-600 transition-colors" title="View Details">
                        <Eye className="h-5 w-5" />
                      </Link>
                    </td>
                  </tr> 
                ))}
              </tbody>
            </table>
          </div>
          {mosques.length === 0 && (
            <div className="text-center py-8">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No active mosques found for the selected filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MosquesPage;