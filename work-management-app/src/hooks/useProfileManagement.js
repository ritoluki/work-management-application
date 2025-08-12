import { useState, useCallback } from 'react';
import { generateAvatar } from '../utils/avatarUtils';

export const useProfileManagement = (user, onUpdateUser) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateProfile = useCallback(async (profileData) => {
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      if (!profileData.name?.trim() || !profileData.email?.trim()) {
        throw new Error('Name and email are required');
      }

      // Call API to update user information
      const response = await fetch(`http://localhost:8080/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to update profile');
      }

      const updatedUserData = await response.json();
      
      // Update user data with avatar generation
      const newAvatar = generateAvatar(profileData.name);
      const updatedUser = {
        ...user,
        ...profileData,
        avatar: updatedUserData.avatarUrl || newAvatar,
        avatarUrl: updatedUserData.avatarUrl || newAvatar,
        firstName: profileData.name.split(' ')[0] || '',
        lastName: profileData.name.split(' ').slice(1).join(' ') || ''
      };
      
      if (onUpdateUser) {
        onUpdateUser(updatedUser);
      }
      
      return updatedUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, onUpdateUser]);

  const changePassword = useCallback(async (passwordData) => {
    try {
      setLoading(true);
      setError(null);

      // Validate password data
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        throw new Error('All password fields are required');
      }
      
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error('New password and confirmation do not match');
      }

      if (passwordData.newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Call API to change password
      const response = await fetch(`http://localhost:8080/api/users/${user.id}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to change password');
      }

      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  const uploadAvatar = useCallback(async (file) => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`http://localhost:8080/api/users/${user.id}/avatar`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }

      const result = await response.json();
      
      const updatedUser = {
        ...user,
        avatar: result.avatarUrl,
        avatarUrl: result.avatarUrl
      };
      
      if (onUpdateUser) {
        onUpdateUser(updatedUser);
      }
      
      return result.avatarUrl;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, onUpdateUser]);

  return {
    loading,
    error,
    updateProfile,
    changePassword,
    uploadAvatar
  };
};