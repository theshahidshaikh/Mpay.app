import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { MapPin, ArrowLeft, Users, DollarSign, TrendingUp, User, Phone, Trash2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

// Interfaces to match the function's response
interface MosqueDetails {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  admin_name: string;
  admin_contact: string;
}

interface MosqueStats {
  total_households: number;
  total_population: number;
  male_population: number;
  female_population: number;
  expected_collection: number;
  total_collected: number;
}

const MosqueDetailsPage: React.FC = () => {
  const { user } = useAuth();
  const { mosqueId } = useParams<{ mosqueId: string }>();
  const navigate = useNavigate();
  const [details, setDetails] = useState<MosqueDetails | null>(null);
  const [stats, setStats] = useState<MosqueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // State for delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!mosqueId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_mosque_details_with_year', {
        p_mosque_id: mosqueId,
        p_year: selectedYear,
      });

      if (error) throw error;

      if (data && data.details && data.stats) {
        setDetails(data.details);
        setStats(data.stats);
      } else {
        throw new Error("Mosque data not found.");
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load mosque details.');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }, [mosqueId, selectedYear, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  const confirmDelete = async () => {
    if (!details) return;
    setIsDeleting(true);
    const toastId = toast.loading('Deleting mosque...');
    try {
      const { error } = await supabase.functions.invoke('delete-mosque', {
        body: { mosqueId: details.id },
      });
      if (error) throw new Error(error.message);
      toast.success('Mosque deleted successfully!', { id: toastId });
      navigate('/super/mosques');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete mosque.', { id: toastId });
      setIsDeleting(false);
    }
  };

  if (loading || !details || !stats) {
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
          <button onClick={() => navigate(-1)} className="flex items-center text-base text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="h-5 w-5 mr-2 " />
            Back
          </button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{details.name}</h1>
              <p className="text-gray-600 mt-2 flex items-center">
                <MapPin className="h-5 w-5 mr-2" /> {details.address}, {details.city}, {details.state}
              </p>
              <div className="mt-4 space-y-2 text-gray-700">
                <p className="flex items-center">
                  <User className="h-5 w-5 mr-2" /> Admin: <span className="font-medium ml-1">{details.admin_name}</span>
                </p>
                <p className="flex items-center">
                  <Phone className="h-5 w-5 mr-2" /> Contact: <span className="font-medium ml-1">{details.admin_contact || 'N/A'}</span>
                </p>
              </div>
            </div>
            {(user?.role === 'super_admin' || user?.role === 'city_admin') && (
              <button onClick={() => setShowDeleteModal(true)} className="btn-Denger ml-4">
                Delete Mosque
              </button>
            )}
          </div>
        </div>
        
        <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-1">View Stats for Year</label>
            <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="input-field w-full md:w-1/4"
            >
                {[2024, 2025, 2026].map(year => <option key={year} value={year}>{year}</option>)}
            </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Financial Overview ({selectedYear})</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center"><span className="text-gray-600 flex items-center"><TrendingUp className="mr-2 h-5 w-5"/>Expected Collection</span> <span className="font-bold text-lg">₹{stats.expected_collection.toLocaleString()}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-600 flex items-center"><DollarSign className="mr-2 h-5 w-5 text-green-500"/>Total Collected</span> <span className="font-bold text-lg text-green-600">₹{stats.total_collected.toLocaleString()}</span></div>
            </div>
          </div>
          
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Community Stats</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center"><span className="text-gray-600 flex items-center"><Users className="mr-2 h-5 w-5"/>Total Households</span> <span className="font-bold text-lg">{stats.total_households}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-600 flex items-center"><Users className="mr-2 h-5 w-5"/>Total Population</span> <span className="font-bold text-lg">{stats.total_population}</span></div>
               <div className="flex justify-between items-center pl-4"><span className="text-gray-500">Male</span> <span className="font-medium">{stats.male_population}</span></div>
               <div className="flex justify-between items-center pl-4"><span className="text-gray-500">Female</span> <span className="font-medium">{stats.female_population}</span></div>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && details && (
         <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Mosque</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete "{details.name}"? This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 disabled:opacity-50 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MosqueDetailsPage;