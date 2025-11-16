import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  Home, MapPin, Users, Search, Check, X, Edit, Trash2, Inbox, Phone, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

// Interfaces
interface mosqueDetails {
    name: string; address: string; city: string; state: string;
}
interface Household {
  id: string; house_number: string; head_of_house: string; members_count: number;
  contact_number: string; annual_amount: number; user_id: string; // user_id is needed for updates
}
interface PendingHousehold {
  id: string; name: string; house_number: string; members_count: number; contact_number: string;
}

const mosqueAdminHouseholdsPage: React.FC = () => {
  const { user } = useAuth();
  const [mosqueDetails, setmosqueDetails] = useState<mosqueDetails | null>(null);
  const [activeHouseholds, setActiveHouseholds] = useState<Household[]>([]);
  const [pendingHouseholds, setPendingHouseholds] = useState<PendingHousehold[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // State for modals
  const [editingHousehold, setEditingHousehold] = useState<Household | null>(null);
  const [deletingHousehold, setDeletingHousehold] = useState<Household | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_mosque_households_page_data', {
        admin_user_id: user.id,
      });

      if (error) throw error;
      
      setmosqueDetails(data.mosque_details);
      setActiveHouseholds(data.active_households || []);
      setPendingHouseholds(data.pending_households || []);

    } catch (error: any) {
      toast.error(error.message || 'Error loading households data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'mosque_admin') {
      fetchData();
    }
  }, [user, fetchData]);

  const handleApproveHousehold = async (householdId: string) => {
    const toastId = toast.loading('Approving household...');
    try {
      const { error } = await supabase.functions.invoke('approve-request', {
        body: { requestId: householdId, requestType: 'household' },
      });
      if (error) throw error;
      toast.success('Household approved!', { id: toastId });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve household.', { id: toastId });
    }
  };
  
  const handleRejectHousehold = async (householdId: string) => { toast.error('Reject functionality not yet implemented.'); }

  const handleUpdateHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHousehold) return;
    const toastId = toast.loading('Updating household...');
    try {
        const { error } = await supabase.functions.invoke('update-household', {
            body: { householdId: editingHousehold.id, updates: editingHousehold },
        });
        if (error) throw new Error(error.message);
        toast.success('Household updated successfully!', { id: toastId });
        setEditingHousehold(null);
        fetchData();
    } catch (error: any) {
        toast.error(error.message || 'Failed to update household.', { id: toastId });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingHousehold) return;
    const toastId = toast.loading('Deleting household...');
    try {
        const { error } = await supabase.functions.invoke('delete-household', {
            body: { householdId: deletingHousehold.id },
        });
        if (error) throw new Error(error.message);
        toast.success('Household deleted successfully!', { id: toastId });
        setDeletingHousehold(null);
        fetchData();
    } catch (error: any) {
        toast.error(error.message || 'Failed to delete household.', { id: toastId });
    }
  };

  const handleDeleteFromEditModal = () => {
    if (editingHousehold) {
        setDeletingHousehold(editingHousehold);
        setEditingHousehold(null);
    }
  };

  const filteredHouseholds = activeHouseholds.filter(h =>
    h.house_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.head_of_house.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        {mosqueDetails && (
            <header className="card bg-white p-6 rounded-lg shadow-md mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">{mosqueDetails.name}</h1>
                <p className="text-lg text-gray-600 mt-1 flex items-center">
                    <MapPin className="h-5 w-5 mr-2"/> {mosqueDetails.address}, {mosqueDetails.city}, {mosqueDetails.state}
                </p>
            </header>
        )}
        
        {pendingHouseholds.length > 0 && (
          <section className="card bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Pending Household Approvals</h2>
            <div className="space-y-4">
              {pendingHouseholds.map((household) => (
                <div key={household.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg bg-amber-50">
                  <div>
                    <p className="text-lg font-bold text-gray-800">{household.name}</p>
                    <div className="text-sm text-gray-600 mt-2 space-y-1">
                        <p className="flex items-center"><Home className="h-4 w-4 mr-2"/> House No: <span className="font-medium ml-1">{household.house_number}</span></p>
                        <p className="flex items-center"><Users className="h-4 w-4 mr-2"/> Members: <span className="font-medium ml-1">{household.members_count}</span></p>
                        <p className="flex items-center"><Phone className="h-4 w-4 mr-2"/> Contact: <span className="font-medium ml-1">{household.contact_number}</span></p>
                    </div>
                  </div>
                  <div className="flex space-x-3 mt-4 sm:mt-0 w-full sm:w-auto self-center sm:self-end">
                    <button onClick={() => handleRejectHousehold(household.id)} className="btn-danger-outline w-full"><X className="h-5 w-5 mr-2"/> Reject</button>
                    <button onClick={() => handleApproveHousehold(household.id)} className="btn-primary w-full"><Check className="h-5 w-5 mr-2"/> Approve</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="card bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Home className="h-6 w-6 mr-3 text-primary-600"/> Active Households
                </h2>
                <div className="relative mt-4 md:mt-0">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-gray-400" /></div>
                <input type="text" placeholder="Search by name or Jamat No..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field pl-10 w-full md:w-64" />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="th text-center">Jamat No.</th>
                            <th className="th text-center">Head of House</th>
                            <th className="th text-center">Members</th>
                            <th className="th text-center">Contact</th>
                            <th className="th text-center">Annual Amount</th>
                            <th className="th text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredHouseholds.map((h) => (
                        <tr key={h.id} className="hover:bg-gray-50">
                            <td className="td font-mono text-center">{h.house_number}</td>
                            <td className="td font-medium text-gray-900 text-center">{h.head_of_house}</td>
                            <td className="td text-center">{h.members_count}</td>
                            <td className="td text-center">{h.contact_number}</td>
                            <td className="td text-center">₹{h.annual_amount.toLocaleString()}</td>
                            <td className="td text-center">
                                <div className="flex justify-center">
                                    <button onClick={() => setEditingHousehold(h)} className="text-blue-600 hover:text-blue-800" title="Edit"><Edit className="h-5 w-5"/></button>
                                </div>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {filteredHouseholds.length === 0 && (
                <div className="text-center py-12"><Inbox className="h-12 w-12 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900">No Households Found</h3><p className="text-gray-500 mt-1">No active households match your search criteria.</p></div>
            )}
        </div>
      </main>

      {/* Edit Household Modal */}
      {editingHousehold && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Household</h3>
            <form onSubmit={handleUpdateHousehold} className="space-y-4">
                <input type="text" value={editingHousehold.house_number} onChange={(e) => setEditingHousehold({...editingHousehold, house_number: e.target.value})} className="input-field" placeholder="Jamat Number"/>
                <input type="text" value={editingHousehold.head_of_house} onChange={(e) => setEditingHousehold({...editingHousehold, head_of_house: e.target.value})} className="input-field" placeholder="Head of House"/>
                <input type="number" value={editingHousehold.members_count} onChange={(e) => setEditingHousehold({...editingHousehold, members_count: parseInt(e.target.value)})} className="input-field" placeholder="Members Count"/>
                <input type="text" value={editingHousehold.contact_number} onChange={(e) => setEditingHousehold({...editingHousehold, contact_number: e.target.value})} className="input-field" placeholder="Contact Number"/>
                <input type="number" value={editingHousehold.annual_amount} onChange={(e) => setEditingHousehold({...editingHousehold, annual_amount: parseInt(e.target.value)})} className="input-field" placeholder="Annual Amount"/>
                <div className="pt-4 flex justify-between items-center">
                    <button 
                        type="button" 
                        onClick={handleDeleteFromEditModal}
                        className="btn-danger-outline"
                    >
                        <Trash2 className="h-5 w-5 mr-2"/>
                        Delete Household
                    </button>
                    <div className="space-x-3">
                        <button type="button" onClick={() => setEditingHousehold(null)} className="btn-primary">Cancel</button>
                        <button type="submit" className="btn-primary">Save Changes</button>
                    </div>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingHousehold && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg font-medium text-gray-900">Delete Household</h3>
                <p className="text-sm text-gray-500 mt-2">Are you sure you want to delete the household of "{deletingHousehold.head_of_house}"? This action cannot be undone.</p>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button type="button" onClick={handleConfirmDelete} className="btn-danger w-full sm:ml-3 sm:w-auto">Delete</button>
              <button type="button" onClick={() => setDeletingHousehold(null)} className="btn-primary mt-3 w-full sm:mt-0 sm:w-auto">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default mosqueAdminHouseholdsPage;
