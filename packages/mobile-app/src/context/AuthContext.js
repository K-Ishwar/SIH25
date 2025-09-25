import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (token) => {
    setIsLoading(true);
    setUserToken(token);
    await AsyncStorage.setItem('user_token', token);
    // Set the authorization header for all future axios requests
    axios.defaults.headers.common['x-auth-token'] = token;
    setIsLoading(false);
  };

  const logout = async () => {
    setIsLoading(true);
    setUserToken(null);
    await AsyncStorage.removeItem('user_token');
    // Remove the authorization header
    delete axios.defaults.headers.common['x-auth-token'];
    setIsLoading(false);
  };

  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      let token = await AsyncStorage.getItem('user_token');
      if (token) {
        setUserToken(token);
        axios.defaults.headers.common['x-auth-token'] = token;
      }
      setIsLoading(false);
    } catch (e) {
      console.log(`isLoggedIn error ${e}`);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider value={{ login, logout, userToken, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};