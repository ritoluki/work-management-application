import React from 'react';
import { useNotification } from '../context/NotificationContext';

const NotificationTestButton = () => {
  const { addNotification } = useNotification();

  const testNotifications = [
    {
      type: 'TASK_ASSIGNED',
      title: 'Task được giao',
      message: 'John đã giao cho bạn task "Fix login bug"'
    },
    {
      type: 'COMMENT_ADDED', 
      title: 'Bình luận mới',
      message: 'Sarah đã bình luận: "Tuyệt vời! @username hãy xem này"'
    },
    {
      type: 'DEADLINE_WARNING',
      title: 'Cảnh báo deadline',
      message: 'Task "Deploy production" sẽ đến hạn trong 2 giờ nữa'
    },
    {
      type: 'BOARD_CREATED',
      title: 'Board mới',
      message: 'Manager đã tạo board "Mobile App Development"'
    }
  ];

  const sendTestNotification = () => {
    const randomNotification = testNotifications[Math.floor(Math.random() * testNotifications.length)];
    addNotification(randomNotification);
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
