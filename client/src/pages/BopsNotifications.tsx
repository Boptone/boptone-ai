import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import {
  Bell,
  Video,
  ArrowLeft,
  Check,
  CheckCheck,
  Loader2,
} from "lucide-react";

function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function BopsNotifications() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const { data: notifications, isLoading } = trpc.notifications.getAll.useQuery(
    {},
    { enabled: isAuthenticated }
  );

  const markAsRead = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => utils.notifications.getAll.invalidate(),
  });

  const unread = notifications?.filter((n) => !n.isRead) ?? [];
  const bopsNotifications = notifications?.filter((n) =>
    n.actionUrl?.startsWith("/bops")
  ) ?? [];

  function handleMarkAllRead() {
    const unreadItems = (notifications ?? []).filter((n) => !n.isRead);
    if (unreadItems.length === 0) return;
    Promise.all(unreadItems.map((n) => markAsRead.mutateAsync({ id: n.id })))
      .then(() => toast.success("All notifications marked as read"))
      .catch(() => toast.error("Could not mark notifications as read"));
  }

  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4"
        style={{ background: "#0d1117", color: "#fff" }}
      >
        <Bell className="w-12 h-12 text-[#5DCCCC]/40" />
        <p className="text-lg font-semibold text-white/70">Sign in to see your notifications</p>
        <button
          onClick={() => navigate("/bops")}
          className="text-[#5DCCCC] text-sm underline"
        >
          Back to Bops
        </button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen text-white"
      style={{ background: "#0d1117", fontFamily: "'Inter', sans-serif" }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-20 border-b border-white/5"
        style={{ background: "rgba(13,17,23,0.97)", backdropFilter: "blur(12px)" }}
      >
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/bops")}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#5DCCCC]" />
              <span className="font-bold text-sm">Bops Notifications</span>
              {unread.length > 0 && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-nums"
                  style={{ background: "#5DCCCC", color: "#000" }}
                >
                  {unread.length}
                </span>
              )}
            </div>
          </div>
          {unread.length > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markAsRead.isPending}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#5DCCCC] hover:text-white transition-colors disabled:opacity-50"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-[#5DCCCC] animate-spin" />
          </div>
        ) : bopsNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: "rgba(93,204,204,0.08)", border: "1px solid rgba(93,204,204,0.15)" }}
            >
              <Bell className="w-9 h-9 text-[#5DCCCC]/40" />
            </div>
            <div>
              <p className="text-white/50 text-base font-semibold mb-1">No Bops notifications yet</p>
              <p className="text-white/30 text-sm">
                Follow artists to get notified when they post a new Bop.
              </p>
            </div>
            <button
              onClick={() => navigate("/bops")}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm"
              style={{ background: "#5DCCCC", color: "#000" }}
            >
              <Video className="w-4 h-4" />
              Explore Bops
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {bopsNotifications.map((notif) => (
              <button
                key={notif.id}
                onClick={() => {
                  if (!notif.isRead) markAsRead.mutate({ id: notif.id });
                  if (notif.actionUrl) navigate(notif.actionUrl);
                }}
                className="w-full text-left flex items-start gap-4 px-4 py-4 rounded-xl transition-all"
                style={{
                  background: notif.isRead
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(93,204,204,0.06)",
                  border: notif.isRead
                    ? "1px solid rgba(255,255,255,0.05)"
                    : "1px solid rgba(93,204,204,0.15)",
                }}
              >
                {/* Icon */}
                <div
                  className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center mt-0.5"
                  style={{
                    background: notif.isRead
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(93,204,204,0.12)",
                  }}
                >
                  <Video
                    className="w-4 h-4"
                    style={{ color: notif.isRead ? "rgba(255,255,255,0.3)" : "#5DCCCC" }}
                  />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-semibold leading-snug"
                    style={{ color: notif.isRead ? "rgba(255,255,255,0.6)" : "#fff" }}
                  >
                    {notif.title}
                  </p>
                  <p className="text-xs text-white/40 mt-0.5 leading-relaxed line-clamp-2">
                    {notif.message}
                  </p>
                  <p className="text-[11px] text-white/25 mt-1.5">
                    {timeAgo(notif.createdAt)}
                  </p>
                </div>

                {/* Unread dot */}
                {!notif.isRead && (
                  <div
                    className="shrink-0 w-2 h-2 rounded-full mt-2"
                    style={{ background: "#5DCCCC" }}
                  />
                )}
                {notif.isRead && (
                  <Check className="shrink-0 w-3.5 h-3.5 text-white/15 mt-2" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
