import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Building, MapPin, ChevronRight, ArrowLeft, Users, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Interfaces for the new data structure
interface Totals {
  total_mosques: number;
  total_households: number;
  total_population: number;
  total_collection: number;
}

interface CityStat {
  city: string;
  mosque_count: number;
  household_count: number;
  population_count: number;
}

const StatePage: React.FC = () => {
  const { user } = useAuth();
  const { stateName } = useParams<{ stateName: string }>();
  const [totals, setTotals] = useState<Totals | null>(null);
  const [statsByCity, setStatsByCity] = useState<CityStat[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const decodedStateName = stateName ? decodeURIComponent(stateName) : '';

  const fetchData = useCallback(async () => {
    if (!decodedStateName) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_state_dashboard_data', {
        p_state_name: decodedStateName,
      });
      if (error) throw error;
      if (data) {
        setTotals(data.totals);
        setStatsByCity(data.city_stats || []);
      }
    } catch (error: any) {
      console.error('Error fetching state dashboard data:', error);
      toast.error(error.message || 'Failed to load state data.');
    } finally {
      setLoading(false);
    }
  }, [decodedStateName]);

  useEffect(() => {
    if (user?.role === 'super_admin') {
      fetchData();
    }
  }, [user, fetchData]);

  const handleCityClick = (cityName: string) => {
    navigate(`/super/cities/${encodeURIComponent(cityName)}`);
  };

  // Chart data and options
  const topCitiesData = statsByCity.slice(0, 10);
  const chartData = {
    labels: topCitiesData.map(c => c.city),
    datasets: [
      {
        label: 'Number of Mosques',
        data: topCitiesData.map(c => c.mosque_count),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };
  const chartOptions = {
    indexAxis: 'y' as const,
    elements: { bar: { borderWidth: 2 } },
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Top 10 Cities by Mosque Count' },
    },
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
          <Link to="/super/dashboard" className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to National Overview
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {decodedStateName}
          </h1>
          <p className="text-gray-600 mt-2">
            State-Level Overview
          </p>
        </div>

        {/* --- Key Metric Cards for the State --- */}
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
        
        {/* --- Table View of Cities --- */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <MapPin className="h-6 w-6 mr-3 text-primary-600" />
            Statistics by City
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mosques</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Households</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Population</th>
                  <th className="relative px-6 py-3"><span className="sr-only">View</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {statsByCity.map((stat) => (
                  <tr key={stat.city} onClick={() => handleCityClick(stat.city)} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{stat.city}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{stat.mosque_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{stat.household_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{stat.population_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
           {statsByCity.length === 0 && !loading && (
             <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No active cities found in this state.</p>
            </div>
          )}
        </div>

        {/* --- Bar Chart (Moved to the bottom) --- */}
        {statsByCity.length > 0 && (
          <div className="card">
            <Bar options={chartOptions} data={chartData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatePage;