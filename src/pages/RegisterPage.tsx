import React, {useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Building, Mail, Lock, Eye, EyeOff, User, MapPin, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [role, setRole] = useState<'household' | 'mosque_admin'>('household');
  
  // State for the new contact number field
  const [contactNumber, setContactNumber] = useState('');

  const [mosquesInCity, setmosquesInCity] = useState<{ id: string; name: string }[]>([]);
  const [selectedmosqueId, setSelectedmosqueId] = useState('');

  const [householdDetails, setHouseholdDetails] = useState({
    house_number: '',
    male_count: '',
    female_count: '',
    monthly_amount: '',
  });

  const [minMonthlyAmount, setMinMonthlyAmount] = useState<number | null>(null);
  const [mosqueDetails, setmosqueDetails] = useState({ name: '', address: '', monthly_amount: '500' });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchmosques = async () => {
      if (city.length < 3) {
        setmosquesInCity([]);
        return;
      }
      try {
        const { data, error } = await supabase.rpc('get_mosques_by_city', { city_name: city });
        if (error) throw error;
        setmosquesInCity(data || []);
      } catch (error) {
        console.error('Error fetching mosques:', error);
        setmosquesInCity([]);
      }
    };

    const handler = setTimeout(() => {
      if (role === 'household') {
        fetchmosques();
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [city, role]);

  useEffect(() => {
    const fetchmosqueDetails = async () => {
        if (!selectedmosqueId) {
            setMinMonthlyAmount(null);
            setHouseholdDetails(prev => ({ ...prev, monthly_amount: '' }));
            return;
        }
        try {
            const { data, error } = await supabase
                .from('mosques')
                .select('annual_amount')
                .eq('id', selectedmosqueId)
                .single();
            if (error) throw error;
            if (data) {
                const minAmount = Math.round(data.annual_amount / 12);
                setMinMonthlyAmount(minAmount);
                setHouseholdDetails(prev => ({ ...prev, monthly_amount: minAmount.toString() }));
            }
        } catch (error) {
            toast.error("Could not fetch mosque details.");
        }
    };
    fetchmosqueDetails();
  }, [selectedmosqueId]);

  const handleMonthlyAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHouseholdDetails({ ...householdDetails, monthly_amount: e.target.value });
  };

  const handleMonthlyAmountBlur = () => {
    if (minMonthlyAmount !== null) {
        const currentAmount = parseInt(householdDetails.monthly_amount) || 0;
        if (currentAmount < minMonthlyAmount) {
            toast.error(`Amount cannot be less than the minimum of ₹${minMonthlyAmount}.`);
            setHouseholdDetails({ ...householdDetails, monthly_amount: minMonthlyAmount.toString() });
        }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return toast.error('Passwords do not match');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    
    const monthlyAmount = parseInt(householdDetails.monthly_amount) || 0;
    if (role === 'household' && minMonthlyAmount && monthlyAmount < minMonthlyAmount) {
        return toast.error(`Contribution cannot be less than the minimum of ₹${minMonthlyAmount}.`);
    }

    setLoading(true);

    const maleCount = parseInt(householdDetails.male_count) || 0;
    const femaleCount = parseInt(householdDetails.female_count) || 0;
    const mosqueMonthlyAmount = parseInt(mosqueDetails.monthly_amount) || 0;

    const body = {
      email, password, fullName, city, state, role,
      contactNumber: contactNumber, // Pass the contact number for both roles
      mosqueId: role === 'household' ? selectedmosqueId : undefined,
      householdDetails: role === 'household' ? { 
        ...householdDetails, 
        male_count: maleCount,
        female_count: femaleCount,
        members_count: maleCount + femaleCount,
        annual_amount: monthlyAmount * 12,
      } : undefined,
      mosqueDetails: role === 'mosque_admin' ? {
        name: mosqueDetails.name,
        address: mosqueDetails.address,
        annual_amount: mosqueMonthlyAmount * 12
      } : undefined,
    };

    try {
      const { error } = await supabase.functions.invoke('unified-signup', { body });
      if (error) throw new Error(error.message);
      toast.success('Registration successful! Please wait for approval.');
      navigate('/awaiting-approval');
    } catch (error: any) {
      toast.error(error.message || 'Sign-up failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="flex justify-center">
            <Building className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Create your account</h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input type="text" placeholder="Your Full Name" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field" />
            <input type="email" placeholder="Email Address" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
            
            <input type="tel" placeholder="Contact Number" required value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} className="input-field" />

            <select value={state} onChange={(e) => setState(e.target.value)} className="input-field" required>
              <option value="" disabled>-- Select Your State --</option>
              {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <input type="text" placeholder="City" required value={city} onChange={(e) => setCity(e.target.value)} className="input-field" />
            
            <select value={role} onChange={(e) => setRole(e.target.value as any)} className="input-field">
              <option value="household">Join a mosque (as a Household)</option>
              <option value="mosque_admin">Register a New mosque (as an Admin)</option>
            </select>
          </div>
          
          <hr/>

          {role === 'household' && (
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-semibold text-center text-gray-700">Household Details</h3>
              <p className="text-xs text-center text-gray-500 -mt-2">The person registering is considered the head of the house.</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select a mosque in {city || 'your city'}</label>
                <select value={selectedmosqueId} onChange={(e) => setSelectedmosqueId(e.target.value)} className="input-field" required>
                  <option value="" disabled>-- Select a mosque --</option>
                  {mosquesInCity.map((mosque) => (<option key={mosque.id} value={mosque.id}>{mosque.name}</option>))}
                </select>
              </div>
              <input type="text" placeholder="Jamat Number" required value={householdDetails.house_number} onChange={(e) => setHouseholdDetails({...householdDetails, house_number: e.target.value})} className="input-field" />
              <input type="number" placeholder="Number of Male Members" required min="0" value={householdDetails.male_count} onChange={(e) => setHouseholdDetails({...householdDetails, male_count: e.target.value})} className="input-field" />
              <input type="number" placeholder="Number of Female Members" required min="0" value={householdDetails.female_count} onChange={(e) => setHouseholdDetails({...householdDetails, female_count: e.target.value})} className="input-field" />
              
              {selectedmosqueId && minMonthlyAmount !== null && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Monthly Contribution</label>
                    <input type="number" placeholder="Monthly Amount" required min={minMonthlyAmount} value={householdDetails.monthly_amount} onChange={handleMonthlyAmountChange} onBlur={handleMonthlyAmountBlur} className="input-field" />
                    <p className="text-xs text-gray-500 mt-1">Minimum amount for this mosque is ₹{minMonthlyAmount}.</p>
                </div>
              )}
            </div>
          )}
          
          {role === 'mosque_admin' && (
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-semibold text-center text-gray-700">New mosque Details</h3>
              <input type="text" placeholder="mosque Name" required value={mosqueDetails.name} onChange={(e) => setmosqueDetails({ ...mosqueDetails, name: e.target.value })} className="input-field" />
              <input type="text" placeholder="mosque Address" required value={mosqueDetails.address} onChange={(e) => setmosqueDetails({ ...mosqueDetails, address: e.target.value })} className="input-field" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Monthly Amount</label>
                <input type="number" required value={mosqueDetails.monthly_amount} onChange={(e) => setmosqueDetails({ ...mosqueDetails, monthly_amount: e.target.value })} className="input-field" />
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="Create a password" />
                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
              <div className="relative">
                <input type={showConfirmPassword ? 'text' : 'password'} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field" placeholder="Confirm your password" />
                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div> : 'Create Account'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
