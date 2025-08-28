import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Save, Edit, X, LogOut, KeyRound, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface AdminProfile {
  full_name: string;
  email: string;
  contact_number: string;
  city: string;
  state: string;
}

interface PendingChange {
    new_city: string;
    new_state: string;
}

const CityAdminProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<AdminProfile>({ full_name: '', email: '', contact_number: '', city: '', state: '' });
  const [originalProfile, setOriginalProfile] = useState<AdminProfile>({ full_name: '', email: '', contact_number: '', city: '', state: '' });
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [pendingChange, setPendingChange] = useState<PendingChange | null>(null);

  // State for the password change modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase.rpc('get_city_admin_profile', {
        p_user_id: user.id,
      });
      if (profileError) throw profileError;
      
      if (profileData) {
        const fetchedProfile = {
            full_name: profileData.full_name,
            email: profileData.email,
            contact_number: profileData.contact_numbera,
            city: profileData.city,
            state: profileData.state,
        };
        setProfile(fetchedProfile);
        setOriginalProfile(fetchedProfile);
      }

      // Check for pending change requests
      const { data: changeRequestData, error: changeRequestError } = await supabase
        .from('profile_change_requests')
        .select('new_city, new_state')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .maybeSingle();

      if (changeRequestError) throw changeRequestError;
      setPendingChange(changeRequestData);

    } catch (error: any) {
      toast.error(error.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsUpdating(true);
    const toastId = toast.loading('Saving changes...');

    const locationChanged = profile.city !== originalProfile.city || profile.state !== originalProfile.state;
    const detailsChanged = profile.full_name !== originalProfile.full_name || profile.contact_number !== originalProfile.contact_number;

    try {
      // Handle location change request
      if (locationChanged) {
        const { error: requestError } = await supabase.functions.invoke('request-profile-change', {
          body: { userId: user.id, newCity: profile.city, newState: profile.state },
        });
        if (requestError) throw new Error(requestError.message);
        toast.success('Location change request submitted for approval.', { id: toastId });
      }

      // Handle other profile details update
      if (detailsChanged) {
        const { error: updateError } = await supabase
          .from('admin_profiles')
          .update({ full_name: profile.full_name, contact_number: profile.contact_number })
          .eq('id', user.id);
        if (updateError) throw updateError;
        
        if(!locationChanged) {
            toast.success('Profile updated successfully!', { id: toastId });
        }
      }

      if (!locationChanged && !detailsChanged) {
        toast.dismiss(toastId);
        toast.success('No changes to save.');
      }
      
      setIsEditing(false);
      fetchData(); // Refresh data to show pending status
    } catch (error: any) {
      toast.error(error.message || 'Failed to save changes.', { id: toastId });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setProfile(originalProfile);
    setIsEditing(false);
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }
    setIsUpdating(true);
    const toastId = toast.loading('Changing password...');
    
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    setIsUpdating(false);
    if (error) {
        toast.error(error.message || 'Failed to change password.', { id: toastId });
    } else {
        toast.success('Password changed successfully!', { id: toastId });
        setShowPasswordModal(false);
        setNewPassword('');
        setConfirmNewPassword('');
    }
  };

  const handleLogout = async () => {
    const toastId = toast.loading('Logging out...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message, { id: toastId });
    } else {
      toast.success('Logged out successfully', { id: toastId });
      navigate('/login');
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
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 flex items-center space-x-6">
          <div className="flex-shrink-0 h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center">
            <User className="h-10 w-10 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{profile.full_name}</h1>
            <p className="text-gray-600">{profile.email}</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
              City Administrator
            </span>
          </div>
        </div>

        {pendingChange && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-r-lg">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                            You have a pending request to change your location to <span className="font-medium">{pendingChange.new_city}, {pendingChange.new_state}</span>.
                        </p>
                    </div>
                </div>
            </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="btn-secondary">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            )}
          </div>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input type="text" value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} readOnly={!isEditing} className={`input-field mt-1 ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Number</label>
              <input type="text" value={profile.contact_number || ''} onChange={(e) => setProfile({ ...profile, contact_number: e.target.value })} readOnly={!isEditing} className={`input-field mt-1 ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">State</label>
              <input type="text" value={profile.state || ''} onChange={(e) => setProfile({ ...profile, state: e.target.value })} readOnly={!isEditing || !!pendingChange} className={`input-field mt-1 ${(!isEditing || !!pendingChange) ? 'bg-gray-100 cursor-not-allowed' : ''}`}/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input type="text" value={profile.city || ''} onChange={(e) => setProfile({ ...profile, city: e.target.value })} readOnly={!isEditing || !!pendingChange} className={`input-field mt-1 ${(!isEditing || !!pendingChange) ? 'bg-gray-100 cursor-not-allowed' : ''}`}/>
            </div>
            {isEditing && (
              <div className="pt-2 flex space-x-3 justify-end">
                <button type="button" onClick={handleCancelEdit} className="btn-secondary">
                  <X className="h-5 w-5 mr-2" />
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isUpdating}>
                  <Save className="h-5 w-5 mr-2" />
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Security</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h3 className="font-medium text-gray-800">Password</h3>
                <p className="text-sm text-gray-500">Change your password to keep your account secure.</p>
              </div>
              <button onClick={() => setShowPasswordModal(true)} className="btn-secondary">Change</button>
            </div>
            <div className="flex justify-between items-center p-4 border rounded-lg bg-red-50 border-red-200">
              <div>
                <h3 className="font-medium text-red-800">Log Out</h3>
                <p className="text-sm text-red-600">You will be returned to the login screen.</p>
              </div>
              <button onClick={handleLogout} className="btn-danger-outline"><LogOut className="h-4 w-4 mr-2" />Log Out</button>
            </div>
          </div>
        </div>
      </main>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
            <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-field mt-1" placeholder="At least 6 characters" required/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="input-field mt-1" required/>
              </div>
              <div className="pt-4 flex justify-end items-center">
                <div className="space-x-3">
                    <button type="button" onClick={() => setShowPasswordModal(false)} className="btn-secondary">Cancel</button>
                    <button type="submit" className="btn-primary" disabled={isUpdating}>{isUpdating ? 'Saving...' : 'Save'}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CityAdminProfilePage;
