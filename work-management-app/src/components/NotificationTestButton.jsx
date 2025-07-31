import React from 'react';
import { useNotification } from '../context/NotificationContext';

const NotificationTestButton = ({ currentUser }) => {
  const { addNotification } = useNotification();

  const testNotifications = [
    {
      userId: currentUser?.id || 1,
      type: 'TASK_ASSIGNED',
      title: 'Task được giao',
      message: 'John đã giao cho bạn task "Fix login bug"',
      relatedEntityType: 'TASK',
      relatedEntityId: 123
    },
    {
      userId: currentUser?.id || 1,
      type: 'COMMENT_ADDED', 
      title: 'Bình luận mới',
      message: 'Sarah đã bình luận: "Tuyệt vời! @username hãy xem này"',
      relatedEntityType: 'TASK',
      relatedEntityId: 124
    },
    {
      userId: currentUser?.id || 1,
      type: 'DEADLINE_WARNING',
      title: 'Cảnh báo deadline',
      message: 'Task "Deploy production" sẽ đến hạn trong 2 giờ nữa',
      relatedEntityType: 'TASK',
      relatedEntityId: 125
    },
    {
      userId: currentUser?.id || 1,
      type: 'BOARD_CREATED',
      title: 'Board mới',
      message: 'Manager đã tạo board "Mobile App Development"',
      relatedEntityType: 'BOARD',
      relatedEntityId: 5
    }
  ];

  const sendTestNotification = async () => {
    const randomNotification = testNotifications[Math.floor(Math.random() * testNotifications.length)];
    
    try {
      // Try to send via backend API first
      const response = await fetch('http://localhost:8080/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(randomNotification),
      });

      if (response.ok) {
        console.log('Notification sent via backend API');
      } else {
        throw new Error('Backend API failed');
      }
    } catch (error) {
      console.log('Backend not available, using local notification:', error.message);
      // Fallback to local notification
      addNotification(randomNotification);
    }
  };

  return (
    <button
      onClick={sendTestNotification}
      className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors z-50"
      title="Test notification"
    >
      🔔 Test Notification
    </button>
  );
};

export default NotificationTestButton;
