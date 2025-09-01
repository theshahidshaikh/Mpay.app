import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Phone, Mail, Home, Users, Building, Edit, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface HouseholdProfile {
  id: string;
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
  const { user } = useAuth();
  const [household, setHousehold] = useState<HouseholdProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    head_of_house: '',
    members_count: 0,
    male_count: 0,
    female_count: 0,
    contact_number: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchHouseholdProfile();
    }
  }, [user]);

  const fetchHouseholdProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('households')
        .select(`
          *,
          mosque:mosques!inner(name, address)
        `)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      setHousehold(data);
      setEditData({
        head_of_house: data.head_of_house,
        members_count: data.members_count,
        male_count: data.male_count,
        female_count: data.female_count,
        contact_number: data.contact_number,
      });
    } catch (error) {
      console.error('Error fetching household profile:', error);
      toast.error('Error loading profile information');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!household) return;

    // Validate data
    if (editData.male_count + editData.female_count !== editData.members_count) {
      toast.error('Total members count should equal male + female count');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('households')
        .update({
          head_of_house: editData.head_of_house,
          members_count: editData.members_count,
          male_count: editData.male_count,
          female_count: editData.female_count,
          contact_number: editData.contact_number,
          updated_at: new Date().toISOString(),
        })
        .eq('id', household.id);

      if (error) throw error;

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
    setEditData({
      head_of_house: household?.head_of_house || '',
      members_count: household?.members_count || 0,
      male_count: household?.male_count || 0,
      female_count: household?.female_count || 0,
      contact_number: household?.contact_number || '',
    });
    setIsEditing(false);
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
            <p className="text-gray-600">
              No household profile found. Please contact your mosque administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Household Profile</h1>
            <p className="text-gray-600 mt-2">Manage your household information</p>
          </div>
          
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-primary flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </button>
          ) : (
            <div className="flex space-x-3">
              <button
                onClick={handleCancel}
                className="btn-secondary flex items-center"
                disabled={saving}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn-primary flex items-center"
                disabled={saving}
              >
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Account Info */}
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <User className="h-6 w-6 mr-2 text-primary-600" />
                Account Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                  <p className="text-lg font-semibold text-gray-900">{user?.full_name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
                  <p className="text-gray-900 flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    {user?.email}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Account Type</label>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                    Household User
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Household Details */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Home className="h-6 w-6 mr-2 text-primary-600" />
                Household Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">House Number</label>
                  <p className="text-lg font-semibold text-gray-900">{household.house_number}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Head of House</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.head_of_house}
                      onChange={(e) => setEditData({...editData, head_of_house: e.target.value})}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-lg font-semibold text-gray-900">{household.head_of_house}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Contact Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editData.contact_number}
                      onChange={(e) => setEditData({...editData, contact_number: e.target.value})}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-gray-900 flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      {household.contact_number}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Total Members</label>
                  {isEditing ? (
                    <input
                      type="number"
                      min="1"
                      value={editData.members_count}
                      onChange={(e) => setEditData({...editData, members_count: parseInt(e.target.value)})}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-lg font-semibold text-gray-900 flex items-center">
                      <Users className="h-5 w-5 mr-2 text-primary-600" />
                      {household.members_count}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Male Members</label>
                  {isEditing ? (
                    <input
                      type="number"
                      min="0"
                      value={editData.male_count}
                      onChange={(e) => setEditData({...editData, male_count: parseInt(e.target.value)})}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-lg font-semibold text-gray-900">{household.male_count}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Female Members</label>
                  {isEditing ? (
                    <input
                      type="number"
                      min="0"
                      value={editData.female_count}
                      onChange={(e) => setEditData({...editData, female_count: parseInt(e.target.value)})}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-lg font-semibold text-gray-900">{household.female_count}</p>
                  )}
                </div>
              </div>
              
              {/* Validation message for editing */}
              {isEditing && editData.male_count + editData.female_count !== editData.members_count && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">
                    Total members ({editData.members_count}) should equal male ({editData.male_count}) + female ({editData.female_count}) count.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mosque Information */}
        <div className="mt-8">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Building className="h-6 w-6 mr-2 text-primary-600" />
              Mosque Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Mosque Name</label>
                <p className="text-lg font-semibold text-gray-900">{household.mosque?.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
                <p className="text-gray-900">{household.mosque?.address}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Annual Collection Amount</label>
                <p className="text-lg font-semibold text-primary-600">
                  ₹{household.annual_amount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  Monthly: ₹{(household.annual_amount / 12).toFixed(0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;