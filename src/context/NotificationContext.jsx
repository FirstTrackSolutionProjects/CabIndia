// src/context/NotificationContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      read: false,
      timestamp: new Date().toISOString(),
      ...notification
    };
    setNotifications(prev => [newNotification, ...prev]);
    
    // Show toast for real-time notifications
    if (notification.type === 'ride') {
      toast.info(`🚗 ${notification.message}`);
    } else if (notification.type === 'payment') {
      toast.success(`💰 ${notification.message}`);
    } else if (notification.type === 'alert') {
      toast.warning(`⚠️ ${notification.message}`);
    } else {
      toast.info(notification.message);
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  // Listen for SSE or WebSocket events (example)
  useEffect(() => {
    // This is where you'd connect to a WebSocket or SSE endpoint
    // Example: socket.on('notification', addNotification)
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearAll,
      getUnreadCount
    }}>
      {children}
    </NotificationContext.Provider>
  );
};