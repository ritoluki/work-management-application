import React, { useState } from 'react';
import { X, Users, ClipboardList, BarChart3 } from 'lucide-react';
import ErrorBoundary from './ui/ErrorBoundary';
import UserManagement from './ui/UserManagement';
import TaskManagement from './ui/TaskManagement';
import TaskStatistics from './TaskStatistics';

const AdminPanel = ({ onClose, currentUser }) => {
  const [activeTab, setActiveTab] = useState('users');

  const tabs = [
    { id: 'users', label: 'Users', icon: Users, component: UserManagement },
    { id: 'tasks', label: 'Tasks', icon: ClipboardList, component: TaskManagement },
    { id: 'statistics', label: 'Statistics', icon: BarChart3, component: TaskStatistics }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <ErrorBoundary>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <nav className="p-4 space-y-2">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
                        activeTab === tab.id
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
              <div className="p-6">
                <ErrorBoundary>
                  {ActiveComponent && (
                    activeTab === 'users' ? (
                      <ActiveComponent currentUser={currentUser} />
                    ) : activeTab === 'statistics' ? (
                      <ActiveComponent />
                    ) : (
                      <ActiveComponent />
                    )
                  )}
                </ErrorBoundary>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default AdminPanel;