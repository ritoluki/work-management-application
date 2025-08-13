import React, { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';

const NotificationDebug = ({ user }) => {
  const [debugInfo, setDebugInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const { notifications, unreadCount } = useNotification();

  const testBackendConnection = async () => {
    setLoading(true);
    try {
      // Test basic API
      const testResponse = await fetch('http://localhost:8080/api/notifications/test');
      const testResult = await testResponse.json();
      
      // Test unread notifications
      const unreadResponse = await fetch(`http://localhost:8080/api/notifications/user/${user?.id}/unread`);
      const unreadResult = await unreadResponse.json();
      
      // Test unread count
      const countResponse = await fetch(`http://localhost:8080/api/notifications/user/${user?.id}/unread-count`);
      const countResult = await countResponse.json();
      
      setDebugInfo({
        backendTest: testResult,
        unreadNotifications: unreadResult,
        unreadCount: countResult,
        frontendState: {
          notificationsCount: notifications.length,
          unreadCount: unreadCount,
          user: user
        }
      });
    } catch (error) {
      setDebugInfo({
        error: error.message,
        frontendState: {
          notificationsCount: notifications.length,
          unreadCount: unreadCount,
          user: user
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const sendTestNotification = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          type: 'TASK_ASSIGNED',
          title: 'Debug Test Notification',
          message: 'This is a test notification from debug panel'
        })
      });
      
      const result = await response.json();
      alert(`Test notification sent: ${JSON.stringify(result, null, 2)}`);
      
      // Refresh debug info
      setTimeout(testBackendConnection, 1000);
    } catch (error) {
      alert(`Failed to send test notification: ${error.message}`);
    }
  };

  useEffect(() => {
    if (user?.id) {
      testBackendConnection();
    }
  }, [user?.id]);

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
        Notification System Debug
      </h3>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={testBackendConnection}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Backend Connection'}
        </button>
        
        <button
          onClick={sendTestNotification}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Send Test Notification
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Backend Status */}
        <div className="bg-white dark:bg-gray-700 p-3 rounded">
          <h4 className="font-medium mb-2 text-gray-800 dark:text-white">Backend Status</h4>
          <pre className="text-xs text-gray-600 dark:text-gray-300 overflow-auto max-h-40">
            {JSON.stringify(debugInfo.backendTest || {}, null, 2)}
          </pre>
        </div>

        {/* Frontend State */}
        <div className="bg-white dark:bg-gray-700 p-3 rounded">
          <h4 className="font-medium mb-2 text-gray-800 dark:text-white">Frontend State</h4>
          <pre className="text-xs text-gray-600 dark:text-gray-300 overflow-auto max-h-40">
            {JSON.stringify(debugInfo.frontendState || {}, null, 2)}
          </pre>
        </div>

        {/* Unread Notifications */}
        <div className="bg-white dark:bg-gray-700 p-3 rounded">
          <h4 className="font-medium mb-2 text-gray-800 dark:text-white">Unread Notifications (Backend)</h4>
          <pre className="text-xs text-gray-600 dark:text-gray-300 overflow-auto max-h-40">
            {JSON.stringify(debugInfo.unreadNotifications || [], null, 2)}
          </pre>
        </div>

        {/* Unread Count */}
        <div className="bg-white dark:bg-gray-700 p-3 rounded">
          <h4 className="font-medium mb-2 text-gray-800 dark:text-white">Unread Count (Backend)</h4>
          <pre className="text-xs text-gray-600 dark:text-gray-300 overflow-auto max-h-40">
            {JSON.stringify(debugInfo.unreadCount || {}, null, 2)}
          </pre>
        </div>
      </div>

      {debugInfo.error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {debugInfo.error}
        </div>
      )}
    </div>
  );
};

export default NotificationDebug;
