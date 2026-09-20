import { useEffect, useState } from "react";
import { NotificationApi, type NotificationEntry } from "../api/client";
import { Bell } from "lucide-react";
import PassengerPageBackground from "../components/PassengerPageBackground";

export default function Notifications() {
  const [notifications, setNotifications] = useState<NotificationEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    NotificationApi.mine()
      .then(setNotifications)
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  async function handleDelete(id: number) {
    try {
      await NotificationApi.delete(id);
      setNotifications((prev) => prev?.filter((n) => n.id !== id) ?? null);
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-[85vh] bg-[#F8F6F0] relative overflow-hidden py-10 px-4">
      {/* Subtle Radio Broadcast & Alert Bells Watermark */}
      <PassengerPageBackground variant="notifications" opacity={0.20} />

      <div className="mx-auto max-w-2xl relative z-10">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#163E32]">
          <Bell size={18} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-[#163E32]">Notifications</h1>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-5 space-y-2">
        {notifications?.length === 0 && (
          <div className="rounded-xl border border-dashed border-[#D4CFC6] p-8 text-center">
            <Bell size={28} className="mx-auto text-[#A8C5BB]" />
            <p className="mt-2 text-sm text-[#6B8F82]">
              Nothing yet — notifications appear here when you book, pay, or a trip changes.
            </p>
          </div>
        )}
        {notifications?.map((n) => (
          <div
            key={n.id}
            className="rounded-xl border border-[#E2DDD5] bg-white p-4 transition-colors hover:border-[#D46B24]/30"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#8BA89E]">
                  {n.type.replace(/_/g, " ")} · {n.channel === "IN_APP" ? "Website Notification" : n.channel}
                </p>
                <p className="mt-1 text-sm text-[#1E4D3D]">{n.message}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="whitespace-nowrap text-xs text-[#8BA89E]">
                  {new Date(n.sentAt).toLocaleString()}
                </span>
                <button
                  onClick={() => handleDelete(n.id)}
                  className="text-xs text-[#8BA89E] transition-colors hover:text-red-600"
                  title="Dismiss notification"
                >
                  Dismiss ×
                </button>
              </div>
            </div>
            <p className="mt-1.5 text-xs text-[#8BA89E]">
              ID: {n.id} · Delivery: {n.deliveryStatus}
            </p>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}
