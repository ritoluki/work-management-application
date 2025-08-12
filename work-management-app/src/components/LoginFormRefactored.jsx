import React, { useState } from 'react';
import { Github, Mail, Lock } from 'lucide-react';
import { authService } from '../services/authService';
import { useValidation } from '../hooks/useValidation';
import FormInput from './ui/FormInput';

const LoginForm = ({ onLogin, onSwitchToRegister }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // Initialize validation hook
  const {
    data: credentials,
    errors,
    updateField,
    validateAll,
    rules
  } = useValidation({
    email: '',
    password: ''
  });

  // Define validation rules
  const fieldRules = {
    email: [
      rules.required('Vui lòng nhập email'),
      rules.email('Email không hợp lệ'),
    ],
    password: [
      rules.required('Vui lòng nhập mật khẩu'),
      rules.minLength(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    ]
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setGeneralError('');
    
    // Validate all fields
    const isValid = validateAll(fieldRules);
    
    if (!isValid) {
      setIsLoading(false);
      return;
    }
    
    try {
      // Try to login with backend API
      const response = await authService.login(credentials.email, credentials.password);
      
      if (response.data) {
        onLogin(response.data);
      } else {
        setGeneralError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response?.status === 401) {
        setGeneralError('Email hoặc mật khẩu không đúng');
      } else if (err.response?.data?.message) {
        setGeneralError(err.response.data.message);
      } else {
        setGeneralError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const GoogleIcon = () => (
    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Đăng nhập vào tài khoản
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <FormInput
              type="email"
              name="email"
              placeholder="Email"
              value={credentials.email}
              onChange={updateField}
              error={errors.email}
              icon={Mail}
              required
            />

            {/* Password */}
            <FormInput
              type="password"
              name="password"
              placeholder="Mật khẩu"
              value={credentials.password}
              onChange={updateField}
              error={errors.password}
              icon={Lock}
              required
            />

            {/* General Error */}
            {generalError && (
              <div className="text-red-600 dark:text-red-400 text-sm text-center">
                {generalError}
              </div>
            )}

            {/* Forgot Password */}
            <div className="flex items-center justify-between">
              <div></div>
              <div className="text-sm">
                <button
                  type="button"
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Quên mật khẩu?
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </div>

            {/* Divider */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    Hoặc tiếp tục với
                  </span>
                </div>
              </div>

              {/* Social Login */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <GoogleIcon />
                  Google
                </button>

                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <Github className="mr-2 h-5 w-5" />
                  GitHub
                </button>
              </div>
            </div>

            {/* Switch to Register */}
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Chưa có tài khoản?{' '}
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Đăng ký ngay
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;