import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('bank_token');
    const storedUser = localStorage.getItem('bank_user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      // Verify token is still valid / refresh user data
      api
        .get('/auth/me')
        .then((res) => {
          setUser(res.data.user);
          localStorage.setItem('bank_user', JSON.stringify(res.data.user));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user: loggedInUser } = res.data;
    localStorage.setItem('bank_token', token);
    localStorage.setItem('bank_user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (payload) => {
    const res = await api.post('/auth/register', payload);
    const { token, user: newUser } = res.data;
    localStorage.setItem('bank_token', token);
    localStorage.setItem('bank_user', JSON.stringify(newUser));
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('bank_token');
    localStorage.removeItem('bank_user');
    setUser(null);
  };

  const updateUserInContext = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('bank_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateUserInContext, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
};
