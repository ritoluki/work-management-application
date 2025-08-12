import React, { useState } from 'react';
import { Edit2, Save, X } from 'lucide-react';
import FormInput from './FormInput';
import ErrorBoundary from './ErrorBoundary';
import { getUserDisplayName } from '../../utils/avatarUtils';

const ProfileInfoSection = ({ user, onUpdateProfile, loading, error }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    name: getUserDisplayName(user),
    email: user.email || '',
    phone: user.phone || '',
    location: user.location || '',
    bio: user.bio || '',
    department: user.department || '',
    position: user.position || '',
    joinDate: user.joinDate || new Date().toISOString().split('T')[0]
  });

  const handleSave = async () => {
    try {
      await onUpdateProfile(editedUser);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    setEditedUser({
      name: getUserDisplayName(user),
      email: user.email || '',
      phone: user.phone || '',
      location: user.location || '',
      bio: user.bio || '',
      department: user.department || '',
      position: user.position || '',
      joinDate: user.joinDate || new Date().toISOString().split('T')[0]
    });
    setIsEditing(false);
  };

  const handleFieldChange = (field, value) => {
    setEditedUser(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Profile Information
          </h3>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label="Full Name"
            value={isEditing ? editedUser.name : getUserDisplayName(user)}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            disabled={!isEditing}
            required
          />

          <FormInput
            label="Email"
            type="email"
            value={isEditing ? editedUser.email : user.email || ''}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            disabled={!isEditing}
            required
          />

          <FormInput
            label="Phone"
            type="tel"
            value={isEditing ? editedUser.phone : user.phone || ''}
            onChange={(e) => handleFieldChange('phone', e.target.value)}
            disabled={!isEditing}
            placeholder="Enter phone number"
          />

          <FormInput
            label="Location"
            value={isEditing ? editedUser.location : user.location || ''}
            onChange={(e) => handleFieldChange('location', e.target.value)}
            disabled={!isEditing}
            placeholder="Enter location"
          />

          <FormInput
            label="Department"
            value={isEditing ? editedUser.department : user.department || ''}
            onChange={(e) => handleFieldChange('department', e.target.value)}
            disabled={!isEditing}
            placeholder="Enter department"
          />

          <FormInput
            label="Position"
            value={isEditing ? editedUser.position : user.position || ''}
            onChange={(e) => handleFieldChange('position', e.target.value)}
            disabled={!isEditing}
            placeholder="Enter position"
          />

          <FormInput
            label="Join Date"
            type="date"
            value={isEditing ? editedUser.joinDate : user.joinDate || ''}
            onChange={(e) => handleFieldChange('joinDate', e.target.value)}
            disabled={!isEditing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Bio
          </label>
          <textarea
            value={isEditing ? editedUser.bio : user.bio || ''}
            onChange={(e) => handleFieldChange('bio', e.target.value)}
            disabled={!isEditing}
            placeholder="Tell us about yourself..."
            rows={4}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
          />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ProfileInfoSection;