// src/hooks/useSessionTimeout.js
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export const useSessionTimeout = (timeoutMinutes = 60) => {
  const { logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const timerRef = useRef(null);
  const warningTimerRef = useRef(null);

  const clearTimers = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
  };

  const resetTimer = () => {
    clearTimers();
    setShowWarning(false);

    // Show warning 5 minutes before timeout
    const warningTime = (timeoutMinutes - 5) * 60 * 1000;
    if (warningTime > 0) {
      warningTimerRef.current = setTimeout(() => {
        setShowWarning(true);
        toast.warning('⏰ Your session will expire in 5 minutes. Click "Stay Logged In" to continue.', {
          position: 'top-center',
          autoClose: false,
          closeOnClick: false,
          draggable: false,
          onClick: () => resetTimer()
        });
      }, warningTime);
    }

    // Timeout after full duration
    timerRef.current = setTimeout(() => {
      logout();
      toast.info('Session expired. Please login again.');
    }, timeoutMinutes * 60 * 1000);
  };

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach(event => document.addEventListener(event, resetTimer));
    
    resetTimer();

    return () => {
      events.forEach(event => document.removeEventListener(event, resetTimer));
      clearTimers();
    };
  }, [logout, timeoutMinutes]);

  return { showWarning, resetTimer };
};