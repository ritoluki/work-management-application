import React, { useState } from 'react';
import { User, Mail, Calendar, Edit2, Save, X, Camera, Lock, Settings, Phone, MapPin, Briefcase, Building } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { getRoleBadge, getRoleIcon } from '../utils/mockUsers';
import { generateAvatar, getUserAvatar, getUserDisplayName } from '../utils/avatarUtils';

const UserProfile = ({ user, onClose, onUpdateUser }) => {
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
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSave = async () => {
    // Validate required fields
    if (!editedUser.name.trim() || !editedUser.email.trim()) {
      alert('Vui lòng nhập đầy đủ họ tên và email');
      return;
    }

    try {
      // Call API to update user information
      const response = await fetch(`http://localhost:8080/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editedUser.name,
          email: editedUser.email,
          phone: editedUser.phone,
          location: editedUser.location,
          bio: editedUser.bio,
          department: editedUser.department,
          position: editedUser.position,
          joinDate: editedUser.joinDate
        })
      });

      if (response.ok) {
        const updatedUserData = await response.json();
        
        // Update user data with avatar generation
        const newAvatar = generateAvatar(editedUser.name);
        const updatedUser = {
          ...user,
          ...editedUser,
          avatar: updatedUserData.avatarUrl || newAvatar,
          avatarUrl: updatedUserData.avatarUrl || newAvatar,
          firstName: editedUser.name.split(' ')[0] || '',
          lastName: editedUser.name.split(' ').slice(1).join(' ') || ''
        };
        
        onUpdateUser && onUpdateUser(updatedUser);
        setIsEditing(false);
        alert('Cập nhật thông tin thành công!');
      } else {
        const errorData = await response.text();
        alert(errorData || 'Cập nhật thông tin thất bại');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Có lỗi xảy ra khi cập nhật thông tin');
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

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert('Vui lòng nhập đầy đủ thông tin mật khẩu');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Mật khẩu mới và xác nhận không khớp');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      alert('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    try {
      // Call API to change password
      const response = await fetch(`http://localhost:8080/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          userId: user.id
        })
      });

      if (response.ok) {
        alert('Đổi mật khẩu thành công!');
        setShowChangePassword(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        const errorData = await response.text();
        alert(errorData || 'Đổi mật khẩu thất bại');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Có lỗi xảy ra khi đổi mật khẩu');
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
      style={{ zIndex: 1055 }} 
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden border border-gray-200 dark:border-gray-700" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header với gradient background */}
        <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 px-6 py-4">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Thông tin người dùng</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={onClose}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Profile Card - Left Column */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-lg">
                {/* Avatar Section */}
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-xl mb-4">
                      {getUserAvatar(user)}
                    </div>
                    <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-gray-100 dark:border-gray-600 flex items-center justify-center text-purple-600 hover:text-purple-700 transition-colors">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {getUserDisplayName(user)}
                  </h2>
                  
                  {/* Role Badge */}
                  {user.role && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full mb-4">
                      <span className="text-lg">{getRoleIcon(user.role)}</span>
                      <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">{user.role}</span>
                    </div>
                  )}
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{editedUser.position || 'Nhân viên'}</p>
                  <p className="text-gray-500 dark:text-gray-500 text-xs">{editedUser.department || 'Phòng ban chưa cập nhật'}</p>
                </div>

                {/* Quick Info Cards */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-600 text-center">
                    <Calendar className="w-5 h-5 text-purple-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Ngày vào làm</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {editedUser.joinDate ? new Date(editedUser.joinDate).toLocaleDateString('vi-VN') : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-600 text-center">
                    <Mail className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Liên hệ</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {editedUser.phone ? 'Có SĐT' : 'Chưa có'}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <Edit2 className="w-4 h-4" />
                      Chỉnh sửa thông tin
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={handleSave}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        <Save className="w-4 h-4" />
                        Lưu thay đổi
                      </button>
                      <button
                        onClick={handleCancel}
                        className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        <X className="w-4 h-4" />
                        Hủy
                      </button>
                    </div>
                  )}
                  
                  <button
                    onClick={() => setShowChangePassword(true)}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <Lock className="w-4 h-4" />
                    Đổi mật khẩu
                  </button>
                </div>
              </div>
            </div>

            {/* Details Section - Right Columns */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Personal Information */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-lg">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-600">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Thông tin cá nhân</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Họ tên */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Họ tên
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedUser.name}
                        onChange={(e) => setEditedUser({...editedUser, name: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        placeholder="Nhập họ tên"
                      />
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-600">
                        <p className="text-gray-900 dark:text-white font-medium">{editedUser.name || 'Chưa cập nhật'}</p>
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editedUser.email}
                        onChange={(e) => setEditedUser({...editedUser, email: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        placeholder="Nhập email"
                      />
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-600">
                        <p className="text-gray-900 dark:text-white font-medium">{editedUser.email || 'Chưa cập nhật'}</p>
                      </div>
                    )}
                  </div>

                  {/* Số điện thoại */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Số điện thoại
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editedUser.phone}
                        onChange={(e) => setEditedUser({...editedUser, phone: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        placeholder="Nhập số điện thoại"
                      />
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-600">
                        <p className="text-gray-900 dark:text-white font-medium">{editedUser.phone || 'Chưa có dữ liệu'}</p>
                      </div>
                    )}
                  </div>

                  {/* Địa chỉ */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Địa chỉ
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedUser.location}
                        onChange={(e) => setEditedUser({...editedUser, location: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        placeholder="Nhập địa chỉ"
                      />
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-600">
                        <p className="text-gray-900 dark:text-white font-medium">{editedUser.location || 'Chưa có dữ liệu'}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Giới thiệu */}
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Giới thiệu</label>
                  {isEditing ? (
                    <textarea
                      value={editedUser.bio}
                      onChange={(e) => setEditedUser({...editedUser, bio: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="Viết giới thiệu về bản thân..."
                    />
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-600 min-h-[100px]">
                      <p className="text-gray-900 dark:text-white font-medium whitespace-pre-wrap">{editedUser.bio || 'Chưa có dữ liệu'}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Work Information */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-lg">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-600">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Thông tin công việc</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Chức vụ */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Chức vụ
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedUser.position}
                        onChange={(e) => setEditedUser({...editedUser, position: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        placeholder="Nhập chức vụ"
                      />
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-600">
                        <p className="text-gray-900 dark:text-white font-medium">{editedUser.position || 'Chưa có dữ liệu'}</p>
                      </div>
                    )}
                  </div>

                  {/* Phòng ban */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Phòng ban
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedUser.department}
                        onChange={(e) => setEditedUser({...editedUser, department: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        placeholder="Nhập phòng ban"
                      />
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-600">
                        <p className="text-gray-900 dark:text-white font-medium">{editedUser.department || 'Chưa có dữ liệu'}</p>
                      </div>
                    )}
                  </div>

                  {/* Ngày vào làm */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Ngày vào làm
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={editedUser.joinDate}
                        onChange={(e) => setEditedUser({...editedUser, joinDate: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      />
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-600">
                        <p className="text-gray-900 dark:text-white font-medium">
                          {editedUser.joinDate ? new Date(editedUser.joinDate).toLocaleDateString('vi-VN') : '30/07/2025'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
          style={{ zIndex: 1060 }}
          onClick={(e) => {
            e.stopPropagation();
            setShowChangePassword(false);
          }}
        >
          <div 
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200 dark:border-gray-700 transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-600">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-xl flex items-center justify-center">
                  <Lock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Đổi mật khẩu</h3>
              </div>
              <button
                onClick={() => setShowChangePassword(false)}
                className="w-8 h-8 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Mật khẩu mới</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  placeholder="Nhập mật khẩu mới"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={handleChangePassword}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Đổi mật khẩu
              </button>
              <button
                onClick={() => setShowChangePassword(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile; 