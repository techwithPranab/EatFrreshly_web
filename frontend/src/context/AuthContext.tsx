'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

// Types
interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  cart: Cart;
  authError: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; message?: string }>;
  googleLogin: (token: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (userData: User) => void;
  updateCart: (cartData: Cart) => void;
  clearCart: () => void;
  checkAuth: () => Promise<void>;
  setAuthError: (msg: string | null) => void;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  cart: {
    items: [],
    totalItems: 0,
    totalPrice: 0,
  },
  authError: null,
};

// Action types
const actionTypes = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  SET_LOADING: 'SET_LOADING',
  UPDATE_CART: 'UPDATE_CART',
  CLEAR_CART: 'CLEAR_CART',
  SET_AUTH_ERROR: 'SET_AUTH_ERROR',
} as const;

type AuthAction = 
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload?: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_CART'; payload: Cart }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_AUTH_ERROR'; payload: string | null };

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  console.log('Auth reducer action:', action.type, action);
  switch (action.type) {
    case actionTypes.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        authError: null,
      };

    case actionTypes.LOGIN_SUCCESS:
      console.log('LOGIN_SUCCESS - setting authenticated to true');
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        authError: null,
      };

    case actionTypes.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        authError: action.payload || 'Login failed',
      };
    case actionTypes.SET_AUTH_ERROR:
      return {
        ...state,
        authError: action.payload,
      };

    case actionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        cart: {
          items: [],
          totalItems: 0,
          totalPrice: 0,
        },
      };

    case actionTypes.UPDATE_USER:
      return {
        ...state,
        user: action.payload,
      };

    case actionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case actionTypes.UPDATE_CART:
      return {
        ...state,
        cart: action.payload,
      };

    case actionTypes.CLEAR_CART:
      return {
        ...state,
        cart: {
          items: [],
          totalItems: 0,
          totalPrice: 0,
        },
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication on app load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async (): Promise<void> => {
    try {
      // Check if we're in the browser
      if (typeof window === 'undefined') {
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
        return;
      }

      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (token && userStr) {
        const user = JSON.parse(userStr);
        
        // Verify token with server
        const response = await authAPI.verifyToken(token);
        
        if (response.data.success) {
          dispatch({
            type: actionTypes.LOGIN_SUCCESS,
            payload: {
              user: response.data.data.user,
              token,
            },
          });
        } else {
          throw new Error('Token verification failed');
        }
      } else {
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      dispatch({ type: actionTypes.LOGIN_FAILURE });
    }
  };

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; message?: string }> => {
    try {
      dispatch({ type: actionTypes.LOGIN_START });

      console.log('Attempting login with:', credentials);
      const response = await authAPI.login(credentials);
      console.log('Login response:', response.data);

      if (response.data.success) {
        const { user, token } = response.data.data;

        // Store in localStorage (only in browser)
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
        }

        dispatch({
          type: actionTypes.LOGIN_SUCCESS,
          payload: { user, token },
        });

        toast.success('Login successful!');
        return { success: true };
      } else {
        const message = response.data.message || 'Login failed';
        dispatch({ type: actionTypes.LOGIN_FAILURE, payload: message });
        toast.error(message);
        return { success: false, message };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: actionTypes.LOGIN_FAILURE, payload: message });
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; message?: string }> => {
    try {
      dispatch({ type: actionTypes.LOGIN_START });

      const response = await authAPI.register(userData);

      if (response.data.success) {
        // Do NOT store token/user or dispatch LOGIN_SUCCESS
        // Reset loading state
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
        toast.success('Registration successful!');
        return { success: true };
      } else {
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
        const message = response.data.message || 'Registration failed';
        toast.error(message);
        return { success: false, message };
      }
    } catch (error: any) {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    dispatch({ type: actionTypes.LOGOUT });
    toast.success('Logged out successfully');
  };

  const googleLogin = async (token: string): Promise<{ success: boolean; message?: string }> => {
    try {
      dispatch({ type: actionTypes.LOGIN_START });

      // Verify the token with server
      const response = await authAPI.verifyToken(token);

      if (response.data.success) {
        const { user } = response.data.data;

        // Store in localStorage (only in browser)
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
        }

        dispatch({
          type: actionTypes.LOGIN_SUCCESS,
          payload: { user, token },
        });

        toast.success('Google login successful!');
        return { success: true };
      } else {
        throw new Error('Token verification failed');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Google login failed';
      dispatch({ type: actionTypes.LOGIN_FAILURE, payload: message });
      toast.error(message);
      return { success: false, message };
    }
  };

  const updateUser = (userData: User): void => {
    dispatch({
      type: actionTypes.UPDATE_USER,
      payload: userData,
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(userData));
    }
  };

  const updateCart = (cartData: Cart): void => {
    dispatch({
      type: actionTypes.UPDATE_CART,
      payload: cartData,
    });
  };

  const clearCart = (): void => {
    dispatch({ type: actionTypes.CLEAR_CART });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    googleLogin,
    logout,
    updateUser,
    updateCart,
    clearCart,
    checkAuth,
    setAuthError: (msg: string | null) => dispatch({ type: actionTypes.SET_AUTH_ERROR, payload: msg }),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
