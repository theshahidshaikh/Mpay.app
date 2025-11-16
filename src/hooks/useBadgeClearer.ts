// src/hooks/useBadgeClearer.ts (FINAL CODE with City/Super Admin Logic)

import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from './useNotifications'; // Import to trigger refetch

const useBadgeClearer = () => {
    const { user } = useAuth();
    const location = useLocation();
    const { fetchInitialNotifications } = useNotifications(); // Get the function to refresh state

    const clearBadge = useCallback(async (sourceTable: string) => {
        if (!user) return;
        
        console.log(`Clearing notifications for source: ${sourceTable}`);
        
        const { error } = await supabase.rpc('mark_notifications_read_by_source', {
            source_table_name: sourceTable
        });
        
        if (error) {
            console.error(`Error clearing badge for ${sourceTable}:`, error);
        } else {
            // CRITICAL: Force the hook state to refresh instantly
            // The individual API call bypasses Realtime, so we must manually refetch.
            fetchInitialNotifications(user.id);
        }
    }, [user, fetchInitialNotifications]);


    useEffect(() => {
        if (!user || !user.role) return;

        let sourceTableToClear: string | null = null;
        
        // --- Mosque Admin Logic ---
        if (user.role === 'mosque_admin') {
            if (location.pathname.startsWith('/admin/households')) {
                // Clears Household Registrations ('households') AND Profile Change Requests ('profile_change_requests')
                clearBadge('households'); 
                clearBadge('profile_change_requests'); 
                return;
            } else if (location.pathname.startsWith('/admin/collections')) {
                // Clears new payments ('payments')
                sourceTableToClear = 'payments';
            }
        }
        
        // --- City Admin Logic ---
        else if (user.role === 'city_admin') {
            if (location.pathname.startsWith('/city/mosques')) {
                // Clears New Mosque Registrations ('mosques')
                sourceTableToClear = 'mosques';
            } 
            // Note: City Admins don't generally handle profile requests, but if they did, you'd add:
            // else if (location.pathname.startsWith('/city/admins')) { sourceTableToClear = 'profile_change_requests'; }
        }

        // --- Super Admin Logic ---
        else if (user.role === 'super_admin') {
            if (location.pathname.startsWith('/super/mosques')) {
                // Clears New Mosque Registrations ('mosques')
                sourceTableToClear = 'mosques';
            } else if (location.pathname.startsWith('/super/admins') || location.pathname.startsWith('/super/requests')) {
                // Clears pending Profile Change Requests ('profile_change_requests')
                sourceTableToClear = 'profile_change_requests';
            }
        }


        if (sourceTableToClear) {
            clearBadge(sourceTableToClear);
        }

    }, [location.pathname, user, clearBadge]); // Reruns whenever the route changes or user logs in
};

export default useBadgeClearer;