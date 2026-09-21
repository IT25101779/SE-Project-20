import { useState, useEffect, type FormEvent } from "react";
import {
  SupportApi,
  AdminApi,
  type NotificationEntry,
  type ScheduleSearchResult,
} from "../api/client";
import {
  Bell,
  Send,
  RefreshCw,
  Trash2,
  Search,
  Mail,
  Smartphone,
  Radio,
  Clock,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";

interface BookingLookupResult {
  id: number;
  status: string;
  ticketReference: string;
  travelDate: string;
  passenger: { id: number; name: string; email: string; phone?: string };
  seat: { seatNumber: string };
  pickupStop: { name: string };
  dropStop: { name: string };
}

export default function SupportDashboard() {
  const [activeTab, setActiveTab] = useState<"logs" | "broadcast" | "lookup">("logs");

  // Notification Logs State
  const [logs, setLogs] = useState<NotificationEntry[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [filterChannel, setFilterChannel] = useState<string>("ALL");
  const [searchLogTerm, setSearchLogTerm] = useState<string>("");

  // Retry modal / state
  const [retryingId, setRetryingId] = useState<number | null>(null);

  // Broadcast state
  const [schedules, setSchedules] = useState<ScheduleSearchResult[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>("");
  const [broadcastMessage, setBroadcastMessage] = useState<string>("");
  const [broadcastChannel, setBroadcastChannel] = useState<string>("IN_APP");
  const [broadcasting, setBroadcasting] = useState<boolean>(false);

  // Lookup state
  const [ticketReference, setTicketReference] = useState("");
  const [booking, setBooking] = useState<BookingLookupResult | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  // Quick preset templates
  const presets = [
    "Trip is delayed by 30 mins due to highway maintenance. Please wait at your boarding point.",
    "Bus NB-1234 has departed Colombo Fort. Estimated arrival at your stop is on schedule.",
    "Platform Change: Please report to Bay 4 at Central Bus Stand for boarding.",
    "Severe weather advisory: Bus speed adjusted for passenger safety. Expected delay 15-20 mins.",
  ];

  function fetchLogs() {
    setLoadingLogs(true);
    SupportApi.getAllNotifications()
      .then((data) => setLogs(data))
      .catch((err) => toast.error(err.message || "Failed to load delivery logs"))
      .finally(() => setLoadingLogs(false));
  }

  function fetchSchedules() {
    AdminApi.getSchedules()
      .then((data) => {
        setSchedules(data);
        if (data.length > 0) {
          setSelectedScheduleId((prev) => prev || String(data[0].scheduleId));
        }
      })
      .catch((err) => {
        console.error("Failed to load schedules", err);
      });
  }

  useEffect(() => {
    fetchLogs();
    fetchSchedules();
  }, []);

  async function handleRetry(notificationId: number, channel?: string) {
    setRetryingId(notificationId);
    try {
      const resent = await SupportApi.retryNotification(notificationId, channel);
      toast.success(`Notification #${notificationId} re-dispatched via ${resent.channel}!`);
      fetchLogs();
    } catch (err: any) {
      toast.error(err.message || "Failed to retry notification");
    } finally {
      setRetryingId(null);
    }
  }

  async function handleDelete(notificationId: number) {
    if (!window.confirm(`Delete delivery log #${notificationId}?`)) return;
    try {
      await SupportApi.deleteNotification(notificationId);
      toast.success(`Delivery log #${notificationId} deleted.`);
      setLogs((prev) => prev.filter((item) => item.id !== notificationId));
    } catch (err: any) {
      toast.error(err.message || "Failed to delete notification");
    }
  }

  async function handleBroadcast(e: FormEvent) {
    e.preventDefault();
    if (!selectedScheduleId || !broadcastMessage.trim()) {
      toast.error("Please select a trip and enter an alert message.");
      return;
    }

    setBroadcasting(true);
    try {
      const res = await SupportApi.broadcastAlert(
        Number(selectedScheduleId),
        broadcastMessage,
        broadcastChannel
      );
      toast.success(
        `Alert dispatched to ${res.notifiedCount} passenger(s) via ${broadcastChannel}!`
      );
      setBroadcastMessage("");
      fetchLogs();
    } catch (err: any) {
      toast.error(err.message || "Broadcast failed");
    } finally {
      setBroadcasting(false);
    }
  }

  async function handleLookup(e: FormEvent) {
    e.preventDefault();
    if (!ticketReference.trim()) return;
    setLookupLoading(true);
    setBooking(null);
    try {
      const result = await SupportApi.lookupBooking(ticketReference.trim());
      setBooking(result as BookingLookupResult);
    } catch (err: any) {
      toast.error(err.message || "No booking found with this reference.");
    } finally {
      setLookupLoading(false);
    }
  }

  const filteredLogs = logs.filter((log) => {
    const matchesChannel = filterChannel === "ALL" || log.channel === filterChannel;
    const matchesSearch =
      searchLogTerm === "" ||
      log.message.toLowerCase().includes(searchLogTerm.toLowerCase()) ||
      String(log.id).includes(searchLogTerm) ||
      (log.bookingId && String(log.bookingId).includes(searchLogTerm)) ||
      (log.user && log.user.name.toLowerCase().includes(searchLogTerm.toLowerCase()));
    return matchesChannel && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-slate-900 font-bold shadow-lg shadow-amber-500/20">
                <Bell size={20} />
              </span>
              <h1 className="text-2xl font-extrabold tracking-tight">Support & Alert Operations</h1>
            </div>
            <p className="mt-1 text-sm text-slate-300">
              Notification & Alert Management · Delivery Logs · Channel Re-dispatch · Passenger Broadcast
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchLogs}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/20 transition-all border border-white/10"
            >
              <RefreshCw size={14} className={loadingLogs ? "animate-spin" : ""} /> Refresh Logs
            </button>
          </div>
        </div>

        {/* Quick Stat Tiles */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/10 pt-5">
          <div className="rounded-xl bg-white/5 p-3">
            <p className="text-xs text-slate-400">Total Sent</p>
            <p className="text-xl font-bold text-white">{logs.length}</p>
          </div>
          <div className="rounded-xl bg-white/5 p-3">
            <p className="text-xs text-slate-400">Website Alerts</p>
            <p className="text-xl font-bold text-amber-400">
              {logs.filter((l) => l.channel === "IN_APP").length}
            </p>
          </div>
          <div className="rounded-xl bg-white/5 p-3">
            <p className="text-xs text-slate-400">SMS Alerts</p>
            <p className="text-xl font-bold text-emerald-400">
              {logs.filter((l) => l.channel === "SMS").length}
            </p>
          </div>
          <div className="rounded-xl bg-white/5 p-3">
            <p className="text-xs text-slate-400">Email Dispatches</p>
            <p className="text-xl font-bold text-blue-400">
              {logs.filter((l) => l.channel === "EMAIL").length}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("logs")}
          className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === "logs"
              ? "border-amber-500 text-amber-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Radio size={16} /> Delivery Log ({logs.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("broadcast");
            fetchSchedules();
          }}
          className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === "broadcast"
              ? "border-amber-500 text-amber-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Send size={16} /> Broadcast Trip Alert
        </button>
        <button
          onClick={() => setActiveTab("lookup")}
          className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === "lookup"
              ? "border-amber-500 text-amber-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Search size={16} /> Booking Lookup (PBI-05)
        </button>
      </div>

      {/* TAB 1: DELIVERY LOGS */}
      {activeTab === "logs" && (
        <div className="mt-6 space-y-4">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter size={16} className="text-slate-400 shrink-0" />
              <div className="flex gap-1 overflow-x-auto">
                {["ALL", "IN_APP", "SMS", "EMAIL"].map((c) => (
                  <button
                    key={c === "IN_APP" ? "WEBSITE" : c}
                    onClick={() => setFilterChannel(c)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      filterChannel === c
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative w-full sm:w-72">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchLogTerm}
                onChange={(e) => setSearchLogTerm(e.target.value)}
                placeholder="Search log by text, ID, passenger..."
                className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-1.5 text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Recipient</th>
                  <th className="px-4 py-3">Channel</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Message</th>
                  <th className="px-4 py-3">Sent Time</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingLogs ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                      Loading delivery logs...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                      No delivery records found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-800">#{log.id}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {log.user?.name || "Passenger"}
                        {log.user?.phone && (
                          <span className="block text-[10px] text-slate-400">{log.user.phone}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            log.channel === "SMS"
                              ? "bg-emerald-100 text-emerald-800"
                              : log.channel === "EMAIL"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {log.channel === "SMS" && <Smartphone size={10} />}
                          {log.channel === "EMAIL" && <Mail size={10} />}
                          {log.channel === "IN_APP" && <Bell size={10} />}
                          {log.channel === "IN_APP" ? "WEBSITE" : log.channel}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[10px] text-slate-500">
                        {log.type}
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate text-slate-800" title={log.message}>
                        {log.message}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-slate-400 whitespace-nowrap">
                        {log.sentAt ? new Date(log.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            disabled={retryingId === log.id}
                            onClick={() => handleRetry(log.id, "SMS")}
                            title="Re-send as SMS"
                            className="rounded p-1 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                          >
                            <Smartphone size={13} />
                          </button>
                          <button
                            disabled={retryingId === log.id}
                            onClick={() => handleRetry(log.id, "EMAIL")}
                            title="Re-send as Email"
                            className="rounded p-1 text-slate-500 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                          >
                            <Mail size={13} />
                          </button>
                          <button
                            disabled={retryingId === log.id}
                            onClick={() => handleRetry(log.id, "IN_APP")}
                            title="Re-send Website Alert"
                            className="rounded p-1 text-slate-500 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                          >
                            <RefreshCw size={13} className={retryingId === log.id ? "animate-spin" : ""} />
                          </button>
                          <button
                            onClick={() => handleDelete(log.id)}
                            title="Delete log entry"
                            className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: BROADCAST TRIP ALERT */}
      {activeTab === "broadcast" && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Send size={18} className="text-amber-500" /> Broadcast Delay or Advisory Alert
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Notify all booked passengers of an active trip instantly across SMS, Email, or In-App channels.
            </p>

            <form onSubmit={handleBroadcast} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Select Scheduled Trip</label>
                <select
                  value={selectedScheduleId}
                  onChange={(e) => setSelectedScheduleId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-amber-500 focus:outline-none"
                >
                  {schedules.length === 0 && (
                    <option value="">Loading schedules...</option>
                  )}
                  {schedules.map((s) => (
                    <option key={s.scheduleId} value={s.scheduleId}>
                      Trip #{s.scheduleId}: {s.routeName} ({s.busPlateNumber} - {s.busType}) · Departure: {new Date(s.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Broadcast Channel</label>
                <div className="mt-1 grid grid-cols-3 gap-3">
                  {[
                    { id: "IN_APP", label: "Website Notification", icon: <Bell size={14} /> },
                    { id: "SMS", label: "SMS Simulation", icon: <Smartphone size={14} /> },
                    { id: "EMAIL", label: "Email Notice", icon: <Mail size={14} /> },
                  ].map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setBroadcastChannel(ch.id)}
                      className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition-all ${
                        broadcastChannel === ch.id
                          ? "border-amber-500 bg-amber-50 text-amber-800 shadow-sm"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {ch.icon} {ch.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Alert Message</label>
                <textarea
                  rows={3}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Enter delay notice, stop change, or weather warning..."
                  className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Quick preset pills */}
              <div>
                <p className="text-[11px] font-semibold text-slate-500">Quick Templates:</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {presets.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setBroadcastMessage(p)}
                      className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] text-slate-600 hover:bg-amber-100 hover:text-amber-900 transition-colors"
                    >
                      {p.slice(0, 38)}...
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={broadcasting}
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition-all shadow-md shadow-slate-900/20 disabled:opacity-50"
              >
                <Send size={15} /> {broadcasting ? "Broadcasting..." : "Dispatch Broadcast Alert"}
              </button>
            </form>
          </div>

          {/* Broadcast preview card */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">Website Alert Preview</h3>
            <p className="text-xs text-slate-500 mt-0.5">Live alert banner shown directly on the website</p>

            <div className="mt-4 rounded-2xl bg-white p-4 shadow-md border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-slate-900">
                    <Bell size={14} />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-900">BusGo Travel Alert</p>
                    <p className="text-[10px] text-slate-400">Via {broadcastChannel === "IN_APP" ? "Website Notification" : broadcastChannel}</p>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-emerald-600">LIVE</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                "{broadcastMessage || "No message entered yet. Type above or pick a template to preview."}"
              </p>
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <Clock size={11} /> Delivered inside the website navigation bar & on-screen toast
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BOOKING LOOKUP */}
      {activeTab === "lookup" && (
        <div className="mt-6 max-w-2xl space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900">Look up Passenger Booking (PBI-05)</h2>
            <p className="text-xs text-slate-500">
              Locate any passenger ticket by reference code to check journey details and seat assignments.
            </p>

            <form onSubmit={handleLookup} className="mt-4 flex gap-2">
              <input
                value={ticketReference}
                onChange={(e) => setTicketReference(e.target.value)}
                placeholder="Ticket reference, e.g. TCK-A1B2C3D4"
                className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={lookupLoading}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
              >
                <Search size={15} /> Look up
              </button>
            </form>
          </div>

          {booking && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">{booking.passenger.name}</p>
                  <p className="text-xs text-slate-500">{booking.passenger.email} {booking.passenger.phone ? `· ${booking.passenger.phone}` : ""}</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                  {booking.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs border-t border-emerald-200/60 pt-3">
                <div>
                  <p className="text-slate-500">Seat Number</p>
                  <p className="font-bold text-slate-900">Seat {booking.seat.seatNumber}</p>
                </div>
                <div>
                  <p className="text-slate-500">Travel Date</p>
                  <p className="font-bold text-slate-900">{booking.travelDate}</p>
                </div>
                <div>
                  <p className="text-slate-500">Pickup Stop</p>
                  <p className="font-bold text-slate-900">{booking.pickupStop.name}</p>
                </div>
                <div>
                  <p className="text-slate-500">Drop Stop</p>
                  <p className="font-bold text-slate-900">{booking.dropStop.name}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
