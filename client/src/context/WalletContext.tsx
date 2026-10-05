import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

type WalletContextValue = {
  connected: boolean;
  publicKey: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  loading: boolean;
};

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('proofly_wallet');
    if (saved) {
      setPublicKey(saved);
      setConnected(true);
    }
  }, []);

  const connectWallet = async () => {
    setLoading(true);
    try {
      // Mock wallet connection for demo
      // In production, use Phantom/Solflare SDK
      const address = 'Gh9nrGiGLh' + Math.random().toString(36).slice(2, 15).toUpperCase();
      localStorage.setItem('proofly_wallet', address);
      setPublicKey(address);
      setConnected(true);
    } catch (error) {
      console.error('Wallet connection failed', error);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    localStorage.removeItem('proofly_wallet');
    setPublicKey(null);
    setConnected(false);
  };

  const value = useMemo(
    () => ({ connected, publicKey, connectWallet, disconnectWallet, loading }),
    [connected, publicKey, loading]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider');
  return ctx;
}
