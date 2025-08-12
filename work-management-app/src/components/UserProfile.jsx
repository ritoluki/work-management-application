import React, { useRef } from 'react';
import { User, Camera, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import ErrorBoundary from './ui/ErrorBoundary';
import ProfileInfoSection from './ui/ProfileInfoSection';
import PasswordChangeSection from './ui/PasswordChangeSection';
import { useProfileManagement } from '../hooks/useProfileManagement';
import { getRoleIcon } from '../utils/mockUsers';
import { getUserAvatar, getUserDisplayName } from '../utils/avatarUtils';

const UserProfile = ({ user, onClose, onUpdateUser }) => {
  const fileInputRef = useRef(null);
  const profileHook = useProfileManagement(user, onUpdateUser);

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        await profileHook.uploadAvatar(file);
        alert('Avatar updated successfully!');
      } catch (error) {
        alert('Failed to upload avatar: ' + error.message);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const RoleIcon = getRoleIcon(user.role);

  return (
    <ErrorBoundary>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Profile</h2>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Avatar Section */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  {getUserAvatar(user) ? (
                    <img
                      src={getUserAvatar(user)}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                
                <button
                  onClick={triggerFileInput}
                  className="absolute bottom-2 right-2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-200"
                >
                  <Camera className="w-4 h-4" />
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {getUserDisplayName(user)}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {user.email}
                </p>
                
                <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
                  <RoleIcon className="w-5 h-5 text-blue-500" />
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.role === 'ADMIN' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    user.role === 'MANAGER' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    {user.role}
                  </span>
                </div>

                {user.department && (
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {user.position && `${user.position} • `}{user.department}
                  </p>
                )}

                {user.location && (
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    📍 {user.location}
                  </p>
                )}

                {user.bio && (
                  <p className="text-gray-700 dark:text-gray-300 mt-3 max-w-md">
                    {user.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Profile Sections */}
            <div className="space-y-8">
              {/* Profile Information */}
              <ProfileInfoSection
                user={user}
                onUpdateProfile={profileHook.updateProfile}
                loading={profileHook.loading}
                error={profileHook.error}
              />

              {/* Password Change */}
              <PasswordChangeSection
                onChangePassword={profileHook.changePassword}
                loading={profileHook.loading}
                error={profileHook.error}
              />

              {/* Account Stats */}
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Account Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-500">
                      {user.joinDate ? 
                        Math.floor((new Date() - new Date(user.joinDate)) / (1000 * 60 * 60 * 24)) 
                        : 0
                      }
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Days Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-500">
                      {user.tasksCompleted || 0}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tasks Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-500">
                      {user.projectsCount || 0}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Projects</p>
                  </div>
                </div>
              </div>
            </div>

            {profileHook.loading && (
              <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <span className="text-gray-900 dark:text-white">Updating profile...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default UserProfile;