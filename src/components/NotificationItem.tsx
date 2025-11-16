// src/components/NotificationItem.tsx
import React from 'react';
import { Notification } from '../hooks/useNotifications';
import { formatTimeAgo } from '../utils/formatters';
import { CheckCircle, XCircle, AlertCircle, Info, Clock, HelpCircle, FileText } from 'lucide-react';

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: number) => void;
}

// Map notification type to a color/icon class matching your primary/success/error scheme
const typeStyles = {
  success: { color: 'text-green-700', bg: 'bg-green-100', icon: CheckCircle },
  error: { color: 'text-red-700', bg: 'bg-red-100', icon: XCircle },
  warning: { color: 'text-yellow-700', bg: 'bg-yellow-100', icon: AlertCircle },
  info: { color: 'text-primary-700', bg: 'bg-primary-100', icon: Info }, // Use primary/blue for general info/pending
  system: { color: 'text-gray-700', bg: 'bg-gray-100', icon: FileText },
};

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkRead }) => {
  const isUnread = !notification.is_read;
  const config = typeStyles[notification.type as keyof typeof typeStyles] || typeStyles.info;
  const Icon = config.icon;

  const handleItemClick = () => {
    if (isUnread) {
      onMarkRead(notification.id);
    }
    // TODO: Implement navigation logic using notification.source_table and notification.source_id
    // Example: navigate(generateRoute(notification));
  };

  return (
    <li
      className={`p-4 border-b last:border-b-0 cursor-pointer transition-all hover:bg-gray-100 ${isUnread ? 'font-semibold ' + config.bg : 'text-gray-600'}`}
      onClick={handleItemClick}
    >
      <div className="flex items-start">
        <div className={`p-2 rounded-full ${config.bg} mr-3`}>
          <Icon className={`h-5 w-5 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <h4 className={`text-sm ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>{notification.title}</h4>
            <span className="text-xs text-gray-400">{formatTimeAgo(notification.created_at)}</span>
          </div>
          <p className="mt-1 text-sm">{notification.message}</p>
          
          {isUnread && (
            <button
              onClick={(e) => {
                e.stopPropagation(); 
                onMarkRead(notification.id);
              }}
              className="mt-2 text-xs text-primary-500 hover:text-primary-700"
            >
              Mark as Read
            </button>
          )}
        </div>
      </div>
    </li>
  );
};

export default NotificationItem;