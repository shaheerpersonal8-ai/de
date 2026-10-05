import { useState } from 'react';
import apiClient from '../services/api';

export interface Dispute {
  id: string;
  milestoneId: string;
  escrowAddress: string;
  reason: string;
  status: 'open' | 'resolved' | string;
  decision?: 'approve_freelancer' | 'refund_client' | 'partial_release';
  reasoning?: string;
  createdAt: string;
  resolvedAt?: string;
  [key: string]: any;
}

export function useDispute(disputeId: string | undefined) {
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDispute = async () => {
    if (!disputeId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient.getDispute(disputeId);
      const data = res.dispute || res.data || res;
      setDispute(data || null);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setDispute(null);
    } finally {
      setLoading(false);
    }
  };

  const createDispute = async (milestoneId: string, escrowAddress: string, reason: string) => {
    try {
      const res = await apiClient.createDispute({ milestoneId, escrowAddress, reason });
      const data = res.dispute || res.data || res;
      setDispute(data || null);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const resolveDispute = async (
    decision: 'approve_freelancer' | 'refund_client' | 'partial_release',
    reasoning: string,
    paymentAdjustment?: number
  ) => {
    if (!disputeId) {
      throw new Error('No dispute ID');
    }

    try {
      const res = await apiClient.resolveDispute(disputeId, {
        decision,
        reasoning,
        paymentAdjustment,
      });
      const data = res.dispute || res.data || res;
      setDispute(data || null);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return { dispute, loading, error, fetchDispute, createDispute, resolveDispute };
}
