import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { User, LogOut, ChevronDown, Settings } from "lucide-react";
import { getUserAvatar, getUserDisplayName } from '../utils/avatarUtils';

const UserDropdown = ({ user, onLogout, onShowUserProfile, onShowAdminPanel }) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);
  const avatarRef = useRef(null);

  const handleAvatarClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!showUserDropdown && avatarRef.current) {
      const rect = avatarRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.right + window.scrollX - 200
      });
    }
    setShowUserDropdown(!showUserDropdown);
  };

  // Close dropdown when clicking outside or on escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showUserDropdown &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        avatarRef.current &&
        !avatarRef.current.contains(event.target)
      ) {
        setShowUserDropdown(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape' && showUserDropdown) {
        setShowUserDropdown(false);
      }
    };

    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [showUserDropdown]);

  const handleLogout = () => {
    setShowUserDropdown(false);
    onLogout();
  };

  return (
    <div className="relative">
      <button
        ref={avatarRef}
        onClick={handleAvatarClick}
        className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-1 transition-colors"
      >
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
          {getUserAvatar(user)}
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {showUserDropdown && createPortal(
        <div
          ref={dropdownRef}
          className="user-dropdown-menu"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`
          }}
        >
          {/* Header with greeting */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-600">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {getUserDisplayName(user)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowUserDropdown(false);
                onShowUserProfile && onShowUserProfile();
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm flex items-center gap-3 border-0 bg-transparent text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
            >
              <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              Thông tin người dùng
            </button>

            {/* Hiển thị Admin Panel cho admin users */}
            {user.role === 'ADMIN' && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowUserDropdown(false);
                  onShowAdminPanel && onShowAdminPanel();
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm flex items-center gap-3 border-0 bg-transparent text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                Admin Panel
              </button>
            )}

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleLogout();
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm flex items-center gap-3 border-0 bg-transparent text-red-600 dark:text-red-400 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-500 dark:text-red-400" />
              Logout
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default UserDropdown; 