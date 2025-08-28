import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabase';
import { Check, X, User, MapPin, ArrowRight, Clock, Inbox } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface ChangeRequest {
  request_id: string;
  user_id: string;
  full_name: string;
  current_city: string;
  current_state: string;
  new_city: string;
  new_state: string;
  requested_at: string;
}

const SuperAdminChangeRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_all_profile_change_requests');
      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load change requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRequest = async (requestId: string, action: 'approve' | 'reject') => {
    const toastId = toast.loading(`${action === 'approve' ? 'Approving' : 'Rejecting'} request...`);
    try {
      const { error } = await supabase.functions.invoke('approve-request', {
        body: { requestId, requestType: 'profile_change', action },
      });
      if (error) throw new Error(error.message);
      toast.success(`Request ${action === 'approve' ? 'approved' : 'rejected'} successfully!`, { id: toastId });
      fetchData(); // Refresh the list
    } catch (error: any) {
      toast.error(error.message || 'Failed to process request.', { id: toastId });
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
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Profile Change Requests</h1>
          <p className="text-lg text-gray-600 mt-1">Review and approve location changes for City Admins.</p>
        </header>

        <div className="bg-white p-6 rounded-lg shadow-md">
          {requests.length > 0 ? (
            <div className="space-y-6">
              {requests.map((req) => (
                <div key={req.request_id} className="border rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
                    <div>
                      <p className="font-semibold text-lg text-gray-900 flex items-center">
                        <User className="h-5 w-5 mr-2 text-gray-500" />
                        {req.full_name}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <Clock className="h-4 w-4 mr-2" />
                        Requested on: {format(new Date(req.requested_at), 'PPP')}
                      </p>
                    </div>
                    <div className="flex space-x-3 mt-4 sm:mt-0">
                      <button onClick={() => handleRequest(req.request_id, 'reject')} className="btn-danger-outline">
                        <X className="h-5 w-5 mr-2" /> Reject
                      </button>
                      <button onClick={() => handleRequest(req.request_id, 'approve')} className="btn-primary">
                        <Check className="h-5 w-5 mr-2" /> Approve
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-md p-4 flex items-center justify-center space-x-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase">From</p>
                      <p className="font-medium text-gray-800 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" /> {req.current_city}, {req.current_state}
                      </p>
                    </div>
                    <ArrowRight className="h-6 w-6 text-gray-400 flex-shrink-0" />
                    <div className="text-center">
                      <p className="text-xs text-primary-700 uppercase font-semibold">To</p>
                      <p className="font-bold text-primary-700 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" /> {req.new_city}, {req.new_state}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Inbox className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">All Clear!</h3>
              <p className="text-gray-500 mt-1">There are no pending profile change requests.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SuperAdminChangeRequestsPage;
