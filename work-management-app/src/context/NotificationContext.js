import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children, user }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!user?.id) return;

    const connectWebSocket = () => {
      try {
        // WebSocket connection
        socketRef.current = new WebSocket(`ws://localhost:8080/notifications?userId=${user.id}`);
        
        socketRef.current.onopen = () => {
          console.log('WebSocket connected for notifications');
        };

        socketRef.current.onmessage = (event) => {
          try {
            const notification = JSON.parse(event.data);
            addNotification(notification);
          } catch (error) {
            console.error('Error parsing notification:', error);
          }
        };

        socketRef.current.onclose = () => {
          console.log('WebSocket disconnected, attempting to reconnect...');
          // Reconnect after 5 seconds
          setTimeout(connectWebSocket, 5000);
        };

        socketRef.current.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        // Fallback - try to reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      }
    };

    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [user?.id]);

  // Load existing notifications on mount
  useEffect(() => {
    if (user?.id) {
      loadNotifications();
    }
  }, [user?.id]); // loadNotifications is defined inside useEffect, so no dependency needed

  const loadNotifications = async () => {
    try {
      // For now, we'll use mock data
      // Later this will be replaced with actual API call
      const mockNotifications = [
        {
          id: 1,
          type: 'TASK_ASSIGNED',
          title: 'New task assigned',
          message: 'John assigned you to "Fix login bug"',
          isRead: false,
          createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          relatedEntityType: 'TASK',
          relatedEntityId: 123
        },
        {
          id: 2,
          type: 'COMMENT_ADDED',
          title: 'New comment',
          message: 'Sarah commented on "Homepage redesign": "Looks great!"',
          isRead: false,
          createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
          relatedEntityType: 'TASK',
          relatedEntityId: 124
        },
        {
          id: 3,
          type: 'DEADLINE_WARNING',
          title: 'Deadline approaching',
          message: 'Task "Deploy to production" is due in 2 hours',
          isRead: true,
          createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
          relatedEntityType: 'TASK',
          relatedEntityId: 125
        }
      ];

      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: Date.now(), // Temporary ID
      createdAt: new Date(),
      isRead: false
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Show browser notification if permission granted
    showBrowserNotification(newNotification);

    // Play notification sound (optional)
    playNotificationSound();
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
    
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    setUnreadCount(0);
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const showBrowserNotification = (notification) => {
    if (Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id.toString(),
        silent: false
      });

      // Auto close after 5 seconds
      setTimeout(() => {
        browserNotification.close();
      }, 5000);
    }
  };

  const playNotificationSound = () => {
    try {
      // Create a subtle notification sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    requestNotificationPermission
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
