import React, { useState, useEffect } from 'react';
import WorkManagement from './components/WorkManagement';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Forbidden from './components/Forbidden';
import NotFound from './components/NotFound';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { authService } from './services/authService';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';

function RequireAuth({ children }) {
  const savedUser = localStorage.getItem('user');
  
  if (!savedUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function RedirectIfAuthed({ children }) {
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    return <Navigate to="/workspaces" replace />;
  }
  return children;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate();

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
    navigate('/workspaces');
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
      <Routes>
        <Route
          path="/login"
          element={(
            <RedirectIfAuthed>
              <LoginForm onLogin={handleLogin} onSwitchToRegister={() => navigate('/register')} />
            </RedirectIfAuthed>
          )}
        />
        <Route
          path="/register"
          element={(
            <RedirectIfAuthed>
              <RegisterForm onLogin={handleLogin} onSwitchToLogin={() => navigate('/login')} />
            </RedirectIfAuthed>
          )}
        />
        <Route
          path="/"
          element={<Navigate to={user ? '/workspaces' : '/login'} replace />}
        />
        <Route
          path="/workspaces/*"
          element={(
            <RequireAuth>
              <WorkManagement user={user} onLogout={handleLogout} />
            </RequireAuth>
          )}
        />
        <Route path="/403" element={<Forbidden />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;