"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { NotificationsResponse } from "@aurascenthaus/shared";
import { queryKeys } from "../helper/query-keys";
import { routes } from "../helper/routes";
import { useAxios } from "../useAxios";

/** How often the bell checks for new notifications. */
const POLL_MS = 30_000;

/**
 * The signed-in user's notifications and unread count. Checks every 30 seconds, also while the
 * tab is in the background, so a new order is heard even when the admin is on another tab.
 */
export function useNotifications({ enabled = true }: { enabled?: boolean } = {}) {
  const axios = useAxios();

  return useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: async () => {
      const { data } = await axios.get<NotificationsResponse>(routes.FETCH_NOTIFICATIONS);
      return data;
    },
    enabled,
    refetchInterval: POLL_MS,
    refetchIntervalInBackground: true,
    staleTime: 10_000,
  });
}

/** Mark one notification as read (when it's clicked). */
export function useMarkNotificationRead() {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      await axios.post(routes.READ_NOTIFICATION(notificationId));
    },
    onMutate: (notificationId) => {
      queryClient.setQueryData<NotificationsResponse>(queryKeys.notifications.all, (old) => {
        if (!old) return old;
        const target = old.data.find((n) => n.id === notificationId);
        if (!target || target.readAt) return old;
        return {
          unreadCount: Math.max(0, old.unreadCount - 1),
          data: old.data.map((n) => (n.id === notificationId ? { ...n, readAt: new Date().toISOString() } : n)),
        };
      });
    },
    onSettled: () => void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  });
}

export function useMarkAllNotificationsRead() {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await axios.post(routes.READ_ALL_NOTIFICATIONS);
    },
    onMutate: () => {
      const now = new Date().toISOString();
      queryClient.setQueryData<NotificationsResponse>(queryKeys.notifications.all, (old) =>
        old ? { unreadCount: 0, data: old.data.map((n) => (n.readAt ? n : { ...n, readAt: now })) } : old,
      );
    },
    onSettled: () => void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  });
}
