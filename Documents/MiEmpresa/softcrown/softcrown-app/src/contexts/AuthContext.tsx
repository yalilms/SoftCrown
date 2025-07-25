'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { 
  User, 
  AuthTokens, 
  AuthState, 
  LoginCredentials, 
  RegisterData,
  ApiResponse 
} from '@/types/auth';
import { authService } from '@/lib/auth';

// Action types
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; tokens: AuthTokens } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: { user: User; tokens: AuthTokens } }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_TOKEN_SUCCESS'; payload: AuthTokens }
  | { type: 'SET_USER'; payload: User }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

// Initial state
const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return {
        ...state,
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case 'LOGOUT':
      return {
        ...state,
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case 'REFRESH_TOKEN_SUCCESS':
      return {
        ...state,
        tokens: action.payload,
        error: null,
      };

    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
};

// Context type
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'softcrown_access_token',
  REFRESH_TOKEN: 'softcrown_refresh_token',
  USER: 'softcrown_user',
} as const;

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load stored auth data on mount
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        if (typeof window === 'undefined') {
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }

        const storedAccessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        const storedRefreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

        if (storedAccessToken && storedRefreshToken && storedUser) {
          const user = JSON.parse(storedUser);
          const tokens = {
            accessToken: storedAccessToken,
            refreshToken: storedRefreshToken,
            expiresIn: 15 * 60, // 15 minutes
            tokenType: 'Bearer' as const,
          };

          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user, tokens },
          });
        }
      } catch (error) {
        console.error('Error loading stored auth:', error);
        // Clear invalid stored data
        clearStoredAuth();
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadStoredAuth();
  }, []);

  // Store auth data in localStorage
  const storeAuth = (user: User, tokens: AuthTokens) => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Error storing auth data:', error);
    }
  };

  // Clear stored auth data
  const clearStoredAuth = () => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  // Get client IP address (simplified)
  const getClientIP = (): string => {
    // In production, this would be handled server-side
    return '127.0.0.1';
  };

  // Login function
  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const ipAddress = getClientIP();
      const result = await authService.login(credentials, ipAddress);

      storeAuth(result.user, result.tokens);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: result,
      });

      // Track login event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'login', {
          method: 'email',
          user_id: result.user.id,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error de login';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: message,
      });
      throw error;
    }
  };

  // Register function
  const register = async (data: RegisterData) => {
    dispatch({ type: 'REGISTER_START' });

    try {
      const result = await authService.register(data);

      storeAuth(result.user, result.tokens);
      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: result,
      });

      // Track registration event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'sign_up', {
          method: 'email',
          user_id: result.user.id,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error de registro';
      dispatch({
        type: 'REGISTER_FAILURE',
        payload: message,
      });
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    clearStoredAuth();
    dispatch({ type: 'LOGOUT' });

    // Track logout event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'logout');
    }

    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  // Refresh token function
  const refreshToken = async () => {
    if (!state.tokens?.refreshToken) {
      logout();
      return;
    }

    try {
      const newTokens = await authService.refreshToken(state.tokens.refreshToken);
      
      if (state.user) {
        storeAuth(state.user, newTokens);
      }
      
      dispatch({
        type: 'REFRESH_TOKEN_SUCCESS',
        payload: newTokens,
      });
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
    }
  };

  // Update user function
  const updateUser = async (updates: Partial<User>) => {
    if (!state.user) {
      throw new Error('No hay usuario autenticado');
    }

    try {
      const updatedUser = await authService.updateUser(state.user.id, updates);
      
      // Update stored user data
      if (state.tokens) {
        storeAuth(updatedUser, state.tokens);
      }
      
      dispatch({
        type: 'SET_USER',
        payload: updatedUser,
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Auto refresh token before expiry
  useEffect(() => {
    if (!state.tokens?.accessToken || !state.isAuthenticated) {
      return;
    }

    // Refresh token 5 minutes before expiry
    const refreshInterval = (state.tokens.expiresIn - 5 * 60) * 1000;
    
    const intervalId = setInterval(() => {
      refreshToken();
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [state.tokens, state.isAuthenticated]);

  // Context value
  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshToken,
    clearError,
    updateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// HOC for protected routes
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: 'client' | 'admin'
) => {
  const AuthenticatedComponent = (props: P) => {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return null;
    }

    if (requiredRole && user?.role !== requiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Acceso Denegado
            </h1>
            <p className="text-gray-600">
              No tienes permisos para acceder a esta página.
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };

  AuthenticatedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;
  
  return AuthenticatedComponent;
};
