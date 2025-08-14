import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, Trash2, ExternalLink, Calendar, MapPin } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const NotificationDropdown = ({ onNavigateToTask }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearAll,
    requestNotificationPermission,
    navigateToTask,
    createDetailedMessage
  } = useNotification();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Request browser notification permission on first interaction
  const handleBellClick = async () => {
    setIsOpen(!isOpen);
    
    // Request permission if not already granted
    if (Notification.permission === 'default') {
      await requestNotificationPermission();
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'TASK_ASSIGNED':
        return '📋';
      case 'TASK_UPDATED':
        return '✏️';
      case 'TASK_COMPLETED':
        return '✅';
      case 'COMMENT_ADDED':
        return '💬';
      case 'DEADLINE_WARNING':
        return '⚠️';
      case 'BOARD_CREATED':
        return '📊';
      case 'USER_JOINED':
        return '👋';
      default:
        return '🔔';
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - new Date(date)) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    // Navigate to related task if it has task details
    if (notification.taskDetails && onNavigateToTask) {
      const navigationData = navigateToTask({
        ...notification.taskDetails,
        relatedEntityId: notification.relatedEntityId
      });
      onNavigateToTask(navigationData);
      setIsOpen(false); // Close dropdown after navigation
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={handleBellClick}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors duration-200"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-[1300] max-h-96 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
            <h3 className="font-semibold text-gray-800 dark:text-white">
              Thông báo {unreadCount > 0 && `(${unreadCount})`}
            </h3>
            <div className="flex items-center gap-2">
              {/* Mark All as Read */}
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="p-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="Đánh dấu tất cả đã đọc"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              
              {/* Clear All */}
              {notifications.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('Bạn có chắc muốn xóa tất cả thông báo?')) {
                      clearAll();
                    }
                  }}
                  className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Xóa tất cả"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Chưa có thông báo nào
                </p>
              </div>
            ) : (
              /* Notifications */
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`
                    p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                    ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500' : ''}
                  `}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <span className="text-lg flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </span>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800 dark:text-white text-sm leading-tight">
                            {notification.title}
                          </h4>
                          
                          {/* Detailed message based on taskDetails */}
                          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1 leading-relaxed">
                            {notification.taskDetails ? 
                              createDetailedMessage(notification.type, notification.taskDetails) 
                              : notification.message
                            }
                          </p>
                          
                          {/* Task location info */}
                          {notification.taskDetails && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
                              <MapPin className="w-3 h-3" />
                              <span>
                                {notification.taskDetails.workspaceName} → {notification.taskDetails.boardName} → {notification.taskDetails.groupName}
                              </span>
                            </div>
                          )}
                          
                          {/* Due date info */}
                          {notification.taskDetails?.dueDate && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                              <Calendar className="w-3 h-3" />
                              <span>Hạn: {new Date(notification.taskDetails.dueDate).toLocaleDateString('vi-VN')}</span>
                            </div>
                          )}
                          
                          <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
                            {getTimeAgo(notification.createdAt)}
                          </p>
                        </div>
                        
                        {/* Read Status and Navigate Icon */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {notification.taskDetails && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNotificationClick(notification);
                              }}
                              className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                              title="Click để xem task"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          )}
                          
                          {!notification.isRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              title="Đánh dấu đã đọc"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          )}
                          
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{notifications.length} thông báo</span>
                {unreadCount > 0 && (
                  <span>{unreadCount} chưa đọc</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
