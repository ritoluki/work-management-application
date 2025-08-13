import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

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
  const stompClient = useRef(null);

  // Helper functions
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

  // Function to create detailed notification messages
  const createDetailedMessage = (type, data) => {
    const { taskName, workspaceName, boardName, groupName, dueDate, assignedBy, updatedBy } = data;
    const dueDateFormatted = dueDate ? new Date(dueDate).toLocaleDateString('vi-VN') : '';
    
    switch (type) {
      case 'TASK_ASSIGNED':
        return `Bạn vừa được ${assignedBy} giao task "${taskName}" (hạn: ${dueDateFormatted}) trong workspace "${workspaceName}" > board "${boardName}" > group "${groupName}"`;
      case 'TASK_UPDATED':
        return `Task "${taskName}" đã được ${updatedBy} cập nhật trong workspace "${workspaceName}" > board "${boardName}" > group "${groupName}"`;
      case 'DEADLINE_WARNING':
        return `Task "${taskName}" sẽ đến hạn (${dueDateFormatted}) trong workspace "${workspaceName}" > board "${boardName}" > group "${groupName}"`;
      case 'TASK_COMPLETED':
        return `Task "${taskName}" đã được hoàn thành trong workspace "${workspaceName}" > board "${boardName}" > group "${groupName}"`;
      default:
        return data.message || '';
    }
  };

  // Initialize STOMP WebSocket connection
  useEffect(() => {
    if (!user?.id) return;

    const connect = () => {
      try {
        // Create STOMP client with SockJS
        const client = new Client({
          webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
          connectHeaders: {
            userId: user.id.toString()
          },
          debug: function (str) {
            console.log('STOMP: ' + str);
          },
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
        });

        client.onConnect = function (frame) {
          console.log('Connected to WebSocket: ' + frame);
          
          // Subscribe to user-specific notification topic
          client.subscribe(`/topic/notifications/${user.id}`, function (message) {
            try {
              const notification = JSON.parse(message.body);
              console.log('Received notification via WebSocket:', notification);
              
              // Process the notification to add enhanced details
              const enhancedNotification = {
                ...notification,
                id: Date.now(), // Temporary ID
                createdAt: new Date(),
                isRead: false
              };

              // Parse metadata if exists
              if (notification.metadata) {
                try {
                  const taskDetails = JSON.parse(notification.metadata);
                  enhancedNotification.taskDetails = taskDetails;
                  // Create enhanced message
                  enhancedNotification.message = createDetailedMessage(notification.type, taskDetails);
                } catch (e) {
                  console.error('Error parsing notification metadata:', e);
                }
              }

              setNotifications(prev => [enhancedNotification, ...prev]);
              setUnreadCount(prev => prev + 1);

              // Show browser notification if permission granted
              showBrowserNotification(enhancedNotification);

              // Play notification sound (optional)
              playNotificationSound();
            } catch (error) {
              console.error('Error parsing notification:', error);
            }
          });

          // Subscribe to unread count updates
          client.subscribe(`/topic/unread-count/${user.id}`, function (message) {
            try {
              const data = JSON.parse(message.body);
              const count = data.count || data; // Handle both {count: X} and direct number
              setUnreadCount(count);
              console.log('Received unread count update:', count);
            } catch (error) {
              console.error('Error parsing unread count:', error);
            }
          });
        };

        client.onStompError = function (frame) {
          console.error('Broker reported error: ' + frame.headers['message']);
          console.error('Additional details: ' + frame.body);
        };

        client.onWebSocketClose = function (event) {
          console.log('WebSocket connection closed');
        };

        client.activate();
        stompClient.current = client;

      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        setTimeout(connect, 5000);
      }
    };

    connect();

    // Cleanup on unmount
    return () => {
      if (stompClient.current) {
        stompClient.current.deactivate();
      }
    };
  }, [user?.id]);

  // Load existing notifications on mount
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        console.log('Loading notifications for user:', user.id);
        const response = await fetch(`http://localhost:8080/api/notifications/user/${user.id}/unread`);
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (response.ok) {
          const notificationData = await response.json();
          console.log('Raw notification data from backend:', notificationData);
          
          // Parse metadata to add taskDetails
          const enhancedNotifications = notificationData.map(notification => {
            if (notification.metadata) {
              try {
                const taskDetails = JSON.parse(notification.metadata);
                return { ...notification, taskDetails };
              } catch (e) {
                console.error('Error parsing notification metadata:', e);
                return notification;
              }
            }
            return notification;
          });
          
          console.log('Enhanced notifications:', enhancedNotifications);
          setNotifications(enhancedNotifications);
          setUnreadCount(enhancedNotifications.filter(n => !n.isRead).length);
        } else {
          console.error('Failed to load notifications, status:', response.status);
          const errorText = await response.text();
          console.error('Error response:', errorText);
        }
      } catch (error) {
        console.error('Failed to load notifications from backend:', error);
        // Don't fallback to mock data - keep empty state
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    if (user?.id) {
      loadNotifications();
    }
  }, [user?.id]);

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/notifications/${notificationId}/read?userId=${user.id}`, {
        method: 'PUT'
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, isRead: true }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Fallback to local update
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/notifications/user/${user.id}/mark-all-read`, {
        method: 'PUT'
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      // Fallback to local update
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
    }
  };

  const clearAll = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/notifications/user/${user.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
      // Fallback to local update
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  // Function to navigate to a specific task
  const navigateToTask = (taskDetails) => {
    if (!taskDetails) return null;
    
    return {
      workspaceName: taskDetails.workspaceName,
      boardName: taskDetails.boardName,
      groupName: taskDetails.groupName,
      taskId: taskDetails.taskId || taskDetails.relatedEntityId,
      taskName: taskDetails.taskName
    };
  };

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    requestNotificationPermission,
    navigateToTask,
    createDetailedMessage
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
