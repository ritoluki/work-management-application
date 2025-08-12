import React, { useState } from 'react';
import { Lock, Save, X } from 'lucide-react';
import FormInput from './FormInput';
import ErrorBoundary from './ErrorBoundary';

const PasswordChangeSection = ({ onChangePassword, loading, error }) => {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChangePassword = async () => {
    try {
      await onChangePassword(passwordData);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowChangePassword(false);
      alert('Password changed successfully!');
    } catch (error) {
      console.error('Error changing password:', error);
    }
  };

  const handleCancel = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowChangePassword(false);
  };

  const handleFieldChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Security Settings
          </h3>
          {!showChangePassword && (
            <button
              onClick={() => setShowChangePassword(true)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              <Lock className="w-4 h-4" />
              Change Password
            </button>
          )}
        </div>

        {showChangePassword && (
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium text-gray-900 dark:text-white">
                Change Password
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <FormInput
                label="Current Password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => handleFieldChange('currentPassword', e.target.value)}
                placeholder="Enter current password"
                required
              />

              <FormInput
                label="New Password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => handleFieldChange('newPassword', e.target.value)}
                placeholder="Enter new password"
                required
                minLength={6}
              />

              <FormInput
                label="Confirm New Password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                placeholder="Confirm new password"
                required
                minLength={6}
              />

              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>Password requirements:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>At least 6 characters long</li>
                  <li>Should contain letters and numbers</li>
                  <li>Avoid using personal information</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {!showChangePassword && (
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Password Protection
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your password was last changed recently. Keep your account secure by using a strong password.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default PasswordChangeSection;