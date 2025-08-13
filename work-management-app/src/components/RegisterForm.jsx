import React, { useState } from 'react';
import { Github, Eye, EyeOff, User, Mail, Lock } from 'lucide-react';
import { authService } from '../services/authService';

const RegisterForm = ({ onLogin, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Validation
      if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.password.trim()) {
        setError('Vui lòng nhập đầy đủ thông tin');
        setIsLoading(false);
        return;
      }
      
      if (formData.password.length < 6) {
        setError('Mật khẩu phải có ít nhất 6 ký tự');
        setIsLoading(false);
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('Mật khẩu xác nhận không khớp');
        setIsLoading(false);
        return;
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Email không hợp lệ');
        setIsLoading(false);
        return;
      }
      
      // Try to register with backend API
      const response = await authService.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      });
      
      if (response.data) {
        // Auto login after successful registration
        onLogin(response.data);
      } else {
        setError('Đăng ký thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Register error:', err);
      setError('Đăng ký thất bại. Email có thể đã tồn tại.');
    } finally {
      setIsLoading(false);
    }
  };

  const GoogleIcon = () => (
    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex w-full items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md rounded-[40px] p-12 bg-white border border-gray-200 shadow-xl">
          <div className="w-full">
            <h2 className="mb-2 text-3xl font-bold text-gray-900">
              Create Account
            </h2>
           

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="mb-8 grid gap-4">
              <button
                type="button"
                className="h-12 w-full flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
              >
                <GoogleIcon />
                Continue with Google
              </button>
              <button
                type="button"
                className="h-12 w-full flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
              >
                <Github className="mr-2 h-5 w-5" />
                Continue with Github
              </button>
            </div>

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="h-12 w-full pl-10 rounded-md border border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 px-3 py-2 text-sm transition-all duration-300"
                      placeholder="Phan"
                      type="text"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="h-12 w-full pl-10 rounded-md border border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 px-3 py-2 text-sm transition-all duration-300"
                      placeholder="Tan"
                      type="text"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="h-12 w-full pl-10 rounded-md border border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 px-3 py-2 text-sm transition-all duration-300"
                    placeholder="nhattan@example.com"
                    type="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="h-12 w-full pl-10 pr-10 rounded-md border border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 px-3 py-2 text-sm transition-all duration-300"
                    placeholder="Enter your password"
                    type={showPassword ? "text" : "password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-300"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="h-12 w-full pl-10 pr-10 rounded-md border border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 px-3 py-2 text-sm transition-all duration-300"
                    placeholder="Confirm your password"
                    type={showConfirmPassword ? "text" : "password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-300"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  className="rounded border-gray-300 bg-white text-blue-600 focus:ring-blue-500 transition-colors duration-300"
                />
                <label 
                  htmlFor="terms" 
                  className="text-sm text-gray-700"
                >
                  I agree to the{" "}
                  <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="h-12 w-full rounded-md px-4 py-2 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 shadow-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-300"
                >
                  Sign in
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm; 