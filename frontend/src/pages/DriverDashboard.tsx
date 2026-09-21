import { useEffect, useState } from "react";
import { DriverApi, type DriverScheduleEntry, type ManifestEntry } from "../api/client";

export default function DriverDashboard() {
  const [schedules, setSchedules] = useState<DriverScheduleEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);
  const [manifest, setManifest] = useState<ManifestEntry[] | null>(null);

  useEffect(() => {
    DriverApi.todaysSchedules().then(setSchedules).catch((e) => setError(e.message));
  }, []);

  async function toggleManifest(scheduleId: number) {
    if (openId === scheduleId) {
      setOpenId(null);
      return;
    }
    setOpenId(scheduleId);
    setManifest(null);
    try {
      const data = await DriverApi.manifest(scheduleId);
      setManifest(data);
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Today's Trips</h1>
      <p className="mt-1 text-sm text-slate-500">
        Read-only view of today's active/scheduled trips and their passenger manifest.
      </p>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-4 space-y-2">
        {schedules?.length === 0 && <p className="text-slate-500">No trips scheduled for today.</p>}
        {schedules?.map((s) => (
          <div key={s.scheduleId} className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">{s.routeName}</p>
                <p className="text-sm text-slate-500">
                  {s.busPlateNumber} · {new Date(s.departureTime).toLocaleTimeString()} → {new Date(s.arrivalTime).toLocaleTimeString()}
                </p>
              </div>
              <div className="text-right">
                <StatusBadge status={s.status} />
                <p className="mt-1 text-xs text-slate-500">{s.passengerCount} passengers</p>
                <button
                  onClick={() => toggleManifest(s.scheduleId)}
                  className="mt-1 rounded bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-700"
                >
                  {openId === s.scheduleId ? "Hide manifest" : "View manifest"}
                </button>
              </div>
            </div>

            {openId === s.scheduleId && (
              <div className="mt-3 border-t border-slate-100 pt-3">
                {!manifest && <p className="text-sm text-slate-400">Loading manifest...</p>}
                {manifest?.length === 0 && <p className="text-sm text-slate-400">No confirmed passengers yet.</p>}
                {manifest?.map((m, i) => (
                  <div key={i} className="flex justify-between border-b border-slate-50 py-1 text-sm last:border-0">
                    <span>{m.passengerName} · Seat {m.seatNumber}</span>
                    <span className="text-slate-500">{m.pickupStopName} → {m.dropStopName}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    SCHEDULED: "bg-blue-100 text-blue-700",
    IN_TRIP: "bg-emerald-100 text-emerald-700",
    DELAYED: "bg-amber-100 text-amber-700",
    COMPLETED: "bg-slate-200 text-slate-600",
  };
  return <span className={`rounded-full px-2 py-1 text-xs font-medium ${colors[status] ?? "bg-slate-100"}`}>{status}</span>;
}
