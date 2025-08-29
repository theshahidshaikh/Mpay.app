import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Map, ChevronRight, Users, UserCheck, Building, IndianRupee } from 'lucide-react';
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

// Updated interface to include total_population
interface Totals {
  total_mosques: number;
  total_households: number;
  total_population: number;
  total_admins: number;
  total_collection: number;
}

interface StateStat {
  state: string;
  mosque_count: number;
  household_count: number;
  city_admin_count: number;
}

const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [totals, setTotals] = useState<Totals | null>(null);
  const [statsByState, setStatsByState] = useState<StateStat[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_super_admin_dashboard_data');
      if (error) throw error;
      if (data) {
        setTotals(data.totals);
        setStatsByState(data.state_stats || []);
      }
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      toast.error(error.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'super_admin') {
      fetchData();
    }
  }, [user, fetchData]);

  const handleStateClick = (stateName: string) => {
    navigate(`/super/states/${encodeURIComponent(stateName)}`);
  };

  // Chart data and options
  const topStatesData = statsByState.slice(0, 10);
  const chartData = {
    labels: topStatesData.map(s => s.state),
    datasets: [
      {
        label: 'Number of Mosques',
        data: topStatesData.map(s => s.mosque_count),
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
      title: { display: true, text: 'Top 10 States by Mosque Count' },
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
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user?.full_name || 'Admin'}
          </h1>
          <p className="text-gray-600 mt-2">
            Super Admin Dashboard | National Overview
          </p>
        </div>

        {/* --- Key Metric Cards --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
            <UserCheck className="h-8 w-8 mx-auto text-primary-600 mb-2" />
            <p className="text-3xl font-bold text-gray-900">{totals?.total_admins.toLocaleString() || 0}</p>
            <p className="text-gray-500">Total City Admins</p>
          </div>
          <div className="card text-center">
            <IndianRupee className="h-8 w-8 mx-auto text-green-500 mb-2" />
            <p className="text-3xl font-bold text-gray-900">₹{totals?.total_collection.toLocaleString() || 0}</p>
            <p className="text-gray-500">Collection (This Year)</p>
          </div>
        </div>

        {/* --- Table View --- */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Map className="h-6 w-6 mr-3 text-primary-600" />
            Statistics by State
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mosques</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Households</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City Admins</th>
                  <th className="relative px-6 py-3"><span className="sr-only">View</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {statsByState.map((stat) => (
                  <tr key={stat.state} onClick={() => handleStateClick(stat.state)} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{stat.state}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{stat.mosque_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{stat.household_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{stat.city_admin_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {statsByState.length === 0 && !loading && (
             <div className="text-center py-8">
                <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No data found for any state.</p>
            </div>
          )}
        </div>
        
        {/* --- Bar Chart (Moved to the bottom) --- */}
        {statsByState.length > 0 && (
          <div className="card">
            <Bar options={chartOptions} data={chartData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;