import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Shield, Eye, EyeOff, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const indianStates = [ "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal" ];

const AdminRegistrationPage: React.FC = () => {
  const [role, setRole] = useState<'city_admin' | 'super_admin'>('city_admin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Submitting registration...');

    try {
      const { data, error } = await supabase.functions.invoke('create-admin', {
        body: {
          email,
          password,
          fullName,
          role,
          contactNumber,
          city: role === 'city_admin' ? city : undefined,
          state: role === 'city_admin' ? state : undefined,
        },
      });

      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);
      
      toast.success('Registration successful! Please wait for approval.', { id: toastId });
      navigate('/awaiting-approval');
    } catch (error: any) {
      toast.error(error.message || 'Failed to register.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <Shield className="h-12 w-12 text-primary-600 mx-auto" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Admin Registration</h2>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <select value={role} onChange={(e) => setRole(e.target.value as any)} className="input-field" required>
            <option value="city_admin">City Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
          <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field" required />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" required />
          <input type="password" placeholder="Password (min. 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" required />
          <input type="text" placeholder="Contact Number" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} className="input-field" />
          
          {role === 'city_admin' && (
            <>
              <select value={state} onChange={(e) => setState(e.target.value)} className="input-field" required={role === 'city_admin'}>
                <option value="" disabled>-- Select Assigned State --</option>
                {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input type="text" placeholder="Assigned City" required={role === 'city_admin'} value={city} onChange={(e) => setCity(e.target.value)} className="input-field" />
            </>
          )}

          <div className="pt-4">
            <button type="submit" disabled={loading} className="btn-primary w-full">
              <Save className="h-5 w-5 mr-2" />
              {loading ? 'Submitting...' : 'Submit for Approval'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminRegistrationPage;