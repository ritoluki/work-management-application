import React, { useState, useEffect } from 'react';
import WorkManagement from './components/WorkManagement';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
// import { authService } from './services/authService';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Kiểm tra localStorage trước
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
          setLoading(false);
          return;
        }

        // Nếu không có user trong localStorage, hiển thị form đăng nhập
        // Không gọi API getCurrentUser vì backend sẽ trả về null
        setUser(null);
      } catch (err) {
        console.log('No user logged in');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    // Lưu user vào localStorage khi đăng nhập thành công
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const handleSwitchToRegister = () => {
    setShowRegister(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegister(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div className="App">
        {user ? (
          <WorkManagement user={user} onLogout={handleLogout} />
        ) : showRegister ? (
          <RegisterForm 
            onLogin={handleLogin} 
            onSwitchToLogin={handleSwitchToLogin}
          />
        ) : (
          <LoginForm 
            onLogin={handleLogin} 
            onSwitchToRegister={handleSwitchToRegister}
          />
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;