import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Phone, Mail, Home, Users, Building, Edit, Save, X, KeyRound, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface HouseholdProfile {
  id: string;
  user_id: string;
  house_number: string;
  head_of_house: string;
  members_count: number;
  male_count: number;
  female_count: number;
  contact_number: string;
  annual_amount: number;
  mosque: {
    name: string;
    address: string;
  };
}

const ProfilePage: React.FC = () => {
  const { user, signOut } = useAuth(); // ✅ Destructure signOut from useAuth
  const navigate = useNavigate();
  const [household, setHousehold] = useState<HouseholdProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    full_name: '',
    head_of_house: '',
    members_count: 0,
    male_count: 0,
    female_count: 0,
    contact_number: '',
    house_number: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchHouseholdProfile();
    }
  }, [user]);

  useEffect(() => {
    if (user && household) {
      setEditData({
        full_name: user.full_name || '',
        head_of_house: household.head_of_house,
        members_count: household.members_count,
        male_count: household.male_count,
        female_count: household.female_count,
        contact_number: household.contact_number,
        house_number: household.house_number,
      });
      setLoading(false);
    } else if (user && !household) {
      setLoading(false);
    }
  }, [user, household]);

  const fetchHouseholdProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('households')
        .select('*, mosque:mosques!inner(name, address)')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setHousehold(data);
    } catch (error) {
      console.error('Error fetching household profile:', error);
      toast.error('Error loading profile information');
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!household || !user) {
      toast.error("User or household data is missing.");
      return;
    }

    if (editData.male_count + editData.female_count !== editData.members_count) {
      toast.error('Total members count should equal male + female count');
      return;
    }

    setSaving(true);
    try {
      const { error: householdError } = await supabase
        .from('households')
        .update({
          head_of_house: editData.head_of_house,
          members_count: editData.members_count,
          male_count: editData.male_count,
          female_count: editData.female_count,
          contact_number: editData.contact_number,
          house_number: editData.house_number,
          updated_at: new Date().toISOString(),
        })
        .eq('id', household.id);

      if (householdError) throw householdError;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: editData.full_name,
          phone: editData.contact_number,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast.success('Profile updated successfully');
      setIsEditing(false);
      fetchHouseholdProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user && household) {
      setEditData({
        full_name: user.full_name || '',
        head_of_house: household.head_of_house,
        members_count: household.members_count,
        male_count: household.male_count,
        female_count: household.female_count,
        contact_number: household.contact_number,
        house_number: household.house_number,
      });
    }
    setIsEditing(false);
  };

  const handleMaleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const maleCount = value === '' ? 0 : parseInt(value) || 0;
    const femaleCount = editData.female_count;
    setEditData({
      ...editData,
      male_count: maleCount,
      members_count: maleCount + femaleCount,
    });
  };

  const handleFemaleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const femaleCount = value === '' ? 0 : parseInt(value) || 0;
    const maleCount = editData.male_count;
    setEditData({
      ...editData,
      female_count: femaleCount,
      members_count: maleCount + femaleCount,
    });
  };
  
  const handleLogout = async () => {
    await signOut();
    navigate('/');
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

  if (!household) {
    return (
      <div>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
            <p className="text-gray-600">No household profile found. Please contact your mosque administrator.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600 mt-2">Manage your information</p>
          </div>

          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="btn-primary flex items-center">
              <Edit className="h-4 w-4 mr-2" /> Edit Profile
            </button>
          ) : (
            <div className="flex space-x-3">
              <button onClick={handleCancel} className="btn-secondary flex items-center" disabled={saving}>
                <X className="h-4 w-4 mr-2" /> Cancel
              </button>
              <button onClick={handleSave} className="btn-primary flex items-center" disabled={saving}>
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Account Info */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <User className="h-6 w-6 mr-2 text-primary-600" />
            Account Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.full_name}
                  onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                  className="input-field"
                />
              ) : (
                <p className="text-lg font-semibold text-gray-900">{editData.full_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Head of Household</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.head_of_house}
                  onChange={(e) => setEditData({ ...editData, head_of_house: e.target.value })}
                  className="input-field"
                />
              ) : (
                <p className="text-lg font-semibold text-gray-900">{household.head_of_house}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Total Members</label>
                <p className="text-lg font-semibold text-gray-900">{editData.members_count}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Male Count</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editData.male_count === 0 ? '' : editData.male_count}
                    onChange={handleMaleCountChange}
                    className="input-field"
                  />
                ) : (
                  <p className="text-lg font-semibold text-gray-900">{household.male_count}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Female Count</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editData.female_count === 0 ? '' : editData.female_count}
                    onChange={handleFemaleCountChange}
                    className="input-field"
                  />
                ) : (
                  <p className="text-lg font-semibold text-gray-900">{household.female_count}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Contact Number</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.contact_number}
                  onChange={(e) => setEditData({ ...editData, contact_number: e.target.value })}
                  className="input-field"
                />
              ) : (
                <p className="text-lg font-semibold text-gray-900">{household.contact_number}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Jamat Number</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.house_number}
                  onChange={(e) => setEditData({ ...editData, house_number: e.target.value })}
                  className="input-field"
                />
              ) : (
                <p className="text-lg font-semibold text-gray-900">{household.house_number}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
              <p className="text-gray-900 flex items-center">
                <Mail className="h-4 w-4 mr-2 text-gray-400" />
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Household Info */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Home className="h-6 w-6 mr-2 text-primary-600" />
            Household Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Mosque Name</p>
              <p className="text-lg font-semibold text-gray-900">{household.mosque.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Mosque Address</p>
              <p className="text-lg font-semibold text-gray-900">{household.mosque.address}</p>
            </div>
          </div>
        </div>

        {/* Log Out Button */}
        <div className="mt-8 flex justify-end">
          <button 
            onClick={handleLogout} 
            className="btn-Denger flex items-center"
          >
            <LogOut className="h-4 w-4 mr-2" /> Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;