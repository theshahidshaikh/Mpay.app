import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Save, Edit, X, LogOut, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface AdminProfile {
  full_name: string;
  email: string;
  contact_number: string;
  city: string;
  state: string;
}

const SuperAdminProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<AdminProfile>({ full_name: '', email: '', contact_number: '', city: '', state: '' });
  const [originalProfile, setOriginalProfile] = useState<AdminProfile>({ full_name: '', email: '', contact_number: '', city: '', state: '' });
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // State for the password change modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_super_admin_profile', {
        p_user_id: user.id,
      });
      if (error) throw error;
      if (data) {
        setProfile(data);
        setOriginalProfile(data);
      }
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
    const toastId = toast.loading('Updating profile...');
    try {
      const { error } = await supabase
        .from('admin_profiles')
        .update({
          full_name: profile.full_name,
          contact_number: profile.contact_number,
          city: profile.city,
          state: profile.state,
        })
        .eq('id', user.id);
      if (error) throw error;
      toast.success('Profile updated successfully!', { id: toastId });
      setOriginalProfile(profile);
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile.', { id: toastId });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setProfile(originalProfile);
    setIsEditing(false);
  };

  const handlePasswordReset = async () => {
    if (!profile.email) {
        toast.error('Email not found, cannot send reset link.');
        return;
    }
    const toastId = toast.loading('Sending password reset email...');
    const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
        redirectTo: window.location.origin + '/update-password', // URL to your password update page
    });
    if (error) {
        toast.error(error.message, { id: toastId });
    } else {
        toast.success('Password reset email sent! Please check your inbox.', { id: toastId });
        setShowPasswordModal(false);
    }
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      return toast.error('New passwords do not match.');
    }
    if (newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters long.');
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
      setCurrentPassword('');
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
        {/* --- Profile Header --- */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 flex items-center space-x-6">
          <div className="flex-shrink-0 h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center">
            <User className="h-10 w-10 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{profile.full_name}</h1>
            <p className="text-gray-600">{profile.email}</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-2">
              Super Administrator
            </span>
          </div>
        </div>

        {/* --- Profile Information Card --- */}
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
              <input type="text" value={profile.state || ''} onChange={(e) => setProfile({ ...profile, state: e.target.value })} readOnly={!isEditing} className={`input-field mt-1 ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input type="text" value={profile.city || ''} onChange={(e) => setProfile({ ...profile, city: e.target.value })} readOnly={!isEditing} className={`input-field mt-1 ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}/>
            </div>
            {isEditing && (
              <div className="pt-2 flex justify-end space-x-3">
                <button type="button" onClick={handleCancelEdit} className="btn-secondary">
                  <X className="h-5 w-5 mr-2" /> Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isUpdating}>
                  <Save className="h-5 w-5 mr-2" /> {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* --- Security Card --- */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Security</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h3 className="font-medium text-gray-800">Password</h3>
                <p className="text-sm text-gray-500">Change your password to keep your account secure.</p>
              </div>
              <button onClick={() => setShowPasswordModal(true)} className="btn-secondary">
                Change
              </button>
            </div>
            <div className="flex justify-between items-center p-4 border rounded-lg bg-red-50 border-red-200">
              <div>
                <h3 className="font-medium text-red-800">Log Out</h3>
                <p className="text-sm text-red-600">You will be returned to the login screen.</p>
              </div>
              <button onClick={handleLogout} className="btn-danger-outline">
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
              </button>
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
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-field mt-1" placeholder="At least 6 characters" required/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="input-field mt-1" required/>
              </div>
              <div className="pt-4 flex justify-between items-center">
                <button type="button" onClick={handlePasswordReset} className="text-sm text-primary-600 hover:underline">
                    Forgot Password?
                </button>
                <div className="space-x-3">
                    <button type="button" onClick={() => setShowPasswordModal(false)} className="btn-secondary">
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

export default SuperAdminProfilePage;
