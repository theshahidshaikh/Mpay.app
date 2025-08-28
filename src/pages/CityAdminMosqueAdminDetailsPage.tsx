import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, User, Phone, Mail, MapPin, Building, Trash2, AlertTriangle, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

// Interfaces for the data from our new function
interface AdminDetails {
  id: string;
  full_name: string;
  email: string;
  contact_number: string;
  city: string;
}

interface AssignedMosque {
  id: string;
  name: string;
}

const CityAdminMosqueAdminDetailsPage: React.FC = () => {
  const { user } = useAuth();
  const { adminId } = useParams<{ adminId: string }>();
  const navigate = useNavigate();
  const [details, setDetails] = useState<AdminDetails | null>(null);
  const [mosques, setMosques] = useState<AssignedMosque[]>([]);
  const [loading, setLoading] = useState(true);

  // State for delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!adminId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_mosque_admin_details', {
        p_admin_id: adminId,
      });

      if (error) throw error;
      if (data && data.details) {
        setDetails(data.details);
        setMosques(data.mosques || []);
      } else {
        throw new Error("Admin data not found.");
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load admin details.');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }, [adminId, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  const confirmDelete = async () => {
    if (!details) return;
    setIsDeleting(true);
    const toastId = toast.loading('Deleting admin...');
    try {
      const { error } = await supabase.functions.invoke('delete-user', {
        body: { userId: details.id },
      });
      if (error) throw new Error(error.message);
      toast.success('Admin deleted successfully!', { id: toastId });
      navigate('/city/admins'); // Navigate back to the admins list
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete admin.', { id: toastId });
      setIsDeleting(false);
    }
  };

  if (loading || !details) {
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
          <button onClick={() => navigate(-1)} className="flex items-center text-base font-medium text-gray-500 hover:text-gray-800 transition-colors mb-6">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Admins List
          </button>
          
          <div className="flex flex-col sm:flex-row justify-between items-start">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">{details.full_name}</h1>
              <p className="text-lg text-gray-600 mt-1">Mosque Admin Details</p>
            </div>
            {user?.role === 'city_admin' && (
              <button onClick={() => setShowDeleteModal(true)} className="btn-Denger ml-4">
                Delete Admin
              </button>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Admin Info */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <dl className="divide-y divide-gray-200">
                <div className="py-3 flex items-center justify-between">
                  <dt className="text-sm font-medium text-gray-500 flex items-center"><User className="h-5 w-5 mr-3 text-gray-400"/>Name</dt>
                  <dd className="text-sm text-gray-900">{details.full_name}</dd>
                </div>
                <div className="py-3 flex items-center justify-between">
                  <dt className="text-sm font-medium text-gray-500 flex items-center"><Mail className="h-5 w-5 mr-3 text-gray-400"/>Email</dt>
                  <dd className="text-sm text-gray-900">{details.email}</dd>
                </div>
                <div className="py-3 flex items-center justify-between">
                  <dt className="text-sm font-medium text-gray-500 flex items-center"><Phone className="h-5 w-5 mr-3 text-gray-400"/>Phone</dt>
                  <dd className="text-sm text-gray-900">{details.contact_number || 'N/A'}</dd>
                </div>
                <div className="py-3 flex items-center justify-between">
                  <dt className="text-sm font-medium text-gray-500 flex items-center"><MapPin className="h-5 w-5 mr-3 text-gray-400"/>City</dt>
                  <dd className="text-sm text-gray-900">{details.city}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Right Column: Assigned Mosques */}
          <div className="md:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Assigned Mosque(s)</h2>
              {mosques.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {mosques.map(mosque => (
                    <li key={mosque.id} className="py-4 flex items-center justify-between hover:bg-gray-100 rounded-md px-2 -mx-2 transition-colors">
                      <div className="flex items-center">
                        <Building className="h-6 w-6 mr-4 text-primary-600"/>
                        <span className="text-gray-800 font-medium">{mosque.name}</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-12">
                  <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No Assigned Mosques</h3>
                  <p className="text-gray-500 mt-1">This admin is not currently assigned to any active mosques.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && details && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl transform transition-all">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Admin</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete "{details.full_name}"? This action is permanent and cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="btn-danger w-full sm:ml-3 sm:w-auto"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                type="button"
                className="btn-secondary mt-3 w-full sm:mt-0 sm:w-auto"
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

export default CityAdminMosqueAdminDetailsPage; 