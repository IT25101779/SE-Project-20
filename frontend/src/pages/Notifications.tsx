import { useEffect, useState } from "react";
import { NotificationApi, type NotificationEntry } from "../api/client";

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
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-4 space-y-2">
        {notifications?.length === 0 && (
          <p className="text-slate-500">Nothing yet - notifications appear here when you book, pay, or a trip changes.</p>
        )}
        {notifications?.map((n) => (
          <div key={n.id} className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {n.type.replace(/_/g, " ")} · {n.channel === "IN_APP" ? "Website Notification" : n.channel}
                </p>
                <p className="mt-0.5 text-sm text-slate-800">{n.message}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="whitespace-nowrap text-xs text-slate-400">
                  {new Date(n.sentAt).toLocaleString()}
                </span>
                <button
                  onClick={() => handleDelete(n.id)}
                  className="text-xs text-slate-400 hover:text-red-600"
                  title="Dismiss notification"
                >
                  Dismiss ×
                </button>
              </div>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              ID: {n.id} · Delivery: {n.deliveryStatus}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

