"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { NotificationDTO } from "@aurascenthaus/shared";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { queryKeys } from "@/hooks/helper/query-keys";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from "@/hooks/notifications";
import { playChime } from "@/lib/chime";
import { cn } from "@/lib/utils";

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function timeAgo(iso: string): string {
  const seconds = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];
  for (const [unit, size] of steps) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

interface NotificationBellProps {
  /** "dark" for the admin's dark header. */
  tone?: "light" | "dark";
}

/**
 * The bell for signed-in customers and admins. Checks for new notifications every 30 seconds;
 * when one arrives it plays a chime, shows a pop-up, and refreshes the orders on screen.
 */
export function NotificationBell({ tone = "light" }: NotificationBellProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const notifications = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  /** Ids already on screen. null until the first load, which must not chime for old notifications. */
  const seen = useRef<Set<string> | null>(null);

  const items = notifications.data?.data;
  const unread = notifications.data?.unreadCount ?? 0;

  const open = (n: NotificationDTO) => {
    if (!n.readAt) markRead.mutate(n.id);
    if (n.link) router.push(n.link);
  };

  useEffect(() => {
    if (!items) return;
    if (seen.current === null) {
      seen.current = new Set(items.map((n) => n.id));
      return;
    }
    const fresh = items.filter((n) => !n.readAt && !seen.current!.has(n.id));
    for (const n of items) seen.current.add(n.id);
    if (fresh.length === 0) return;

    playChime();
    const latest = fresh[0];
    toast(latest.title, {
      description: fresh.length > 1 ? `${latest.body} (+${fresh.length - 1} more)` : latest.body,
      action: latest.link ? { label: "View", onClick: () => open(latest) } : undefined,
      duration: 10_000,
    });
    // Show the new status or the new order without a reload.
    void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.admin.orders.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats.all });
    // `open` only uses stable hooks; re-running on its identity would chime twice.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, queryClient]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
          className={cn("relative", tone === "dark" && "text-espresso-foreground hover:bg-white/10 hover:text-espresso-foreground")}
        >
          <Bell className="size-[1.15rem]" strokeWidth={1.5} />
          {unread > 0 && (
            <span className="absolute top-0.5 right-0.5 grid min-w-4 place-items-center rounded-full bg-gold px-1 text-[10px] font-medium text-gold-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2">
          <DropdownMenuLabel className="p-0 text-sm font-medium">Notifications</DropdownMenuLabel>
          {unread > 0 && (
            <button
              type="button"
              className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              onClick={() => markAllRead.mutate()}
            >
              Mark all as read
            </button>
          )}
        </div>
        <DropdownMenuSeparator className="my-0" />
        {!items ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            {notifications.isError ? "We couldn't load your notifications." : "Loading…"}
          </p>
        ) : items.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">You&rsquo;re all caught up.</p>
        ) : (
          <div className="max-h-96 overflow-y-auto p-1">
            {items.map((n) => (
              <DropdownMenuItem key={n.id} onSelect={() => open(n)} className="items-start gap-3 px-2 py-2.5">
                <span
                  aria-hidden
                  className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.readAt ? "bg-transparent" : "bg-gold")}
                />
                <span className="min-w-0 flex-1 space-y-0.5">
                  <span className={cn("block text-sm", !n.readAt && "font-medium")}>{n.title}</span>
                  <span className="block text-xs whitespace-normal text-muted-foreground">{n.body}</span>
                  <span className="block text-[11px] text-muted-foreground/80">{timeAgo(n.createdAt)}</span>
                </span>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
