import { useState, useEffect, useCallback, useMemo } from 'react'; 
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext'; 
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Define the structure based on public.notifications table
export interface Notification {
    id: number;
    created_at: string; 
    recipient_id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error' | 'system';
    is_read: boolean;
    source_table: string | null;
    source_id: string | null;
    metadata: Record<string, any> | null;
}

// Custom type for Realtime payload
type NotificationPayload = RealtimePostgresChangesPayload<Notification>;

// Define the structure for the new pending counts
interface PendingCounts {
    households: number; 
    collections: number; 
    requests: number; 
    mosqueregistrations: number; 
}

export const useNotifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const userId = user?.id;

    // --- Data Fetching ---
    // (A) Function to fetch notifications
    const fetchInitialNotifications = useCallback(async (id: string) => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('recipient_id', id)
            .order('created_at', { ascending: false })
            .limit(50); 

        setIsLoading(false);
        if (error) {
            console.error('Error fetching initial notifications:', error);
            return [];
        }
        setNotifications(data || []);
        return data || [];
    }, []);

    // (B) Helper function to trigger a full data refresh (used for reliability fallback)
    const forceRefresh = useCallback(() => {
        if (userId) {
            fetchInitialNotifications(userId);
        }
    }, [userId, fetchInitialNotifications]);

    // --- Realtime Handlers ---
    const handleInsert = useCallback((payload: NotificationPayload) => {
        const newNotification = payload.new as Notification;
        setNotifications(prev => [newNotification, ...prev]);
    }, []);

    const handleUpdate = useCallback((payload: NotificationPayload) => {
        const updatedNotification = payload.new as Notification;
        
        // Update the list with the new record
        setNotifications(prev => 
            prev.map(n => (n.id === updatedNotification.id ? updatedNotification : n))
        );
    }, []);

    // --- API Actions ---
    const markOneAsRead = async (notificationId: number) => {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId)
            .eq('recipient_id', userId) 
            .select()
            .single(); 
        
        if (error) {
            console.error('Error marking one as read:', error);
        } else {
             // FALLBACK: If the UPDATE succeeds, force a data refresh to update the UI immediately
             forceRefresh();
        }
    };

    const markAllAsRead = async () => {
        // Optimistic local update for faster UI response
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        
        const { error } = await supabase.rpc('mark_all_notifications_read');
        
        if (error) {
            console.error('Error marking all as read via RPC:', error);
        }
    };

    // --- Effect: Subscriptions and Initial Load ---
    useEffect(() => {
        if (!userId) {
            setNotifications([]);
            return;
        }

        // 1. Initial Load
        fetchInitialNotifications(userId);

        // 2. Realtime Subscription
        const channel = supabase
            .channel(`notifications_for_${userId}`)
            .on(
                'postgres_changes',
                { 
                    event: 'INSERT', 
                    schema: 'public', 
                    table: 'notifications', 
                    filter: `recipient_id=eq.${userId}` 
                },
                handleInsert
            )
            .on(
                'postgres_changes',
                { 
                    event: 'UPDATE', 
                    schema: 'public', 
                    table: 'notifications', 
                    filter: `recipient_id=eq.${userId}` 
                },
                handleUpdate
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, fetchInitialNotifications, handleInsert, handleUpdate]);

    // --- Computed Value: Pending Counts by Table (for navigation badges) ---
    const pendingCounts: PendingCounts = useMemo(() => {
        const counts: PendingCounts = {
            households: 0, 
            collections: 0, 
            requests: 0,
            mosqueregistrations: 0, 
        };

        // Filter only unread notifications relevant to admin tabs
        notifications.forEach(n => {
            if (!n.is_read) {
                // Mosque Admin Logic:
                if (n.source_table === 'households' && n.type === 'info') {
                    counts.households += 1; // New Household Registration
                } else if (n.source_table === 'profile_change_requests' && n.type === 'warning') {
                    counts.households += 1; // Pending Profile Request (Mosque Admin)
                    counts.requests += 1; // Pending Request (Super Admin)
                } else if (n.source_table === 'payments' && n.type === 'info') {
                    counts.collections += 1; 
                }
                
                // CITY/SUPER ADMIN Logic:
                else if (n.source_table === 'mosques' && n.type === 'info') {
                    counts.mosqueregistrations += 1; // New Mosque Registration
                }
                
                // FINAL FIX: Track new Admin registrations (source_table: 'admin_profiles')
                else if (n.source_table === 'admin_profiles' && n.type === 'info') {
                    counts.requests += 1; // Maps new Admin registration to Super Admin's 'Admins' tab
                }
            }
        });

        return counts;
    }, [notifications]);

    // --- Computed Value: Total Unread Count (for the main bell icon) ---
    const unreadCount = notifications.filter(n => !n.is_read).length;

    return { 
        notifications, 
        unreadCount, 
        pendingCounts, 
        isLoading,
        markOneAsRead, 
        markAllAsRead,
        fetchInitialNotifications, 
    };
};