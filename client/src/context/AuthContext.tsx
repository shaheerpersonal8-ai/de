import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { AuthState, User } from '../types';
import { apiClient, ApiError } from '../services/apiClient';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  connectWallet: (wallet: string) => Promise<void>;
  verifyWallet: (signature: string, message: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_WALLET'; payload: string }
  | { type: 'WALLET_CONNECTED' }
  | { type: 'LOGOUT' };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  wallet: null,
  walletConnected: false
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: true, isLoading: false, error: null };
    case 'SET_WALLET':
      return { ...state, wallet: action.payload };
    case 'WALLET_CONNECTED':
      return { ...state, walletConnected: true, isLoading: false, error: null };
    case 'LOGOUT':
      localStorage.removeItem('auth_token');
      return initialState;
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = useCallback(async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await apiClient.login(email, password);
      const { token, user } = response.data;
      localStorage.setItem('auth_token', token);
      dispatch({ type: 'SET_USER', payload: user });
    } catch (error: any) {
      const apiError = error as ApiError;
      dispatch({ type: 'SET_ERROR', payload: apiError.message });
      throw error;
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await apiClient.signup(email, password, name);
      const { token, user } = response.data;
      localStorage.setItem('auth_token', token);
      dispatch({ type: 'SET_USER', payload: user });
    } catch (error: any) {
      const apiError = error as ApiError;
      dispatch({ type: 'SET_ERROR', payload: apiError.message });
      throw error;
    }
  }, []);

  const connectWallet = useCallback(async (wallet: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_WALLET', payload: wallet });
    // Wallet connection is verified separately via signature
  }, []);

  const verifyWallet = useCallback(async (signature: string, message: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await apiClient.verifyWallet(signature, message);
      const { user, token } = response.data;
      localStorage.setItem('auth_token', token);
      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'WALLET_CONNECTED' });
    } catch (error: any) {
      const apiError = error as ApiError;
      dispatch({ type: 'SET_ERROR', payload: apiError.message });
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await apiClient.updateProfile(data);
      dispatch({ type: 'SET_USER', payload: response.data.user });
    } catch (error: any) {
      const apiError = error as ApiError;
      dispatch({ type: 'SET_ERROR', payload: apiError.message });
      throw error;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, signup, connectWallet, verifyWallet, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
