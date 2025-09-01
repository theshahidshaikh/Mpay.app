import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, MapPin, Edit, Trash2, Save, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface Admin {
  id: string;
  full_name: string;
  email: string;
  contact_number?: string;
  city: string;
  state: string;
}

interface AdminDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  admin: Admin;
  onDataChange: () => void;
}

const AdminDetailsModal: React.FC<AdminDetailsModalProps> = ({ isOpen, onClose, admin, onDataChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableAdmin, setEditableAdmin] = useState({ ...admin });

  useEffect(() => {
    if (isOpen) {
      setEditableAdmin({ ...admin });
      setIsEditing(false);
    }
  }, [isOpen, admin]);

  if (!isOpen) return null;

  const handleModalContentClick = (e: React.MouseEvent) => e.stopPropagation();

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${admin.full_name}? This action cannot be undone.`)) {
      const toastId = toast.loading('Deleting admin...');
      try {
        // RENAMED FUNCTION
        const { error } = await supabase.functions.invoke('delete-city-admin', {
          body: { userId: admin.id },
        });
        if (error) throw error;
        toast.success('Admin deleted successfully.', { id: toastId });
        onDataChange();
        onClose();
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete admin.', { id: toastId });
      }
    }
  };

  const handleSave = async () => {
    const toastId = toast.loading('Saving changes...');
    try {
      // RENAMED FUNCTION
      const { error } = await supabase.functions.invoke('update-city-admin-details', {
        body: {
          userId: admin.id,
          fullName: admin.full_name,
          updates: {
            contactNumber: editableAdmin.contact_number,
          },
        },
      });
      if (error) throw error;
      toast.success('Changes saved successfully.', { id: toastId });
      onDataChange();
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save changes.', { id: toastId });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditableAdmin(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 transition-opacity">
      <div onClick={handleModalContentClick} className="relative w-full max-w-lg rounded-lg bg-white p-8 shadow-2xl">
        <button onClick={onClose} className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-600 shadow-lg transition hover:bg-red-500 hover:text-white">
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 flex items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600"><User className="h-6 w-6" /></div>
          <div className="ml-4">
            {isEditing ? (
              <input type="text" name="full_name" value={editableAdmin.full_name} onChange={handleInputChange} className="input-field text-2xl font-bold" />
            ) : (
              <h2 className="text-2xl font-bold text-gray-900">{editableAdmin.full_name}</h2>
            )}
            <p className="text-md text-gray-500">City Admin Details</p>
          </div>
        </div>

        <div className="space-y-4 text-gray-700">
          <div className="flex items-center"><Mail className="mr-3 h-5 w-5 text-gray-400" /><span>{admin.email}</span></div>
          <div className="flex items-center">
            <Phone className="mr-3 h-5 w-5 text-gray-400" />
            {isEditing ? (
              <input type="text" name="contact_number" value={editableAdmin.contact_number || ''} onChange={handleInputChange} className="input-field" />
            ) : (
              <span>{editableAdmin.contact_number || 'Not Available'}</span>
            )}
          </div>
          <div className="flex items-center"><MapPin className="mr-3 h-5 w-5 text-gray-400" /><span>{admin.city}, {admin.state}</span></div>
        </div>

        <div className="mt-8 flex justify-end space-x-3 border-t pt-6">
          {isEditing ? (
            <>
              <button onClick={() => setIsEditing(false)} className="btn-secondary"><XCircle className="mr-2 h-4 w-4" />Cancel</button>
              <button onClick={handleSave} className="btn-primary"><Save className="mr-2 h-4 w-4" />Save</button>
            </>
          ) : (
            <>
              <button onClick={() => setIsEditing(true)} className="btn-secondary"><Edit className="mr-2 h-4 w-4" />Edit</button>
              <button onClick={handleDelete} className="btn-danger"><Trash2 className="mr-2 h-4 w-4" />Delete</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDetailsModal;