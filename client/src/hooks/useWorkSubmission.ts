import { useState } from 'react';
import apiClient from '../services/api';

export interface WorkSubmission {
  id: string;
  escrowAddress: string;
  milestoneIndex: number;
  submittedBy: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected' | string;
  createdAt: string;
  evaluations?: any[];
  [key: string]: any;
}

export function useWorkSubmission(escrowAddress: string | undefined, milestoneIndex: number | undefined) {
  const [submission, setSubmission] = useState<WorkSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmission = async () => {
    if (!escrowAddress || milestoneIndex === undefined) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient.getWorkSubmission(escrowAddress, milestoneIndex);
      const data = res.submission || res.data || res;
      setSubmission(data || null);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setSubmission(null);
    } finally {
      setLoading(false);
    }
  };

  const submitWork = async (content: string, metadata?: Record<string, any>) => {
    if (!escrowAddress || milestoneIndex === undefined) {
      throw new Error('Missing escrow address or milestone index');
    }

    try {
      const res = await apiClient.submitWork({
        escrowAddress,
        milestoneIndex,
        content,
        ...metadata,
      });
      const data = res.submission || res.data || res;
      setSubmission(data || null);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const evaluateWork = async () => {
    if (!escrowAddress || milestoneIndex === undefined) {
      throw new Error('Missing escrow address or milestone index');
    }

    try {
      const res = await apiClient.evaluateWork(escrowAddress, milestoneIndex);
      const data = res.evaluation || res.data || res;
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const rejectWork = async (reason: string) => {
    if (!escrowAddress || milestoneIndex === undefined) {
      throw new Error('Missing escrow address or milestone index');
    }

    try {
      const res = await apiClient.rejectWork(escrowAddress, milestoneIndex, reason);
      const data = res.data || res;
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return { submission, loading, error, fetchSubmission, submitWork, evaluateWork, rejectWork };
}
