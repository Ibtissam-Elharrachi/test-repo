import { useState, useEffect, useCallback } from "react";
import { getReceivedFeedbacks } from "../services/feedbackService";

export function useNotifications(user) {
  const userId = user?.id;
  const storageKey = userId ? `evolve_read_${userId}` : null;

  const [items, setItems] = useState([]);
  const [readIds, setReadIds] = useState([]);

  // Charge les notifications déjà lues
  useEffect(() => {
    if (!storageKey) {
      setReadIds([]);
      return;
    }
    try {
      setReadIds(JSON.parse(localStorage.getItem(storageKey)) || []);
    } catch {
      setReadIds([]);
    }
  }, [storageKey]);

  const refresh = useCallback(async () => {
    if (!userId) {
      setItems([]);
      return;
    }
    try {
      const data = await getReceivedFeedbacks();
      const sorted = [...data].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setItems(sorted.slice(0, 15));
    } catch (error) {
      console.error("Erreur notifications:", error);
    }
  }, [userId]);

  // Rafraîchit à la connexion puis toutes les 60 secondes
  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 60000);
    return () => clearInterval(interval);
  }, [refresh]);

  const save = (ids) => {
    setReadIds(ids);
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(ids));
    }
  };

  const markAsRead = (id) => {
    if (!readIds.includes(id)) save([...readIds, id]);
  };

  const markAllAsRead = () => {
    save([...new Set([...readIds, ...items.map((item) => item.id)])]);
  };

  const unreadCount = items.filter((item) => !readIds.includes(item.id)).length;

  return { items, readIds, unreadCount, markAsRead, markAllAsRead, refresh };
}