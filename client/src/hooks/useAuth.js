import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { RESET_USER, SET_USER } from '../reducers/mapReducer';
import axios from '../config/axios';

export const useAuth = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [auth, setAuth] = useState({
    isAuthenticated: !!localStorage.getItem('accessToken'),
    user: null,
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken')
  });

  const getCurrentUser = async () => {
    const response = await axios.get('/user');
    return response.data;
  }

  const refreshAccessToken = async () => {
    try {
      const response = await axios.post('/auth/refresh-token', {
        refreshToken: localStorage.getItem('refreshToken')
      });

      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      
      setAuth(prev => ({
        ...prev,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken
      }));

      return response.data.accessToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
      return null;
    }
  };

  const makeAuthenticatedRequest = async (url, options = {}) => {
    try {
      const response = await axios({
        url,
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      return response;
    } catch (error) {
      if (error.response?.status === 401) {
        // Token expired, try to refresh
        const newAccessToken = await refreshAccessToken();
        if (newAccessToken) {
          // Retry the request with new token
          return axios({
            url,
            ...options,
            headers: {
              ...options.headers,
              'Authorization': `Bearer ${newAccessToken}`
            }
          });
        }
      }
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      if (response.data.success) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        dispatch(SET_USER(response.data.user));
        setAuth({
          isAuthenticated: true,
          user: response.data.user,
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken
        });
        history.push('/');
        return { success: true };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || "Une erreur s'est produite" 
      };
    }
  };

  const register = async (email, password, name) => {
    try {
      const response = await axios.post('/auth/register', { email, password, name });
      if (response.data.success) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        dispatch(SET_USER(response.data.user));
        setAuth({
          isAuthenticated: true,
          user: response.data.user,
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken
        });
        history.push('/');
        return { success: true };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || "Une erreur s'est produite" 
      };
    }
  };

  const logout = async () => {
    try {
      // Call the server logout endpoint
      await makeAuthenticatedRequest('/auth/logout', {
        method: 'POST',
        data: {
          refreshToken: localStorage.getItem('refreshToken')
        }
      });
      
      // Remove tokens from localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Update auth state
      setAuth({
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null
      });

      // Update user state in Redux
      dispatch(RESET_USER());
      
      // Redirect to login
      history.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const response = await axios.get('/user');
        dispatch(SET_USER(response.data));
        setAuth(prev => ({
          ...prev,
          isAuthenticated: true,
          user: response.data
        }));
        return true;
      } catch (error) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return false;
      }
    }
    return false;
  };

  return {
    auth,
    login,
    register,
    logout,
    checkAuth,
    makeAuthenticatedRequest,
    getCurrentUser
  };
}; 