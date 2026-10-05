import { useState } from 'react';
import apiClient from '../services/api';

export interface WalletAnalysis {
  wallet: string;
  ownershipVerified?: boolean;
  professionalHistory?: any;
  walletActivity?: any;
  trading?: {
    realizedPnL?: number | string;
    unrealizedPnL?: number | string;
    tradingVolume?: number | string;
    profitableTradesPercent?: number;
    coveragePercent?: number;
    status?: string;
    excluded?: string[];
  };
  risk?: {
    level?: string;
    score?: number | null;
    signals?: any[];
    methodology?: string;
  };
  reliability?: {
    score?: number | null;
    label?: string;
    explanation?: string;
  };
  [key: string]: any;
}

export function useWalletAnalysis(walletAddress: string | undefined) {
  const [analysis, setAnalysis] = useState<WalletAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scan = async () => {
    if (!walletAddress) {
      setError('No wallet address provided');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // Server returns full profile object with wallet, trading, risk, reliability, etc.
      const profileData = await apiClient.getWalletProfile(walletAddress);
      setAnalysis(profileData);
    } catch (err: any) {
      setError(err.message);
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  return { analysis, loading, error, scan };
}
