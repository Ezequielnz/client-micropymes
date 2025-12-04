/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar usuario desde localStorage al iniciar
    const loadUser = () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setUser({
            ...parsedUser,
            access_token: token
          });
        }
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = (userData, token) => {
    const userWithToken = {
      ...userData,
      access_token: token
    };

    setUser(userWithToken);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const completeOnboarding = async () => {
    try {
      const updatedUser = { ...user, onboarding_completed: true };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/auth/complete-onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const value = {
    user,
    login,
    logout,
    completeOnboarding,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
