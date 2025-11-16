// src/components/NotificationDropdown.tsx
import React, { useState } from 'react';
import NotificationBadge from './NotificationBadge';
import NotificationItem from './NotificationItem';
import { useNotifications } from '../hooks/useNotifications';
import { Bell } from 'lucide-react'; 

const NotificationDropdown: React.FC = () => {
    // We explicitly destructure markOneAsRead and pass it down. 
    // This is the correct way to handle its usage below.
    const { notifications, unreadCount, isLoading, markOneAsRead, markAllAsRead } = useNotifications(); 
    
    // We'll keep the filter state simple: 'All' or 'Unread'
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState<'All' | 'Unread'>('Unread'); 

    const filteredNotifications = notifications.filter(n => {
        // Now only checks against 'Unread' and 'All'
        if (filter === 'Unread') return !n.is_read;
        return true; 
    });

    return (
        <div className="relative inline-block text-left">
            {/* Bell Icon Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-gray-400 rounded-full hover:text-gray-600 hover:bg-gray-100 relative" 
                aria-expanded={isOpen}
            >
                <Bell className="w-6 h-6" aria-hidden="true" />
                <NotificationBadge count={unreadCount} />
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div
                    className="absolute right-0 z-50 w-80 md:w-96 mt-2 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg focus:outline-none"
                    role="menu"
                >
                    {/* Header and Controls */}
                    <div className="flex justify-between items-center p-3 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900">Alerts ({unreadCount})</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-sm text-primary-600 hover:text-primary-800 font-medium" 
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {/* Filters (Now strictly 'Unread' and 'All') */}
                    <div className="flex justify-around p-2 bg-gray-50 border-b border-gray-100">
                        {['Unread', 'All'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f as 'All' | 'Unread')} // Set the new simplified type
                                className={`px-3 py-1 text-xs font-medium rounded-full transition ${
                                    filter === f ? 'bg-primary-600 text-white' : 'text-gray-700 hover:bg-gray-200' 
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    {/* List Content */}
                    <ul className="max-h-96 overflow-y-auto divide-y divide-gray-200">
                        {isLoading && <li className="p-4 text-center text-gray-500">Loading alerts...</li>}
                        {!isLoading && filteredNotifications.length === 0 && (
                            <li className="p-4 text-center text-gray-500">
                                {filter === 'All' ? 'No notifications yet.' : `No ${filter.toLowerCase()} alerts.`}
                            </li>
                        )}

                        {!isLoading && filteredNotifications.map(n => (
                            <NotificationItem
                                key={n.id}
                                notification={n}
                                onMarkRead={markOneAsRead} // Passed correctly
                            />
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;