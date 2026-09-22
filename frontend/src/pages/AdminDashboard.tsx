import { useEffect, useState, type FormEvent } from "react";
import { AdminApi, AdminStatsApi, TrackingApi, type Bus, type Route, type AuditLogEntry, type AdminStats, type UserEntry, type ScheduleSearchResult, type FleetTrackingDto } from "../api/client";
import toast from "react-hot-toast";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Bus as BusIcon, Route as RouteIcon, Users, DollarSign, AlertTriangle, UserPlus, Radio, MapPin, Gauge, RefreshCw, Archive, Trash2, Play, Plus, ChevronDown, ChevronUp } from "lucide-react";


type Tab = "overview" | "buses" | "routes" | "schedules" | "users" | "tracking" | "audit";

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>

      <div className="mt-4 flex gap-2 border-b border-slate-200">
        {(["overview", "buses", "routes", "schedules", "users", "tracking", "audit"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium capitalize ${
              tab === t ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t === "users" ? "Users & Staff" : t === "tracking" ? "Live Fleet Tracking" : t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "overview" && <OverviewTab />}
        {tab === "buses" && <BusesTab />}
        {tab === "routes" && <RoutesTab />}
        {tab === "schedules" && <SchedulesTab />}
        {tab === "users" && <UsersTab />}
        {tab === "tracking" && <FleetTrackingTab />}
        {tab === "audit" && <AuditTab />}
      </div>
    </div>
  );
}


// ---------------------------------------------------------------------------
function OverviewTab() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    AdminStatsApi.get().then(setStats).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!stats) return <p className="text-sm text-slate-400">Loading stats...</p>;

  const bookingStatusData = Object.entries(stats.bookingsByStatus).map(([name, value]) => ({ name, value }));
  const revenueByRouteData = Object.entries(stats.revenueByRoute).map(([name, value]) => ({ name, value }));
  const PIE_COLORS = ["#0f172a", "#f59e0b", "#10b981", "#ef4444", "#3b82f6", "#8b5cf6"];

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard icon={<Users size={16} />} label="Bookings" value={stats.totalBookings} sub={`${stats.confirmedBookings} confirmed`} />
        <KpiCard icon={<DollarSign size={16} />} label="Revenue" value={`Rs.${stats.totalRevenue.toLocaleString()}`} />
        <KpiCard icon={<BusIcon size={16} />} label="Active buses" value={stats.activeBuses} sub={stats.unavailableBuses > 0 ? `${stats.unavailableBuses} unavailable` : undefined} />
        <KpiCard icon={<RouteIcon size={16} />} label="Routes" value={stats.totalRoutes} sub={`${stats.totalPassengers} passengers`} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-700">Bookings by status</h3>
          <div className="mt-2 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={bookingStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                  {bookingStatusData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-700">Revenue by route</h3>
          <div className="mt-2 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByRouteData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#0f172a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {revenueByRouteData.length === 0 && (
            <p className="mt-2 flex items-center gap-1 text-xs text-slate-400">
              <AlertTriangle size={12} /> No completed payments yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
function BusesTab() {
  const [buses, setBuses] = useState<Bus[] | null>(null);
  const [plateNumber, setPlateNumber] = useState("");
  const [busType, setBusType] = useState("Semi-Luxury");
  const [seatCapacity, setSeatCapacity] = useState(12);
  const [error, setError] = useState<string | null>(null);

  function load() {
    AdminApi.getBuses().then(setBuses).catch((e) => setError(e.message));
  }
  useEffect(load, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await AdminApi.createBus({ plateNumber, busType, seatCapacity });
      setPlateNumber("");
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleMarkUnavailable(id: number) {
    const reason = window.prompt("Reason for marking this bus unavailable?");
    if (!reason) return;
    try {
      await AdminApi.setBusUnavailable(id, reason);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleMarkAvailable(id: number) {
    if (!window.confirm("Re-enable this bus and mark it as available?")) return;
    try {
      await AdminApi.setBusAvailable(id);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div>
      <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-2 rounded-xl border border-slate-200 bg-white p-4">
        <Field label="Plate number" value={plateNumber} onChange={setPlateNumber} />
        <div>
          <label className="block text-xs font-medium text-slate-600">Bus type</label>
          <select value={busType} onChange={(e) => setBusType(e.target.value)} className="mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option>Luxury</option>
            <option>Semi-Luxury</option>
            <option>Normal</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">Seats</label>
          <input type="number" value={seatCapacity} onChange={(e) => setSeatCapacity(Number(e.target.value))}
            className="mt-1 w-20 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">Add bus</button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-4 space-y-2">
        {buses?.map((b) => (
          <div key={b.id} className={`flex items-center justify-between rounded-xl border p-4 ${
            b.unavailable ? "border-red-200 bg-red-50" : "border-slate-200 bg-white"
          }`}>
            <div>
              <p className="font-semibold text-slate-900">
                {b.plateNumber}
                <span className="ml-2 text-sm font-normal text-slate-500">· {b.busType} · {b.seatCapacity} seats</span>
              </p>
              {b.unavailable && (
                <p className="text-xs text-red-600 mt-0.5 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 inline-block" />
                  Unavailable: {b.unavailabilityReason || "No reason given"}
                </p>
              )}
              {!b.unavailable && (
                <p className="text-xs text-emerald-600 mt-0.5 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                  Active & available
                </p>
              )}
            </div>
            <div className="flex gap-2 shrink-0 items-center">
              {!b.unavailable && (
                <button
                  onClick={() => handleMarkUnavailable(b.id)}
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
                >
                  Mark Unavailable
                </button>
              )}
              {b.unavailable && (
                <button
                  onClick={() => handleMarkAvailable(b.id)}
                  className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors font-semibold"
                >
                  ✓ Mark Available
                </button>
              )}
              <button
                onClick={async () => {
                  if (confirm(`Are you sure you want to delete bus ${b.plateNumber}?`)) {
                    try {
                      await AdminApi.deleteBus(b.id);
                      load();
                    } catch (err: any) {
                      setError(err.message);
                    }
                  }
                }}
                className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                title="Delete Bus"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



// ---------------------------------------------------------------------------
function RoutesTab() {
  const [routes, setRoutes] = useState<Route[] | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [originCity, setOriginCity] = useState("");
  const [destinationCity, setDestinationCity] = useState("");
  const [distanceKm, setDistanceKm] = useState(100);
  const [durationMin, setDurationMin] = useState(120);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Stop management state
  const [expandedRouteId, setExpandedRouteId] = useState<number | null>(null);
  const [addingStopRouteId, setAddingStopRouteId] = useState<number | null>(null);
  const [editingStopId, setEditingStopId] = useState<number | null>(null);
  const [stopName, setStopName] = useState("");
  const [stopSeq, setStopSeq] = useState<number>(0);
  const [stopLat, setStopLat] = useState<number>(6.9271);
  const [stopLon, setStopLon] = useState<number>(79.8612);
  const [stopPickup, setStopPickup] = useState(true);
  const [stopDrop, setStopDrop] = useState(true);
  const [submittingStop, setSubmittingStop] = useState(false);

  function load() {
    AdminApi.getRoutes().then(setRoutes).catch((e) => setError(e.message));
  }
  useEffect(load, []);

  function startEdit(r: Route) {
    setEditingId(r.id);
    setName(r.name);
    setOriginCity(r.originCity);
    setDestinationCity(r.destinationCity);
    setDistanceKm(r.distanceKm);
    setDurationMin(r.estimatedDurationMinutes);
    setError(null);
    setSuccess(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setName("");
    setOriginCity("");
    setDestinationCity("");
    setDistanceKm(100);
    setDurationMin(120);
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      if (editingId) {
        await AdminApi.updateRoute(editingId, {
          name,
          originCity,
          destinationCity,
          distanceKm,
          estimatedDurationMinutes: durationMin,
        });
        setSuccess(`Route "${name}" updated successfully.`);
      } else {
        await AdminApi.createRoute({
          name,
          originCity,
          destinationCity,
          distanceKm,
          estimatedDurationMinutes: durationMin,
        });
        setSuccess(`Route "${name}" added successfully.`);
      }
      cancelEdit();
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  function toggleStops(routeId: number) {
    if (expandedRouteId === routeId) {
      setExpandedRouteId(null);
      resetStopForm();
    } else {
      setExpandedRouteId(routeId);
      resetStopForm();
    }
  }

  function resetStopForm() {
    setAddingStopRouteId(null);
    setEditingStopId(null);
    setStopName("");
    setStopSeq(0);
    setStopLat(6.9271);
    setStopLon(79.8612);
    setStopPickup(true);
    setStopDrop(true);
  }

  function openAddStop(r: Route) {
    setAddingStopRouteId(r.id);
    setEditingStopId(null);
    setStopName("");
    setStopSeq(r.stops?.length || 0);
    // Approximate coordinate based on origin
    const isKandy = r.originCity.toLowerCase().includes("kandy");
    const isGalle = r.originCity.toLowerCase().includes("galle");
    setStopLat(isKandy ? 7.2906 : isGalle ? 6.0535 : 6.9344);
    setStopLon(isKandy ? 80.6337 : isGalle ? 80.221 : 79.8428);
    setStopPickup(true);
    setStopDrop(true);
  }

  function startEditStop(s: any, routeId: number) {
    setAddingStopRouteId(routeId);
    setEditingStopId(s.id);
    setStopName(s.name);
    setStopSeq(s.sequenceOrder);
    setStopLat(s.latitude);
    setStopLon(s.longitude);
    setStopPickup(s.pickupAllowed);
    setStopDrop(s.dropAllowed);
  }

  async function handleStopSubmit(e: FormEvent, routeId: number) {
    e.preventDefault();
    if (!stopName.trim()) {
      toast.error("Stop name is required.");
      return;
    }
    setSubmittingStop(true);
    try {
      if (editingStopId) {
        await AdminApi.updateStop(editingStopId, {
          name: stopName.trim(),
          sequenceOrder: Number(stopSeq),
          latitude: Number(stopLat),
          longitude: Number(stopLon),
          pickupAllowed: stopPickup,
          dropAllowed: stopDrop,
        });
        toast.success(`Stop "${stopName}" updated successfully!`);
      } else {
        await AdminApi.addStop(routeId, {
          name: stopName.trim(),
          sequenceOrder: Number(stopSeq),
          latitude: Number(stopLat),
          longitude: Number(stopLon),
          pickupAllowed: stopPickup,
          dropAllowed: stopDrop,
        });
        toast.success(`Stop "${stopName}" added to route!`);
      }
      resetStopForm();
      load();
    } catch (err: any) {
      toast.error(err.message || "Failed to save stop");
    } finally {
      setSubmittingStop(false);
    }
  }

  async function handleDeleteStop(stopId: number, name: string) {
    if (!window.confirm(`Are you sure you want to remove stop "${name}"?`)) return;
    try {
      await AdminApi.deleteStop(stopId);
      toast.success(`Stop "${name}" removed from route.`);
      load();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete stop");
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-5">
        <div className="col-span-2 sm:col-span-5 flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-slate-800">
            {editingId ? "Edit Route" : "Add New Route"}
          </h3>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="text-xs text-slate-500 hover:text-slate-800 underline"
            >
              Cancel Edit
            </button>
          )}
        </div>
        <Field label="Route name" value={name} onChange={setName} />
        <Field label="Origin" value={originCity} onChange={setOriginCity} />
        <Field label="Destination" value={destinationCity} onChange={setDestinationCity} />
        <div>
          <label className="block text-xs font-medium text-slate-600">Distance (km)</label>
          <input type="number" value={distanceKm} onChange={(e) => setDistanceKm(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">Duration (min)</label>
          <input type="number" value={durationMin} onChange={(e) => setDurationMin(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div className="col-span-2 sm:col-span-5 flex gap-2">
          <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
            {editingId ? "Save Changes" : "Add route"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {success && <p className="mt-2 text-sm text-emerald-600">{success}</p>}

      <div className="mt-4 space-y-3">
        {routes?.map((r) => {
          const isExpanded = expandedRouteId === r.id;
          const isAddingOrEditing = addingStopRouteId === r.id;

          return (
            <div
              key={r.id}
              className={`rounded-xl border transition-all ${
                editingId === r.id
                  ? "border-amber-400 bg-amber-50/40 p-4"
                  : isExpanded
                  ? "border-slate-300 bg-white shadow-sm p-4"
                  : "border-slate-200 bg-white p-4"
              }`}
            >
              {/* Route Summary Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900">{r.name}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                      {r.stops?.length || 0} stops
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {r.originCity} › {r.destinationCity} · {r.distanceKm} km · {r.estimatedDurationMinutes} mins
                  </p>
                  <p className="mt-1.5 text-xs text-slate-600 font-medium">
                    Stops: {r.stops?.map((s) => s.name).join(" › ") || "None defined"}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleStops(r.id)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      isExpanded
                        ? "bg-amber-500 text-slate-900 shadow-sm"
                        : "border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
                    }`}
                  >
                    <MapPin size={13} />
                    Manage Stops ({r.stops?.length || 0})
                    {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>

                  <button
                    onClick={() => startEdit(r)}
                    className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Edit Route
                  </button>

                  <button
                    onClick={async () => {
                      if (confirm(`Are you sure you want to delete route "${r.name}"?`)) {
                        try {
                          await AdminApi.deleteRoute(r.id);
                          load();
                        } catch (err: any) {
                          setError(err.message);
                        }
                      }
                    }}
                    className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Collapsible Stops Management Panel */}
              {isExpanded && (
                <div className="mt-4 border-t border-slate-200 pt-4 animate-fade-slide-down">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-amber-500" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        Intermediate Stops along {r.name}
                      </h4>
                    </div>
                    {!isAddingOrEditing && (
                      <button
                        type="button"
                        onClick={() => openAddStop(r)}
                        className="flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-sm"
                      >
                        <Plus size={13} /> Add Stop
                      </button>
                    )}
                  </div>

                  {/* Add / Edit Stop Form */}
                  {isAddingOrEditing && (
                    <form
                      onSubmit={(e) => handleStopSubmit(e, r.id)}
                      className="mb-4 rounded-xl border border-amber-300 bg-amber-50/50 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900">
                          {editingStopId ? `Edit Stop #${stopSeq}` : `Add New Stop to ${r.name}`}
                        </p>
                        <button
                          type="button"
                          onClick={resetStopForm}
                          className="text-xs text-slate-500 hover:text-slate-800 underline"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                            Stop Name *
                          </label>
                          <input
                            required
                            type="text"
                            value={stopName}
                            onChange={(e) => setStopName(e.target.value)}
                            placeholder="e.g. Kadawatha, Ambepussa..."
                            className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs focus:border-amber-500 focus:outline-none bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                            Sequence (Order 0, 1, 2...)
                          </label>
                          <input
                            required
                            type="number"
                            value={stopSeq}
                            onChange={(e) => setStopSeq(Number(e.target.value))}
                            className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs focus:border-amber-500 focus:outline-none bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                            Latitude *
                          </label>
                          <input
                            required
                            type="number"
                            step="any"
                            value={stopLat}
                            onChange={(e) => setStopLat(Number(e.target.value))}
                            placeholder="6.9855"
                            className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs focus:border-amber-500 focus:outline-none bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                            Longitude *
                          </label>
                          <input
                            required
                            type="number"
                            step="any"
                            value={stopLon}
                            onChange={(e) => setStopLon(Number(e.target.value))}
                            placeholder="79.9508"
                            className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs focus:border-amber-500 focus:outline-none bg-white"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-amber-200">
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-800 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={stopPickup}
                              onChange={(e) => setStopPickup(e.target.checked)}
                              className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                            />
                            Pickup Allowed
                          </label>
                          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-800 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={stopDrop}
                              onChange={(e) => setStopDrop(e.target.checked)}
                              className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                            />
                            Drop Allowed
                          </label>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={submittingStop}
                            className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
                          >
                            {submittingStop ? "Saving..." : editingStopId ? "Update Stop" : "Save Stop"}
                          </button>
                          <button
                            type="button"
                            onClick={resetStopForm}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-white transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* Stops Table */}
                  {!r.stops || r.stops.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-400">
                      No intermediate stops defined for this route yet. Click <strong>"+ Add Stop"</strong> to add pickup and drop points for passengers.
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          <tr>
                            <th className="px-3.5 py-2.5">Seq</th>
                            <th className="px-3.5 py-2.5">Stop Name</th>
                            <th className="px-3.5 py-2.5">GPS Coordinates</th>
                            <th className="px-3.5 py-2.5">Boarding / Alighting</th>
                            <th className="px-3.5 py-2.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {r.stops.map((s) => (
                            <tr
                              key={s.id}
                              className={`transition-colors ${
                                editingStopId === s.id ? "bg-amber-50/80" : "hover:bg-slate-50/70"
                              }`}
                            >
                              <td className="px-3.5 py-2.5 font-mono font-bold text-slate-700">
                                #{s.sequenceOrder}
                              </td>
                              <td className="px-3.5 py-2.5 font-semibold text-slate-900">
                                {s.name}
                              </td>
                              <td className="px-3.5 py-2.5 font-mono text-[11px] text-slate-500">
                                {s.latitude?.toFixed(4)}, {s.longitude?.toFixed(4)}
                              </td>
                              <td className="px-3.5 py-2.5">
                                <div className="flex gap-1.5">
                                  {s.pickupAllowed ? (
                                    <span className="inline-block rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                      ✓ Pickup
                                    </span>
                                  ) : (
                                    <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-400">
                                      ✕ No Pickup
                                    </span>
                                  )}
                                  {s.dropAllowed ? (
                                    <span className="inline-block rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                                      ✓ Drop
                                    </span>
                                  ) : (
                                    <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-400">
                                      ✕ No Drop
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => startEditStop(s, r.id)}
                                    className="rounded border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteStop(s.id, s.name)}
                                    className="rounded border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-600 hover:bg-red-100 transition-colors"
                                  >
                                    Delete
                                  </button>
                                </div>
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
          );
        })}
      </div>
    </div>
  );
}


// ---------------------------------------------------------------------------
function SchedulesTab() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [busId, setBusId] = useState<number | "">("");
  const [routeId, setRouteId] = useState<number | "">("");
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [schedules, setSchedules] = useState<ScheduleSearchResult[]>([]);

  function load() {
    AdminApi.getBuses().then(setBuses);
    AdminApi.getRoutes().then(setRoutes);
    AdminApi.getSchedules().then(setSchedules).catch(() => {});
  }
  useEffect(load, []);

  function startEdit(s: ScheduleSearchResult) {
    setEditingId(s.scheduleId);
    if (s.busId) setBusId(s.busId);
    if (s.routeId) setRouteId(s.routeId);
    // Format to YYYY-MM-DDTHH:mm for datetime-local input
    if (s.departureTime) setDeparture(s.departureTime.slice(0, 16));
    if (s.arrivalTime) setArrival(s.arrivalTime.slice(0, 16));
    setError(null);
    setSuccess(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setBusId("");
    setRouteId("");
    setDeparture("");
    setArrival("");
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!busId || !routeId || !departure || !arrival) {
      setError("Fill in all fields.");
      return;
    }
    try {
      if (editingId) {
        await AdminApi.updateSchedule(editingId, {
          busId: Number(busId),
          routeId: Number(routeId),
          departureTime: departure,
          arrivalTime: arrival,
        });
        setSuccess("Schedule updated successfully.");
      } else {
        await AdminApi.publishSchedule({
          busId: Number(busId),
          routeId: Number(routeId),
          departureTime: departure,
          arrivalTime: arrival,
        });
        setSuccess("Schedule published successfully.");
      }
      cancelEdit();
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-slate-800">
            {editingId ? "Edit Schedule" : "Publish New Schedule"}
          </h3>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="text-xs text-slate-500 hover:text-slate-800 underline"
            >
              Cancel Edit
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-600">Bus</label>
            <select value={busId} onChange={(e) => setBusId(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="">Select a bus</option>
              {buses.map((b) => <option key={b.id} value={b.id}>{b.plateNumber} ({b.busType})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Route</label>
            <select value={routeId} onChange={(e) => setRouteId(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="">Select a route</option>
              {routes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-slate-600">Departure</label>
            <input type="datetime-local" value={departure} onChange={(e) => setDeparture(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Arrival</label>
            <input type="datetime-local" value={arrival} onChange={(e) => setArrival(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-emerald-600">{success}</p>}
        <div className="flex gap-2">
          <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
            {editingId ? "Save Changes" : "Publish schedule"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          )}
        </div>
        <p className="text-xs text-slate-400">
          The backend checks for schedule conflicts (same bus double-booked into overlapping trips) before saving.
        </p>
      </form>

      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-3">All Active & Planned Schedules</h3>
        <div className="space-y-2">
          {schedules.length === 0 && <p className="text-xs text-slate-400">No schedules recorded yet.</p>}
          {schedules.map((s) => (
            <div key={s.scheduleId} className={`flex items-center justify-between rounded-lg border p-3 ${
              editingId === s.scheduleId ? "border-amber-400 bg-amber-50/50" : "border-slate-200 bg-white"
            }`}>
              <div>
                <p className="font-semibold text-slate-900">
                  {s.routeName} <span className="ml-2 font-mono text-xs text-amber-600 font-normal">[{s.busPlateNumber} - {s.busType}]</span>
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Departure: {new Date(s.departureTime).toLocaleString()} › Arrival: {new Date(s.arrivalTime).toLocaleString()}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Available Seats: {s.availableSeats} · Status: <span className="font-semibold text-slate-700">{s.scheduleStatus}</span>
                </p>
              </div>
              <div className="flex gap-2 shrink-0 items-center">
                <button
                  onClick={() => startEdit(s)}
                  className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  Edit
                </button>
                <button
                  onClick={async () => {
                    if (confirm(`Cancel/Delete schedule for ${s.routeName} (${s.busPlateNumber})?`)) {
                      try {
                        await AdminApi.deleteSchedule(s.scheduleId);
                        load();
                      } catch (err: any) {
                        setError(err.message);
                      }
                    }
                  }}
                  className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 shrink-0"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


// ---------------------------------------------------------------------------
function UsersTab() {
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("SUPPORT_STAFF");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function load() {
    AdminApi.getUsers().then(setUsers).catch((e) => setError(e.message));
  }
  useEffect(load, []);

  async function handleCreateStaff(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await AdminApi.createStaff({ name, email, phone, password, role });
      setSuccess(`Staff account created for ${name} (${role})`);
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function toggleActive(userId: number) {
    try {
      await AdminApi.toggleUserActive(userId);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function changeRole(userId: number, newRole: string) {
    try {
      await AdminApi.updateUserRole(userId, newRole);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="space-y-6">
      {/* Create Staff Form */}
      <form onSubmit={handleCreateStaff} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
          <UserPlus size={16} className="text-amber-500" /> Create New Staff Account
        </h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-slate-600">Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="e.g. Sahan Perera" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="staff@demo.com" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="0771234567" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-600">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Assigned Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="SUPPORT_STAFF">SUPPORT_STAFF</option>
              <option value="FINANCE_OFFICER">FINANCE_OFFICER</option>
              <option value="ADMIN">ADMIN</option>
              <option value="DRIVER">DRIVER</option>
            </select>
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-emerald-600">{success}</p>}
        <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
          Create Staff
        </button>
      </form>

      {/* Users and Staff List */}
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-3">All Accounts ({users.length})</h3>
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className={`flex items-center justify-between rounded-lg border p-3 ${
              u.active ? "border-slate-200 bg-white" : "border-red-200 bg-red-50/50"
            }`}>
              <div>
                <p className="font-medium text-slate-900 flex items-center gap-2">
                  {u.name}
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700">
                    {u.role}
                  </span>
                  {!u.active && <span className="text-[10px] text-red-600 font-bold">(DEACTIVATED)</span>}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{u.email} · {u.phone}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={u.role}
                  onChange={(e) => changeRole(u.id, e.target.value)}
                  className="rounded border border-slate-300 bg-white px-2 py-1 text-xs"
                >
                  <option value="PASSENGER">PASSENGER</option>
                  <option value="SUPPORT_STAFF">SUPPORT_STAFF</option>
                  <option value="FINANCE_OFFICER">FINANCE_OFFICER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="DRIVER">DRIVER</option>
                </select>
                <button
                  onClick={() => toggleActive(u.id)}
                  className={`rounded px-2.5 py-1 text-xs font-medium border ${
                    u.active
                      ? "border-red-200 text-red-600 hover:bg-red-50"
                      : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  {u.active ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
function AuditTab() {
  const [logs, setLogs] = useState<AuditLogEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    AdminApi.auditLog().then(setLogs).catch((e) => setError(e.message));
  }, []);

  return (
    <div className="space-y-2">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {logs?.length === 0 && <p className="text-slate-500">No audited actions yet - try marking a bus unavailable or delaying a schedule.</p>}
      {logs?.map((l) => (
        <div key={l.id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
          <p className="font-medium text-slate-900">{l.action} · {l.entityName} #{l.entityId}</p>
          <p className="text-slate-500">{l.staffName} · {new Date(l.timestamp).toLocaleString()}</p>
          {l.details && <p className="text-xs text-slate-400">{l.details}</p>}
        </div>
      ))}
    </div>
  );
}


function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} required
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
    </div>
  );
}


// ---------------------------------------------------------------------------
// Core Function: Real-Time Bus Tracking CRUD (owner: Weerasekara W.M.A.G.B.)
// ---------------------------------------------------------------------------
function FleetTrackingTab() {
  const [fleet, setFleet] = useState<FleetTrackingDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulator state (CREATE & UPDATE)
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
  const [simLat, setSimLat] = useState<number>(6.9344);
  const [simLon, setSimLon] = useState<number>(79.8428);
  const [simSpeed, setSimSpeed] = useState<number>(55);
  const [pinging, setPinging] = useState(false);

  function loadFleet() {
    setLoading(true);
    TrackingApi.getFleetOverview()
      .then((data) => {
        setFleet(data);
        if (data.length > 0 && selectedScheduleId === null) {
          setSelectedScheduleId(data[0].scheduleId);
          setSimLat(data[0].latitude);
          setSimLon(data[0].longitude);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadFleet();
    const interval = setInterval(loadFleet, 6000);
    return () => clearInterval(interval);
  }, []);

  async function handleSendPing(e?: FormEvent) {
    if (e) e.preventDefault();
    if (!selectedScheduleId) return;
    setPinging(true);
    try {
      const res = await TrackingApi.sendGpsPing(selectedScheduleId, {
        latitude: Number(simLat),
        longitude: Number(simLon),
        speedKmH: Number(simSpeed),
      });
      toast.success("GPS position pinged! New ETA: " + (res.etaToArrival || "Recalculated"));
      loadFleet();
    } catch (err: any) {
      toast.error(err.message || "Failed to send GPS ping");
    } finally {
      setPinging(false);
    }
  }

  function handleAdvanceCoordinates() {
    if (!selectedScheduleId) return;
    const newLat = Number((Number(simLat) + 0.015).toFixed(4));
    const newLon = Number((Number(simLon) + 0.012).toFixed(4));
    setSimLat(newLat);
    setSimLon(newLon);
    TrackingApi.sendGpsPing(selectedScheduleId, {
      latitude: newLat,
      longitude: newLon,
      speedKmH: simSpeed,
    })
      .then((res) => {
        toast.success("Moved bus! Lat: " + newLat + ", Lon: " + newLon + " · ETA: " + (res.etaToArrival || "Updated"));
        loadFleet();
      })
      .catch((err) => toast.error(err.message || "Failed to advance position"));
  }

  async function handleArchive(scheduleId: number) {
    try {
      const res = await TrackingApi.archiveGpsLogs(scheduleId);
      toast.success("Archived " + res.archivedCount + " GPS log entries for trip #" + scheduleId);
      loadFleet();
    } catch (err: any) {
      toast.error(err.message || "Failed to archive GPS logs");
    }
  }

  async function handlePurge(scheduleId: number) {
    if (!window.confirm("Purge archived GPS logs for trip #" + scheduleId + "?")) return;
    try {
      const res = await TrackingApi.purgeGpsLogs(scheduleId);
      toast.success("Purged " + res.purgedCount + " archived log records.");
      loadFleet();
    } catch (err: any) {
      toast.error(err.message || "Failed to purge GPS logs");
    }
  }

  const selectedBus = fleet.find((f) => f.scheduleId === selectedScheduleId);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-slate-900 font-bold shadow-lg shadow-amber-500/20">
                <Radio size={20} />
              </span>
              <h2 className="text-xl font-bold">Real-Time Fleet Tracking Operations</h2>
            </div>
            <p className="mt-1 text-xs text-slate-300">
              Live Map & ETA (Read) · Device Simulator (Create/Update) · Trip GPS Archival & Purge (Delete)
            </p>
          </div>
          <button
            onClick={loadFleet}
            className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/20 transition-all border border-white/10 self-start sm:self-auto"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Fleet
          </button>
        </div>

        {/* Stats tiles */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/10 pt-5 text-xs">
          <div className="rounded-xl bg-white/5 p-3">
            <p className="text-slate-400">Monitored Fleet</p>
            <p className="text-lg font-bold text-white mt-0.5">{fleet.length} Buses</p>
          </div>
          <div className="rounded-xl bg-white/5 p-3">
            <p className="text-slate-400">In-Trip Active</p>
            <p className="text-lg font-bold text-emerald-400 mt-0.5">
              {fleet.filter((f) => f.status === "IN_TRIP").length}
            </p>
          </div>
          <div className="rounded-xl bg-white/5 p-3">
            <p className="text-slate-400">Scheduled / Delayed</p>
            <p className="text-lg font-bold text-amber-400 mt-0.5">
              {fleet.filter((f) => f.status === "SCHEDULED" || f.status === "DELAYED").length}
            </p>
          </div>
          <div className="rounded-xl bg-white/5 p-3">
            <p className="text-slate-400">Completed Trips</p>
            <p className="text-lg font-bold text-blue-400 mt-0.5">
              {fleet.filter((f) => f.status === "COMPLETED").length}
            </p>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Grid: Fleet Overview Cards (READ) */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <MapPin size={16} className="text-amber-500" /> Active Fleet Location & ETA Status (Read)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fleet.map((bus) => (
            <div
              key={bus.scheduleId}
              className={"rounded-2xl border p-5 transition-all shadow-sm " + (
                selectedScheduleId === bus.scheduleId
                  ? "border-amber-500 bg-amber-50/20 ring-2 ring-amber-500/20"
                  : "border-slate-200 bg-white hover:border-slate-300"
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{bus.routeName}</span>
                    <span className="rounded bg-slate-900 px-2 py-0.5 font-mono text-[11px] font-bold text-amber-400">
                      {bus.busPlateNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {bus.busType} · Driver: <strong className="text-slate-700">{bus.driverName}</strong>
                  </p>
                </div>
                <span
                  className={"rounded-full px-2.5 py-0.5 text-[10px] font-bold " + (
                    bus.status === "IN_TRIP"
                      ? "bg-emerald-100 text-emerald-800"
                      : bus.status === "DELAYED"
                      ? "bg-amber-100 text-amber-800"
                      : bus.status === "COMPLETED"
                      ? "bg-slate-100 text-slate-600"
                      : "bg-blue-100 text-blue-800"
                  )}
                >
                  {bus.status}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                  <span>Trip Progress</span>
                  <span className="font-semibold text-slate-700">{bus.progressPercent}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500"
                    style={{ width: bus.progressPercent + "%" }}
                  />
                </div>
              </div>

              {/* Coordinates & ETA Metrics */}
              <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-2.5 text-xs text-center border border-slate-100">
                <div>
                  <p className="text-[10px] text-slate-400">Live Speed</p>
                  <p className="font-bold text-slate-800 mt-0.5 flex items-center justify-center gap-1">
                    <Gauge size={12} className="text-amber-500" /> {bus.speedKmH ? Math.round(bus.speedKmH) : 0} km/h
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Dynamic ETA</p>
                  <p className="font-bold text-emerald-600 mt-0.5">
                    {bus.etaToArrival || (bus.status === "COMPLETED" ? "Arrived" : "On schedule")}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Remaining</p>
                  <p className="font-bold text-slate-800 mt-0.5">
                    {bus.distanceRemainingKm} km
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <p className="font-mono text-[10px] text-slate-500">
                  Lat: {bus.latitude.toFixed(4)}, Lon: {bus.longitude.toFixed(4)} · <span className="font-semibold">{bus.totalGpsLogs} GPS logs</span> {bus.archived && "(Archived)"}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setSelectedScheduleId(bus.scheduleId);
                      setSimLat(bus.latitude);
                      setSimLon(bus.longitude);
                      setSimSpeed(bus.speedKmH || 55);
                    }}
                    className="rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-slate-800 transition-colors"
                  >
                    Select in Simulator
                  </button>
                  <button
                    onClick={() => handleArchive(bus.scheduleId)}
                    title="Archive Trip GPS Logs (Delete requirement)"
                    className="rounded-lg border border-slate-200 bg-white p-1 text-slate-600 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                  >
                    <Archive size={13} />
                  </button>
                  <button
                    onClick={() => handlePurge(bus.scheduleId)}
                    title="Purge Archived Logs"
                    className="rounded-lg border border-slate-200 bg-white p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Simulator Panel (CREATE & UPDATE) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Play size={16} className="text-amber-500" /> GPS Device & Driver Simulator (Create & Update)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate position packets sent from onboard bus hardware to test live GPS logging and dynamic ETA recalculation.
            </p>
          </div>
          {selectedBus && (
            <span className="rounded-xl bg-amber-100 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-900">
              Selected: {selectedBus.busPlateNumber} ({selectedBus.routeName})
            </span>
          )}
        </div>

        <form onSubmit={handleSendPing} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700">Target Bus / Trip</label>
              <select
                value={selectedScheduleId || ""}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setSelectedScheduleId(id);
                  const b = fleet.find((f) => f.scheduleId === id);
                  if (b) {
                    setSimLat(b.latitude);
                    setSimLon(b.longitude);
                    setSimSpeed(b.speedKmH || 55);
                  }
                }}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
              >
                {fleet.map((f) => (
                  <option key={f.scheduleId} value={f.scheduleId}>
                    Trip #{f.scheduleId}: {f.busPlateNumber} · {f.routeName} ({f.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={simLat}
                onChange={(e) => setSimLat(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={simLon}
                onChange={(e) => setSimLon(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-700">Speed (km/h):</label>
              <input
                type="number"
                value={simSpeed}
                onChange={(e) => setSimSpeed(Number(e.target.value))}
                className="w-20 rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-mono"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAdvanceCoordinates}
                className="flex items-center gap-1.5 rounded-xl border border-amber-500/50 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 transition-colors shadow-sm"
              >
                Advance Position Along Route (+0.015°)
              </button>
              <button
                type="submit"
                disabled={pinging || !selectedScheduleId}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-md disabled:opacity-50"
              >
                <Radio size={14} /> {pinging ? "Dispatching..." : "Send Custom GPS Ping"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Archival & Purge Manager (DELETE) */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Archive size={16} className="text-indigo-600" /> Location History Archival & Purge (Delete)
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
          In accordance with the project specification (<em>"System archives location history once a trip is completed"</em>),
          trips automatically archive their GPS trail upon completion. Fleet administrators can manually archive logs or purge old records to free storage.
        </p>

        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5">Schedule ID</th>
                <th className="px-4 py-2.5">Route</th>
                <th className="px-4 py-2.5">Bus</th>
                <th className="px-4 py-2.5">Trip Status</th>
                <th className="px-4 py-2.5">GPS Logs Count</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fleet.map((item) => (
                <tr key={item.scheduleId} className="hover:bg-slate-50/70">
                  <td className="px-4 py-2.5 font-mono font-bold">#{item.scheduleId}</td>
                  <td className="px-4 py-2.5 font-medium text-slate-900">{item.routeName}</td>
                  <td className="px-4 py-2.5 font-mono">{item.busPlateNumber}</td>
                  <td className="px-4 py-2.5">
                    <span className="font-semibold">{item.status}</span>
                  </td>
                  <td className="px-4 py-2.5 font-semibold">
                    {item.totalGpsLogs} logs {item.archived ? <span className="text-amber-600">(Archived)</span> : <span className="text-emerald-600">(Active)</span>}
                  </td>
                  <td className="px-4 py-2.5 text-right space-x-2">
                    <button
                      onClick={() => handleArchive(item.scheduleId)}
                      className="rounded bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800 hover:bg-amber-100"
                    >
                      Archive Logs
                    </button>
                    <button
                      onClick={() => handlePurge(item.scheduleId)}
                      className="rounded bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-100"
                    >
                      Purge Logs
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
