import { useState, useEffect } from 'react';
import apiClient from '../services/api';

export interface Profile {
  walletAddress?: string;
  name?: string;
  bio?: string;
  role?: 'client' | 'freelancer' | 'both';
  verificationState?: string;
  createdAt?: string;
  portfolioUrl?: string;
  skills?: string[];
  [key: string]: any;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await apiClient.getProfile();
        // Backend returns profile directly or under profile/user/data field
        const data = res.profile || res.user || res.data || res;
        setProfile(data || null);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  const updateProfile = async (updates: Record<string, any>) => {
    try {
      const res = await apiClient.updateProfile(updates);
      const data = res.profile || res.user || res.data || res;
      setProfile(data || null);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return { profile, loading, error, updateProfile };
}
