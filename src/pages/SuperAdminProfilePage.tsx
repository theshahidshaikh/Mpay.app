import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Save, Edit, X, LogOut, KeyRound, Mail, Phone } from 'lucide-react'; // Added Mail, Phone icons
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface AdminProfile {
  full_name: string;
  email: string;
  contact_number: string;
}

const SuperAdminProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<AdminProfile>({ full_name: '', email: '', contact_number: '' });
  const [originalProfile, setOriginalProfile] = useState<AdminProfile>({ full_name: '', email: '', contact_number: '' });
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

  // --- UPDATED: Logic to verify current password before changing ---
  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Client-side validation
    if (!currentPassword) {
      return toast.error('Please enter your current password.');
    }
    if (newPassword !== confirmNewPassword) {
      return toast.error('New passwords do not match.');
    }
    if (newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters long.');
    }

    setIsUpdating(true);
    const toastId = toast.loading('Verifying and changing password...');

    try {
      // Step 1: Verify the current password by trying to sign in with it.
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: currentPassword,
      });

      if (signInError) {
        throw new Error('Incorrect current password. Please try again.');
      }

      // Step 2: If verification is successful, update to the new password.
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      toast.success('Password changed successfully!', { id: toastId });
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password.', { id: toastId });
    } finally {
      setIsUpdating(false);
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
        
        {/* --- Profile Header Card --- */}
        <div className="card p-6 mb-8 flex items-center space-x-6">
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

      {/* --- Personal Information Card --- */}
        <div className="card p-6 mb-8">
          <form onSubmit={handleUpdateProfile}>
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center"><User className="h-5 w-5 mr-2 text-primary-600" /> Personal Information</h2>
              {!isEditing && (
                <button type="button" onClick={() => setIsEditing(true)} className="btn-primary">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              )}
            </div>

            <div className="space-y-6">
              
              {/* Full Name Field */}
              <div className="grid grid-cols-3 items-center">
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <div className="col-span-2">
                  {isEditing ? (
                    <input type="text" value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} className="input-field"/>
                  ) : (
                    <p className="text-gray-800">{profile.full_name}</p>
                  )}
                </div>
              </div>

              {/* Contact Number Field */}
              <div className="grid grid-cols-3 items-center">
                <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                <div className="col-span-2 flex items-center">
                  {isEditing ? (
                    <input type="text" value={profile.contact_number || ''} onChange={(e) => setProfile({ ...profile, contact_number: e.target.value })} className="input-field"/>
                  ) : (
                    <p className="text-gray-800 flex items-center"><Phone className="h-4 w-4 mr-2 text-gray-400" />{profile.contact_number || 'N/A'}</p>
                  )}
                </div>
              </div>
              
              {/* Email Address Field (Read-only) */}
              <div className="grid grid-cols-3 items-center">
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <div className="col-span-2">
                  <p className="text-gray-800 flex items-center"><Mail className="h-4 w-4 mr-2 text-gray-400" />{profile.email}</p>
                </div>
              </div>

            </div>

            {isEditing && (
              <div className="pt-6 mt-6 border-t flex justify-end space-x-3">
                <button type="button" onClick={handleCancelEdit} className="btn-primary">
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
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center"><KeyRound className="h-5 w-5 mr-2 text-primary-600" /> Account Security</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h3 className="font-medium text-gray-800">Password</h3>
                <p className="text-sm text-gray-500">Change your password to keep your account secure.</p>
              </div>
              <button onClick={() => setShowPasswordModal(true)} className="btn-primary">
                Change
              </button>
            </div>
          </div>
        </div>
      </main>

{/* --- UPDATED: Change Password Modal --- */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
            <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
              {/* NEW: Current Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input-field mt-1"
                  required
                />
              </div>

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

export default SuperAdminProfilePage;