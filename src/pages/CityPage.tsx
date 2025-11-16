import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Building, MapPin, ChevronRight, ArrowLeft, Users, IndianRupee, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// Interfaces for the new data structure
interface Totals {
  total_mosques: number;
  total_households: number;
  total_population: number;
  total_collection: number;
}

interface Pendingmosque {
  id: string;
  name: string;
  admin: { full_name: string; email: string } | null;
}

interface Activemosque {
  id: string;
  name: string;
  state: string;
  admin_full_name: string;
  households_count: number;
  population_count: number;
}

const CityPage: React.FC = () => {
  const { user } = useAuth();
  const { cityName } = useParams<{ cityName: string }>();
  const [totals, setTotals] = useState<Totals | null>(null);
  const [pendingmosques, setPendingmosques] = useState<Pendingmosque[]>([]);
  const [activemosques, setActivemosques] = useState<Activemosque[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const decodedCityName = cityName ? decodeURIComponent(cityName) : '';

  // 👇 START HELPER FUNCTIONS
  const formatCompactNumber = (num: number, isCurrency: boolean): string => {
    // Use 'en-IN' for lakh/crore notation if available, otherwise fallback to 'en-US' (K/M)
    const locale = 'en-IN';

    // Check for explicit 'en-IN' compact support, else use generic compact
    const formatted = Intl.NumberFormat(locale, {
      notation: "compact",
      maximumFractionDigits: 1
    }).format(num);

    return isCurrency ? `₹${formatted}` : formatted;
  };

  const getFullNumberTitle = (num: number, isCurrency: boolean): string => {
    const formatted = num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    return isCurrency ? `₹${formatted}` : formatted;
  };
  // 👆 END HELPER FUNCTIONS


  const fetchData = useCallback(async () => {
    if (!decodedCityName) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_city_dashboard_data', {
        p_city_name: decodedCityName,
      });
      if (error) throw error;
      if (data) {
        setTotals(data.totals);
        setPendingmosques(data.pending_mosques || []);
        setActivemosques(data.active_mosques || []);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load city data.');
    } finally {
      setLoading(false);
    }
  }, [decodedCityName]);

  useEffect(() => {
    if (user?.role === 'super_admin') {
      fetchData();
    }
  }, [user, fetchData]);

  const handlemosqueClick = (mosqueId: string) => {
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
          <Link to={`/super/states/${encodeURIComponent(activemosques[0]?.state || '')}`} className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to State View
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{decodedCityName}</h1>
          <p className="text-gray-600 mt-2">City-Level Overview</p>
        </div>

        {/* --- Key Metric Cards for the City --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Mosques */}
          <div
            className="card text-center overflow-hidden transition duration-300 hover:shadow-lg cursor-default"
            title={getFullNumberTitle(totals?.total_mosques || 0, false)}
          >
            <Building className="h-8 w-8 mx-auto text-primary-600 mb-2" />
            <p className="text-3xl font-bold text-gray-900 truncate">{formatCompactNumber(totals?.total_mosques || 0, false)}</p>
            <p className="text-gray-500">Total mosques</p>
          </div>
          {/* Total Households */}
          <div
            className="card text-center overflow-hidden transition duration-300 hover:shadow-lg cursor-default"
            title={getFullNumberTitle(totals?.total_households || 0, false)}
          >
            <Users className="h-8 w-8 mx-auto text-primary-600 mb-2" />
            <p className="text-3xl font-bold text-gray-900 truncate">{formatCompactNumber(totals?.total_households || 0, false)}</p>
            <p className="text-gray-500">Total Households</p>
          </div>
          {/* Total Population */}
          <div
            className="card text-center overflow-hidden transition duration-300 hover:shadow-lg cursor-default"
            title={getFullNumberTitle(totals?.total_population || 0, false)}
          >
            <Users className="h-8 w-8 mx-auto text-indigo-500 mb-2" />
            <p className="text-3xl font-bold text-gray-900 truncate">{formatCompactNumber(totals?.total_population || 0, false)}</p>
            <p className="text-gray-500">Total Population</p>
          </div>
          {/* Collection (This Year) */}
          <div
            className="card text-center overflow-hidden transition duration-300 hover:shadow-lg cursor-default"
            title={getFullNumberTitle(totals?.total_collection || 0, true)}
          >
            <IndianRupee className="h-8 w-8 mx-auto text-green-500 mb-2" />
            <p className="text-3xl font-bold text-gray-900 truncate">{formatCompactNumber(totals?.total_collection || 0, true)}</p>
            <p className="text-gray-500">Collection (This Year)</p>
          </div>
        </div>


        {/* Active mosques Table */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Active mosques in {decodedCityName}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">mosque</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Households</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Population</th>
                  <th className="relative px-6 py-3"><span className="sr-only">View</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activemosques.map((mosque) => (
                  <tr key={mosque.id} onClick={() => handlemosqueClick(mosque.id)} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{mosque.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{mosque.admin_full_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{mosque.households_count.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{mosque.population_count.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {activemosques.length === 0 && !loading && (
            <div className="text-center py-8">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No active mosques found in this city.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CityPage;