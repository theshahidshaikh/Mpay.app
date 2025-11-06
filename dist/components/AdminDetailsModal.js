import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, MapPin, Edit, Trash2, Save, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
const AdminDetailsModal = ({ isOpen, onClose, admin, onDataChange }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editableAdmin, setEditableAdmin] = useState({ ...admin });
    useEffect(() => {
        if (isOpen) {
            setEditableAdmin({ ...admin });
            setIsEditing(false);
        }
    }, [isOpen, admin]);
    if (!isOpen)
        return null;
    const handleModalContentClick = (e) => e.stopPropagation();
    const handleDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${admin.full_name}? This action cannot be undone.`)) {
            const toastId = toast.loading('Deleting admin...');
            try {
                // RENAMED FUNCTION
                const { error } = await supabase.functions.invoke('delete-city-admin', {
                    body: { userId: admin.id },
                });
                if (error)
                    throw error;
                toast.success('Admin deleted successfully.', { id: toastId });
                onDataChange();
                onClose();
            }
            catch (error) {
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
            if (error)
                throw error;
            toast.success('Changes saved successfully.', { id: toastId });
            onDataChange();
            setIsEditing(false);
        }
        catch (error) {
            toast.error(error.message || 'Failed to save changes.', { id: toastId });
        }
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditableAdmin(prev => ({ ...prev, [name]: value }));
    };
    return (_jsx("div", { onClick: onClose, className: "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 transition-opacity", children: _jsxs("div", { onClick: handleModalContentClick, className: "relative w-full max-w-lg rounded-lg bg-white p-8 shadow-2xl", children: [_jsx("button", { onClick: onClose, className: "absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-600 shadow-lg transition hover:bg-red-500 hover:text-white", children: _jsx(X, { className: "h-5 w-5" }) }), _jsxs("div", { className: "mb-6 flex items-center", children: [_jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600", children: _jsx(User, { className: "h-6 w-6" }) }), _jsxs("div", { className: "ml-4", children: [isEditing ? (_jsx("input", { type: "text", name: "full_name", value: editableAdmin.full_name, onChange: handleInputChange, className: "input-field text-2xl font-bold" })) : (_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: editableAdmin.full_name })), _jsx("p", { className: "text-md text-gray-500", children: "City Admin Details" })] })] }), _jsxs("div", { className: "space-y-4 text-gray-700", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Mail, { className: "mr-3 h-5 w-5 text-gray-400" }), _jsx("span", { children: admin.email })] }), _jsxs("div", { className: "flex items-center", children: [_jsx(Phone, { className: "mr-3 h-5 w-5 text-gray-400" }), isEditing ? (_jsx("input", { type: "text", name: "contact_number", value: editableAdmin.contact_number || '', onChange: handleInputChange, className: "input-field" })) : (_jsx("span", { children: editableAdmin.contact_number || 'Not Available' }))] }), _jsxs("div", { className: "flex items-center", children: [_jsx(MapPin, { className: "mr-3 h-5 w-5 text-gray-400" }), _jsxs("span", { children: [admin.city, ", ", admin.state] })] })] }), _jsx("div", { className: "mt-8 flex justify-end space-x-3 border-t pt-6", children: isEditing ? (_jsxs(_Fragment, { children: [_jsxs("button", { onClick: () => setIsEditing(false), className: "btn-secondary", children: [_jsx(XCircle, { className: "mr-2 h-4 w-4" }), "Cancel"] }), _jsxs("button", { onClick: handleSave, className: "btn-primary", children: [_jsx(Save, { className: "mr-2 h-4 w-4" }), "Save"] })] })) : (_jsxs(_Fragment, { children: [_jsxs("button", { onClick: () => setIsEditing(true), className: "btn-secondary", children: [_jsx(Edit, { className: "mr-2 h-4 w-4" }), "Edit"] }), _jsxs("button", { onClick: handleDelete, className: "btn-danger", children: [_jsx(Trash2, { className: "mr-2 h-4 w-4" }), "Delete"] })] })) })] }) }));
};
export default AdminDetailsModal;
