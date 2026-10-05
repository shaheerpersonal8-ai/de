import { useState, useEffect } from 'react';
import apiClient from '../services/api';

export interface Notification {
  id: string;
  type: 'escrow' | 'evaluation' | 'payment' | 'dispute' | string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  [key: string]: any;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const [notifRes, countRes] = await Promise.all([
          apiClient.getNotifications(),
          apiClient.getUnreadCount(),
        ]);
        const notifs = Array.isArray(notifRes) ? notifRes : (notifRes.data || notifRes.notifications || []);
        const count = countRes.unreadCount || 0;
        setNotifications(notifs);
        setUnreadCount(count);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setNotifications([]);
        setUnreadCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await apiClient.markNotificationAsRead(id);
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      if (unreadCount > 0) {
        setUnreadCount(unreadCount - 1);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteNotif = async (id: string) => {
    try {
      await apiClient.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  return { notifications, unreadCount, loading, error, markAsRead, deleteNotif };
}
