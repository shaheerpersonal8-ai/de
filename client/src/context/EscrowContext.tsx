import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { Escrow, PaginatedResponse } from '../types';
import { apiClient, ApiError } from '../services/apiClient';

interface EscrowContextType {
  escrows: Escrow[];
  currentEscrow: Escrow | null;
  isLoading: boolean;
  error: string | null;
  fetchEscrows: (filters?: any) => Promise<void>;
  fetchEscrow: (id: string) => Promise<void>;
  createEscrow: (data: any) => Promise<Escrow>;
  cancelEscrow: (id: string) => Promise<void>;
  clearError: () => void;
}

const EscrowContext = createContext<EscrowContextType | undefined>(undefined);

type EscrowAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ESCROWS'; payload: Escrow[] }
  | { type: 'SET_CURRENT_ESCROW'; payload: Escrow | null }
  | { type: 'UPDATE_ESCROW'; payload: Escrow };

const initialState = {
  escrows: [] as Escrow[],
  currentEscrow: null as Escrow | null,
  isLoading: false,
  error: null as string | null
};

function escrowReducer(state: typeof initialState, action: EscrowAction) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_ESCROWS':
      return { ...state, escrows: action.payload, isLoading: false, error: null };
    case 'SET_CURRENT_ESCROW':
      return { ...state, currentEscrow: action.payload, isLoading: false, error: null };
    case 'UPDATE_ESCROW':
      return {
        ...state,
        escrows: state.escrows.map(e => e.id === action.payload.id ? action.payload : e),
        currentEscrow: state.currentEscrow?.id === action.payload.id ? action.payload : state.currentEscrow
      };
    default:
      return state;
  }
}

export function EscrowProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(escrowReducer, initialState);

  const fetchEscrows = useCallback(async (filters?: any) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await apiClient.getEscrows(filters);
      dispatch({ type: 'SET_ESCROWS', payload: response.data.data || response.data });
    } catch (error: any) {
      const apiError = error as ApiError;
      dispatch({ type: 'SET_ERROR', payload: apiError.message });
    }
  }, []);

  const fetchEscrow = useCallback(async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await apiClient.getEscrow(id);
      dispatch({ type: 'SET_CURRENT_ESCROW', payload: response.data });
    } catch (error: any) {
      const apiError = error as ApiError;
      dispatch({ type: 'SET_ERROR', payload: apiError.message });
    }
  }, []);

  const createEscrow = useCallback(async (data: any) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await apiClient.createEscrow(data);
      const newEscrow = response.data;
      dispatch({ type: 'UPDATE_ESCROW', payload: newEscrow });
      return newEscrow;
    } catch (error: any) {
      const apiError = error as ApiError;
      dispatch({ type: 'SET_ERROR', payload: apiError.message });
      throw error;
    }
  }, []);

  const cancelEscrow = useCallback(async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await apiClient.cancelEscrow(id);
      await fetchEscrow(id);
    } catch (error: any) {
      const apiError = error as ApiError;
      dispatch({ type: 'SET_ERROR', payload: apiError.message });
      throw error;
    }
  }, [fetchEscrow]);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  return (
    <EscrowContext.Provider value={{ ...state, fetchEscrows, fetchEscrow, createEscrow, cancelEscrow, clearError }}>
      {children}
    </EscrowContext.Provider>
  );
}

export function useEscrow() {
  const context = useContext(EscrowContext);
  if (!context) {
    throw new Error('useEscrow must be used within EscrowProvider');
  }
  return context;
}
