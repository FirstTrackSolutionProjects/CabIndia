// src/Components/NotificationBell.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

export default function NotificationBell() {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'ride': return '🚗';
      case 'payment': return '💰';
      case 'alert': return '⚠️';
      case 'success': return '✅';
      case 'info': return 'ℹ️';
      default: return '📌';
    }
  };

  const getTimeAgo = (timestamp) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-800 transition-colors"
      >
        <Bell className="text-gray-400 hover:text-white transition-colors" size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 max-h-[400px] overflow-hidden bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl z-50">
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <h3 className="font-bold text-white">Notifications</h3>
            <div className="flex gap-2">
              {notifications.length > 0 && (
                <>
                  <button
                    onClick={markAllAsRead}
                    className="text-gray-400 hover:text-white transition-colors text-xs"
                  >
                    <CheckCheck size={16} />
                  </button>
                  <button
                    onClick={clearAll}
                    className="text-gray-400 hover:text-red-400 transition-colors text-xs"
                  >
                    <X size={16} />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="overflow-y-auto max-h-[320px]">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="mx-auto text-gray-600" size={32} />
                <p className="text-gray-400 mt-2">No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`p-3 border-b border-gray-800 hover:bg-gray-800 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-yellow-400/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notification.read ? 'text-white font-medium' : 'text-gray-400'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {getTimeAgo(notification.timestamp)}
                      </p>
                    </div>
                    {!notification.read && (
                      <span className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-2 border-t border-gray-800">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full text-center text-xs text-gray-500 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}