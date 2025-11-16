import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Hourglass, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

const AwaitingApprovalPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const toastId = toast.loading('Logging out...');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Logged out successfully', { id: toastId });
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Failed to log out.', { id: toastId });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center p-8 bg-white rounded-xl shadow-lg">
        <div className="flex justify-center">
          <Hourglass className="h-16 w-16 text-primary-600" />
        </div>
        <h2 className="mt-6 text-3xl font-bold text-gray-900">
          Registration Submitted
        </h2>
        <p className="mt-4 text-gray-600">
          Thank you for registering. Your account is currently pending approval from an administrator.
        </p>
        <p className="mt-2 text-gray-600">
          You will be notified once your account has been activated.
        </p>
        <div className="mt-8">
          <button 
            onClick={handleLogout} 
            className="btn-primary w-full flex items-center justify-center"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default AwaitingApprovalPage;