import { useState, useEffect } from 'react';
import apiClient from '../services/api';

export interface Escrow {
  address?: string;
  id?: string;
  clientAddress?: string;
  freelancerAddress?: string;
  title?: string;
  description?: string;
  totalAmount?: number;
  amount?: number;
  token?: string;
  status?: string;
  createdAt?: string;
  milestones?: any[];
  [key: string]: any;
}

export function useEscrows() {
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await apiClient.listEscrows();
        // Backend returns array directly or under data/escrows field
        const data = Array.isArray(res) ? res : (res.escrows || res.data || []);
        setEscrows(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setEscrows([]);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  return { escrows, loading, error };
}

export function useEscrow(address: string | undefined) {
  const [escrow, setEscrow] = useState<Escrow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setLoading(false);
      return;
    }

    const fetch = async () => {
      try {
        setLoading(true);
        const res = await apiClient.getEscrow(address);
        // Backend returns object directly or under data/escrow field
        const data = res.escrow || res.data || res;
        setEscrow(data || null);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setEscrow(null);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [address]);

  return { escrow, loading, error };
}
