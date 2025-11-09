import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import chefApi from '../services/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('chefToken');
    const user = localStorage.getItem('chefUser');
    
    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        // Verify that user has chef role
        if (['chef', 'chef_manager'].includes(parsedUser.role)) {
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user: parsedUser }
          });
        } else {
          // User doesn't have chef role, clear storage
          localStorage.removeItem('chefToken');
          localStorage.removeItem('chefUser');
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        // Invalid user data, clear storage
        localStorage.removeItem('chefToken');
        localStorage.removeItem('chefUser');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = useCallback(async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await chefApi.auth.login(credentials);
      console.log('Login API response:', response); // Debug log

      if (response.success) {
        const { user, token } = response.data;
        console.log('User from API:', user);
        console.log('User role:', user.role);

        // Check if user has chef role
        if (!['chef', 'chef_manager'].includes(user.role)) {
          console.error('Access denied. User role:', user.role);
          throw new Error('Access denied. Chef role required.');
        }

        // Store token and user data
        localStorage.setItem('chefToken', token);
        localStorage.setItem('chefUser', JSON.stringify(user));
        console.log('Token and user stored in localStorage');

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user }
        });
        console.log('LOGIN_SUCCESS dispatched');

        return { success: true };
      } else {
        console.error('Login API error:', response); // Debug log
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login function error:', error); // Debug log
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('chefToken');
    localStorage.removeItem('chefUser');
    dispatch({ type: 'LOGOUT' });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value = useMemo(() => ({
    ...state,
    login,
    logout,
    clearError,
    isChefManager: state.user?.role === 'chef_manager',
    isChef: state.user?.role === 'chef',
  }), [state, login, logout, clearError]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
