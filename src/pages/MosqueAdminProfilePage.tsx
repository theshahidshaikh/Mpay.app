import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Save, Edit, X, LogOut, KeyRound, Building, Wallet } from 'lucide-react'; 
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface Profile {
  full_name: string; email: string; contact_number: string; city: string; state: string;
}
interface mosque {
  name: string; 
  address: string; 
  annual_amount: number;
  upi_id: string; // 👈 Add upi_id to the interface
}

const mosqueAdminProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mosque, setmosque] = useState<mosque | null>(null);
  const [originalProfile, setOriginalProfile] = useState<Profile | null>(null);
  const [originalmosque, setOriginalmosque] = useState<mosque | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_mosque_admin_profile', { p_user_id: user.id });
      if (error) throw error;
      if (data) {
        setProfile(data.profile);
        setmosque(data.mosque);
        setOriginalProfile(data.profile);
        setOriginalmosque(data.mosque);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !mosque) return;
    setIsUpdating(true);
    const toastId = toast.loading('Updating profile...');
    try {
      // The existing edge function should handle the new 'upi_id' field automatically 
      // as long as it's passed in the 'mosqueUpdates' object.
      const { error } = await supabase.functions.invoke('update-mosque-profile', {
        body: { userId: user.id, profileUpdates: profile, mosqueUpdates: mosque },
      });
      if (error) throw new Error(error.message);
      toast.success('Profile updated successfully!', { id: toastId });
      setOriginalProfile(profile);
      setOriginalmosque(mosque);
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile.', { id: toastId });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setProfile(originalProfile);
    setmosque(originalmosque);
    setIsEditing(false);
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) return toast.error('Passwords do not match.');
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters.');
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

  if (loading || !profile || !mosque) {
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleUpdate}>
            <header className="card mb-8 bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Profile</h1>
                        <p className="text-lg text-gray-600 mt-1">Manage your personal and mosque details.</p>
                    </div>
                    {!isEditing && (
                        <button type="button" onClick={() => setIsEditing(true)} className="btn-primary">
                            <Edit className="h-4 w-4 mr-2" /> Edit Profile
                        </button>
                    )}
                </div>
            </header>

            <div className="space-y-8">
                {/* Personal Information */}
                <div className="card bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center"><User className="h-6 w-6 mr-3 text-primary-600"/> Personal Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="label">Full Name</label>
                            {isEditing ? (
                                <input type="text" value={profile.full_name} onChange={(e) => setProfile({...profile, full_name: e.target.value})} className="input-field"/>
                            ) : (
                                <p className="text-lg font-semibold text-gray-900">{profile.full_name}</p>
                            )}
                        </div>
                        <div>
                            <label className="label">Contact Number</label>
                            {isEditing ? (
                                <input type="text" value={profile.contact_number || ''} onChange={(e) => setProfile({...profile, contact_number: e.target.value})} className="input-field"/>
                            ) : (
                                <p className="text-lg font-semibold text-gray-900">{profile.contact_number}</p>
                            )}
                        </div>
                        <div>
                            <label className="label">Email Address</label>
                            <p className="text-lg font-semibold text-gray-900">{profile.email || ''}</p>
                        </div>
                    </div>
                </div>

                {/* mosque Details */}
                <div className="card bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center"><Building className="h-6 w-6 mr-3 text-primary-600"/> mosque Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="label">mosque Name</label>
                            {isEditing ? (
                                <input type="text" value={mosque.name} onChange={(e) => setmosque({...mosque, name: e.target.value})} className="input-field"/>
                            ) : (
                                <p className="text-lg font-semibold text-gray-900">{mosque.name}</p>
                            )}
                        </div>
                        <div>
                            <label className="label">Default Annual Amount</label>
                            {isEditing ? (
                                <input type="number" value={mosque.annual_amount} onChange={(e) => setmosque({...mosque, annual_amount: parseInt(e.target.value)})} className="input-field"/>
                            ) : (
                                <p className="text-lg font-semibold text-gray-900">{mosque.annual_amount}</p>
                            )}
                        </div>
                        <div className="md:col-span-2">
                            <label className="label">mosque Address</label>
                            {isEditing ? (
                                <input type="text" value={mosque.address} onChange={(e) => setmosque({...mosque, address: e.target.value})} className="input-field"/>
                            ) : (
                                <p className="text-lg font-semibold text-gray-900">{mosque.address}</p>
                            )}
                        </div>
                        
                        {/* --- UPI ID FIELD --- */}
                        <div className="md:col-span-2">
                            <label className="label flex items-center"><Wallet className="h-4 w-4 mr-2 text-gray-500" /> UPI ID for Collections</label>
                            {isEditing ? (
                                <input 
                                    type="text" 
                                    value={mosque.upi_id || ''} 
                                    onChange={(e) => setmosque({...mosque, upi_id: e.target.value})} 
                                    className="input-field"
                                    placeholder={'e.g., mosque-name@upi'}
                                />
                            ) : (
                                <p className="text-lg font-semibold text-gray-900">{mosque.upi_id || 'Not Set'}</p>
                            )}
                        </div>
                        {/* --- END of new field --- */}

                        <div>
                            <label className="label">City</label>
                            <p className="text-lg font-semibold text-gray-900">{profile.city || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="label">State</label>
                            <p className="text-lg font-semibold text-gray-900">{profile.state || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {isEditing && (
                <div className="mt-8 flex justify-end space-x-3">
                    <button type="button" onClick={handleCancelEdit} className="btn-primary"><X className="h-5 w-5 mr-2" /> Cancel</button>
                    <button type="submit" className="btn-primary" disabled={isUpdating}><Save className="h-5 w-5 mr-2" /> {isUpdating ? 'Saving...' : 'Save Changes'}</button>
                </div>
            )}
        </form>

        {/* Security Section */}
        <div className="card bg-white p-6 rounded-lg shadow-md mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Security</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div><h3 className="font-medium text-gray-800">Password</h3><p className="text-sm text-gray-500">Change your password to keep your account secure.</p></div>
              <button onClick={() => setShowPasswordModal(true)} className="btn-primary">Change</button>
            </div>
            <div className="flex justify-between items-center p-4 border rounded-lg bg-red-50 border-red-200">
              <div><h3 className="font-medium text-red-800">Log Out</h3><p className="text-sm text-red-600">You will be returned to the login screen.</p></div>
              <button onClick={handleLogout} className="btn-danger-outline"><LogOut className="h-4 w-4 mr-2" />Log Out</button>
            </div>
          </div>
        </div>
      </main>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
            <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field mt-1"
                  placeholder="At least 6 characters"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="input-field mt-1"
                  required
                />
              </div>
              <div className="pt-4 flex justify-end items-center">
                <div className="space-x-3">
                    <button type="button" onClick={() => setShowPasswordModal(false)} className="btn-primary">
                        Cancel
                    </button>
                    <button type="submit" className="btn-primary" disabled={isUpdating}>
                        {isUpdating ? 'Saving...' : 'Save'}
                    </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default mosqueAdminProfilePage;