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
  const [isConnected, setIsConnected] = useState(false);

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
          setIsConnected(true);
          
          // Subscribe to user-specific notification topic
          client.subscribe(`/topic/notifications/${user.id}`, function (message) {
            try {
              const notification = JSON.parse(message.body);
              console.log('Received notification via WebSocket:', notification);
              addNotification(notification);
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
          setIsConnected(false);
        };

        client.onWebSocketClose = function (event) {
          console.log('WebSocket connection closed');
          setIsConnected(false);
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
        // Load notifications from backend API
        const response = await fetch(`http://localhost:8080/api/notifications/user/${user.id}/unread`);
        if (response.ok) {
          const notificationData = await response.json();
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
          
          setNotifications(enhancedNotifications);
          setUnreadCount(enhancedNotifications.filter(n => !n.isRead).length);
        }
      } catch (error) {
        console.error('Failed to load notifications:', error);
        // Fallback to mock data for development
        const mockNotifications = [
          {
            id: 1,
            type: 'TASK_ASSIGNED',
            title: 'Task được giao',
            message: 'Bạn vừa được Admin giao task "Fix login bug"',
            isRead: false,
            createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
            relatedEntityType: 'TASK',
            relatedEntityId: 123,
            taskDetails: {
              taskName: 'Fix login bug',
              dueDate: '2025-02-05',
              workspaceName: 'VIP 1',
              boardName: 'Board 1',
              groupName: 'Group 1',
              assignedBy: 'Admin'
            }
          },
          {
            id: 2,
            type: 'TASK_UPDATED',
            title: 'Task được cập nhật',
            message: 'Task "Update UI components" đã được Manager cập nhật',
            isRead: false,
            createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
            relatedEntityType: 'TASK',
            relatedEntityId: 124,
            taskDetails: {
              taskName: 'Update UI components',
              dueDate: '2025-02-10',
              workspaceName: 'VIP 1',
              boardName: 'Board 1',
              groupName: 'Group 1',
              updatedBy: 'Manager'
            }
          },
          {
            id: 3,
            type: 'DEADLINE_WARNING',
            title: 'Cảnh báo deadline',
            message: 'Task "Deploy production" sẽ đến hạn trong 2 giờ nữa',
            isRead: true,
            createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
            relatedEntityType: 'TASK',
            relatedEntityId: 125,
            taskDetails: {
              taskName: 'Deploy production',
              dueDate: '2025-01-31',
              workspaceName: 'VIP 1',
              boardName: 'Board 1',
              groupName: 'Group 1'
            }
          }
        ];

        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
      }
    };

    if (user?.id) {
      loadNotifications();
    }
  }, [user?.id]);

  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: Date.now(), // Temporary ID
      createdAt: new Date(),
      isRead: false
    };

    // Parse metadata if exists
    if (notification.metadata) {
      try {
        const taskDetails = JSON.parse(notification.metadata);
        newNotification.taskDetails = taskDetails;
      } catch (e) {
        console.error('Error parsing notification metadata:', e);
      }
    }

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Show browser notification if permission granted
    showBrowserNotification(newNotification);

    // Play notification sound (optional)
    playNotificationSound();
  };

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

  const value = {
    notifications,
    unreadCount,
    addNotification,
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
