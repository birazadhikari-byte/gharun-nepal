import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X, Bell } from 'lucide-react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

interface NotificationToastProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: Bell,
};

const colors = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
};

const iconColors = {
  success: 'text-green-600',
  error: 'text-red-600',
  info: 'text-blue-600',
  warning: 'text-yellow-600',
};

const NotificationToast: React.FC<NotificationToastProps> = ({ notifications, onDismiss }) => {
  useEffect(() => {
    notifications.forEach((n) => {
      const timer = setTimeout(() => onDismiss(n.id), 5000);
      return () => clearTimeout(timer);
    });
  }, [notifications, onDismiss]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[90] space-y-2 max-w-sm">
      {notifications.map((notification) => {
        const Icon = icons[notification.type];
        return (
          <div
            key={notification.id}
            className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg animate-in slide-in-from-right duration-300 ${colors[notification.type]}`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColors[notification.type]}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{notification.title}</p>
              <p className="text-xs mt-0.5 opacity-80">{notification.message}</p>
            </div>
            <button
              onClick={() => onDismiss(notification.id)}
              className="p-1 hover:bg-black/10 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationToast;
