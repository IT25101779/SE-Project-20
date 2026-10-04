import { useEffect, useState, type FormEvent } from "react";
import {
  DriverApi,
  type DriverScheduleEntry,
  type ManifestEntry,
  type Bus,
} from "../api/client";
import toast from "react-hot-toast";
import {
  Bus as BusIcon,
  AlertTriangle,
  Wrench,
  MapPin,
  CheckCircle2,
  XCircle,
  ClipboardList,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type Tab = "trips" | "maintenance";

export default function DriverDashboard() {
  const [tab, setTab] = useState<Tab>("trips");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold text-[#163E32]">Driver Dashboard</h1>
      <p className="mt-1 text-sm text-[#6B8F82]">
        Manage your trips and report bus maintenance issues.
      </p>

      <div className="mt-4 flex gap-1 border-b border-[#E2DDD5]">
        {(
          [
            { id: "trips" as Tab, label: "Today's Trips", icon: <ClipboardList size={15} /> },
            { id: "maintenance" as Tab, label: "Maintenance", icon: <Wrench size={15} /> },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.id
                ? "border-[#D46B24] text-[#D46B24]"
                : "border-transparent text-[#6B8F82] hover:text-[#163E32]"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "trips" && <TripsTab />}
        {tab === "maintenance" && <MaintenanceTab />}
      </div>
    </div>
  );
}

// ─── TODAY'S TRIPS ───────────────────────────────────────────────────────────
function TripsTab() {
  const [schedules, setSchedules] = useState<DriverScheduleEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);
  const [manifest, setManifest] = useState<ManifestEntry[] | null>(null);

  useEffect(() => {
    DriverApi.todaysSchedules()
      .then(setSchedules)
      .catch((e) => setError(e.message));
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
    <div>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <div className="space-y-2">
        {schedules?.length === 0 && (
          <div className="rounded-xl border border-dashed border-[#D4CFC6] p-8 text-center">
            <BusIcon size={28} className="mx-auto text-[#A8C5BB]" />
            <p className="mt-2 text-sm text-[#6B8F82]">No trips scheduled for today.</p>
          </div>
        )}
        {schedules?.map((s) => (
          <div
            key={s.scheduleId}
            className="rounded-xl border border-[#E2DDD5] bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#163E32]">{s.routeName}</p>
                <p className="text-sm text-[#6B8F82]">
                  {s.busPlateNumber} ·{" "}
                  {new Date(s.departureTime).toLocaleTimeString()} →{" "}
                  {new Date(s.arrivalTime).toLocaleTimeString()}
                </p>
              </div>
              <div className="text-right">
                <StatusBadge status={s.status} />
                <p className="mt-1 text-xs text-[#6B8F82]">
                  {s.passengerCount} passengers
                </p>
                <button
                  onClick={() => toggleManifest(s.scheduleId)}
                  className="mt-1.5 flex items-center gap-1 rounded-lg bg-[#163E32] px-3 py-1 text-xs font-medium text-white hover:bg-[#1C4D3E] transition-colors ml-auto"
                >
                  {openId === s.scheduleId ? (
                    <>
                      Hide <ChevronUp size={12} />
                    </>
                  ) : (
                    <>
                      Manifest <ChevronDown size={12} />
                    </>
                  )}
                </button>
              </div>
            </div>

            {openId === s.scheduleId && (
              <div className="mt-3 border-t border-[#EDE9E1] pt-3 animate-fade-slide-down">
                {!manifest && (
                  <p className="text-sm text-[#8BA89E]">Loading manifest...</p>
                )}
                {manifest?.length === 0 && (
                  <p className="text-sm text-[#8BA89E]">
                    No confirmed passengers yet.
                  </p>
                )}
                {manifest && manifest.length > 0 && (
                  <div className="overflow-hidden rounded-lg border border-[#E2DDD5]">
                    <table className="w-full text-xs">
                      <thead className="bg-[#F4F1EA] text-[11px] font-bold uppercase tracking-wider text-[#6B8F82]">
                        <tr>
                          <th className="px-3 py-2 text-left">Passenger</th>
                          <th className="px-3 py-2 text-left">Seat</th>
                          <th className="px-3 py-2 text-left">Pickup</th>
                          <th className="px-3 py-2 text-left">Drop</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EDE9E1]">
                        {manifest.map((m, i) => (
                          <tr key={i} className="hover:bg-[#F4F1EA]/70">
                            <td className="px-3 py-2 font-medium text-[#163E32]">
                              {m.passengerName}
                            </td>
                            <td className="px-3 py-2 font-mono text-[#3D7A68]">
                              {m.seatNumber}
                            </td>
                            <td className="px-3 py-2 text-[#6B8F82]">
                              {m.pickupStopName}
                            </td>
                            <td className="px-3 py-2 text-[#6B8F82]">
                              {m.dropStopName}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAINTENANCE TAB ─────────────────────────────────────────────────────────
function MaintenanceTab() {
  const [buses, setBuses] = useState<Bus[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Report form state
  const [selectedBusId, setSelectedBusId] = useState<number | "">("");
  const [reason, setReason] = useState("");
  const [location, setLocation] = useState("");
  const [lat, setLat] = useState<string>("");
  const [lng, setLng] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  function load() {
    DriverApi.getBuses()
      .then(setBuses)
      .catch((e) => setError(e.message));
  }
  useEffect(load, []);

  async function handleReport(e: FormEvent) {
    e.preventDefault();
    if (!selectedBusId || !reason.trim()) {
      toast.error("Please select a bus and provide a reason.");
      return;
    }
    setSubmitting(true);
    try {
      await DriverApi.reportBreakdown({
        busId: Number(selectedBusId),
        reason: reason.trim(),
        breakdownLocation: location.trim(),
        latitude: lat ? Number(lat) : undefined,
        longitude: lng ? Number(lng) : undefined,
      });
      toast.success("Breakdown reported successfully!");
      setSelectedBusId("");
      setReason("");
      setLocation("");
      setLat("");
      setLng("");
      setShowForm(false);
      load();
    } catch (err: any) {
      toast.error(err.message || "Failed to report breakdown");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMarkFixed(busId: number, plate: string) {
    if (
      !window.confirm(
        `Mark bus ${plate} as fixed and back in service?`
      )
    )
      return;
    try {
      await DriverApi.reportFixed(busId);
      toast.success(`Bus ${plate} marked as fixed!`);
      load();
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    }
  }

  const unavailableBuses = buses?.filter((b) => b.unavailable) || [];
  const availableBuses = buses?.filter((b) => !b.unavailable) || [];

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-[#D46B24]/30 bg-[#FDF5ED] p-4 text-xs text-[#4A2810] space-y-1">
          <p className="font-bold flex items-center gap-1.5 text-sm text-[#4A2810]">
            <AlertTriangle size={16} className="text-[#D46B24]" />
            Backend Restart Required
          </p>
          <p>
            {error.includes("No static resource") || error.includes("not found")
              ? "The Spring Boot application was started in IntelliJ IDEA before the new maintenance endpoints were compiled. Please restart the application in IntelliJ (click Rerun 🔁) to activate the maintenance endpoints."
              : error}
          </p>
        </div>
      )}

      {/* Report Breakdown Button / Form */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all"
        >
          <AlertTriangle size={16} />
          Report Breakdown
        </button>
      ) : (
        <form
          onSubmit={handleReport}
          className="rounded-xl border-2 border-red-200 bg-red-50/50 p-5 space-y-4 animate-fade-slide-down"
        >
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-bold text-red-800">
              <AlertTriangle size={16} />
              Report Bus Breakdown
            </h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-xs text-[#6B8F82] hover:text-[#1C4D3E] underline"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-[#2B6E59] mb-1">
                Select Bus *
              </label>
              <select
                value={selectedBusId}
                onChange={(e) => setSelectedBusId(Number(e.target.value))}
                required
                className="w-full rounded-lg border border-[#D4CFC6] bg-white px-3 py-2 text-sm focus:border-[#D46B24] focus:outline-none"
              >
                <option value="">Choose a bus...</option>
                {availableBuses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.plateNumber} — {b.busType}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2B6E59] mb-1">
                Breakdown Location
              </label>
              <div className="relative">
                <MapPin
                  size={14}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8BA89E]"
                />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Near Kadawatha Junction"
                  className="w-full rounded-lg border border-[#D4CFC6] bg-white pl-8 pr-3 py-2 text-sm focus:border-[#D46B24] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2B6E59] mb-1">
              Issue Description *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={3}
              placeholder="Describe the issue (e.g. engine overheating, flat tire, brake failure...)"
              className="w-full rounded-lg border border-[#D4CFC6] bg-white px-3 py-2 text-sm focus:border-[#D46B24] focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#2B6E59] mb-1">
                GPS Latitude (optional)
              </label>
              <input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="6.9344"
                className="w-full rounded-lg border border-[#D4CFC6] bg-white px-3 py-2 text-sm focus:border-[#D46B24] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#2B6E59] mb-1">
                GPS Longitude (optional)
              </label>
              <input
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="79.8428"
                className="w-full rounded-lg border border-[#D4CFC6] bg-white px-3 py-2 text-sm focus:border-[#D46B24] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {submitting ? "Reporting..." : "Submit Report"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-[#D4CFC6] px-4 py-2 text-sm font-medium text-[#3D7A68] hover:bg-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Buses in Maintenance */}
      {unavailableBuses.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-red-700 mb-3">
            <XCircle size={16} />
            Buses in Maintenance ({unavailableBuses.length})
          </h3>
          <div className="space-y-2">
            {unavailableBuses.map((b) => (
              <div
                key={b.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border-2 border-red-200 bg-red-50 p-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                    <p className="font-bold text-[#163E32]">{b.plateNumber}</p>
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700">
                      {b.busType}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-red-700">
                    <Wrench size={12} className="inline mr-1" />
                    {b.unavailabilityReason || "No reason provided"}
                  </p>
                  {b.driverName && (
                    <p className="mt-0.5 text-xs text-[#6B8F82]">
                      Driver: {b.driverName} · {b.driverPhone}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleMarkFixed(b.id, b.plateNumber)}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm shrink-0"
                >
                  <CheckCircle2 size={14} />
                  Mark as Fixed
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Buses */}
      <div>
        <h3 className="flex items-center gap-2 text-sm font-bold text-[#2B6E59] mb-3">
          <CheckCircle2 size={16} className="text-emerald-500" />
          Available Buses ({availableBuses.length})
        </h3>
        {!buses && (
          <p className="text-sm text-[#8BA89E]">Loading fleet status...</p>
        )}
        {availableBuses.length === 0 && buses && (
          <p className="text-sm text-[#8BA89E]">No available buses.</p>
        )}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {availableBuses.map((b) => (
            <div
              key={b.id}
              className="flex items-center justify-between rounded-xl border border-[#E2DDD5] bg-white p-3.5"
            >
              <div>
                <p className="font-semibold text-[#163E32]">{b.plateNumber}</p>
                <p className="text-xs text-[#6B8F82]">
                  {b.busType} · {b.seatCapacity} seats
                </p>
                {b.driverName && (
                  <p className="text-xs text-[#8BA89E] mt-0.5">
                    {b.driverName}
                  </p>
                )}
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Active
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    SCHEDULED: "bg-blue-100 text-blue-700",
    IN_TRIP: "bg-emerald-100 text-emerald-700",
    DELAYED: "bg-amber-100 text-amber-700",
    COMPLETED: "bg-[#EDE9E1] text-[#3D7A68]",
  };
  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-medium ${
        colors[status] ?? "bg-[#EDE9E1]"
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
