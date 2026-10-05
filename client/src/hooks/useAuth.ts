import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';

interface AuthState {
  isAuthenticated: boolean;
  wallet: string | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    wallet: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Check if token exists
    const token = localStorage.getItem('auth_token');
    const wallet = localStorage.getItem('user_wallet');
    if (token && wallet) {
      setAuth({ isAuthenticated: true, wallet, loading: false, error: null });
    } else {
      setAuth({ isAuthenticated: false, wallet: null, loading: false, error: null });
    }
  }, []);

  const disconnect = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_wallet');
    apiClient.clearToken();
    setAuth({ isAuthenticated: false, wallet: null, loading: false, error: null });
  };

  return { ...auth, disconnect };
}
