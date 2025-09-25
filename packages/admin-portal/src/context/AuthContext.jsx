import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // We'll need this to check the user's role

export const AuthContext = createContext();

// NOTE: For development, replace with your local IP address if needed.
const API_URL = 'http://localhost:3001/api';

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authToken) {
      try {
        const decodedToken = jwtDecode(authToken);
        // Check if user is an admin or staff
        if (decodedToken.user.role === 'admin' || decodedToken.user.role === 'staff') {
            setUser(decodedToken.user);
            axios.defaults.headers.common['x-auth-token'] = authToken;
        } else {
            // If the user is not an admin/staff, clear the token
            logout();
        }
      } catch (error) {
        // Invalid token
        logout();
      }
    }
    setIsLoading(false);
  }, [authToken]);

  const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });
    const { token } = response.data;

    // Decode token to check role before setting it
    const decodedToken = jwtDecode(token);
    if (decodedToken.user.role !== 'admin' && decodedToken.user.role !== 'staff') {
        throw new Error('Access denied. You must be an administrator or staff to log in.');
    }

    localStorage.setItem('token', token);
    setAuthToken(token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    setUser(null);
    delete axios.defaults.headers.common['x-auth-token'];
  };

  return (
    <AuthContext.Provider value={{ authToken, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};