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
  Pencil,
  X,
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

  // Edit notification state
  const [editingLog, setEditingLog] = useState<NotificationEntry | null>(null);
  const [editMessage, setEditMessage] = useState<string>("");
  const [savingEdit, setSavingEdit] = useState(false);

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

  function handleEdit(log: NotificationEntry) {
    setEditingLog(log);
    setEditMessage(log.message);
  }

  async function handleSaveEdit() {
    if (!editingLog) return;
    if (!editMessage.trim()) {
      toast.error("Message cannot be empty.");
      return;
    }
    setSavingEdit(true);
    try {
      const updated = await SupportApi.editNotification(editingLog.id, editMessage);
      setLogs((prev) =>
        prev.map((log) => (log.id === updated.id ? updated : log))
      );
      toast.success(`Notification #${editingLog.id} message updated.`);
      setEditingLog(null);
      setEditMessage("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update notification");
    } finally {
      setSavingEdit(false);
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
      <div className="rounded-2xl bg-[#163E32] p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D46B24] text-white font-bold shadow-lg shadow-[#D46B24]/20">
                <Bell size={20} />
              </span>
              <h1 className="text-2xl font-extrabold tracking-tight">Support & Alert Operations</h1>
            </div>
            <p className="mt-1 text-sm text-[#A8C5BB]">
              Notification & Alert Management · Delivery Logs · Channel Re-dispatch · Passenger Broadcast
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchLogs}
              className="flex items-center gap-1.5 rounded-xl bg-white/15 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/20 transition-all border border-white/15"
            >
              <RefreshCw size={14} className={loadingLogs ? "animate-spin" : ""} /> Refresh Logs
            </button>
          </div>
        </div>

        {/* Quick Stat Tiles */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/15 pt-5">
          <div className="rounded-xl bg-white/10 p-3">
            <p className="text-xs text-[#8BA89E]">Total Sent</p>
            <p className="text-xl font-bold text-white">{logs.length}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3">
            <p className="text-xs text-[#8BA89E]">Website Alerts</p>
            <p className="text-xl font-bold text-amber-400">
              {logs.filter((l) => l.channel === "IN_APP").length}
            </p>
          </div>
          <div className="rounded-xl bg-white/10 p-3">
            <p className="text-xs text-[#8BA89E]">SMS Alerts</p>
            <p className="text-xl font-bold text-emerald-400">
              {logs.filter((l) => l.channel === "SMS").length}
            </p>
          </div>
          <div className="rounded-xl bg-white/10 p-3">
            <p className="text-xs text-[#8BA89E]">Email Dispatches</p>
            <p className="text-xl font-bold text-blue-400">
              {logs.filter((l) => l.channel === "EMAIL").length}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-2 border-b border-[#E2DDD5]">
        <button
          onClick={() => setActiveTab("logs")}
          className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === "logs"
              ? "border-[#D46B24] text-[#D46B24]"
              : "border-transparent text-[#6B8F82] hover:text-[#163E32]"
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
              ? "border-[#D46B24] text-[#D46B24]"
              : "border-transparent text-[#6B8F82] hover:text-[#163E32]"
          }`}
        >
          <Send size={16} /> Broadcast Trip Alert
        </button>
        <button
          onClick={() => setActiveTab("lookup")}
          className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === "lookup"
              ? "border-[#D46B24] text-[#D46B24]"
              : "border-transparent text-[#6B8F82] hover:text-[#163E32]"
          }`}
        >
          <Search size={16} /> Booking Lookup (PBI-05)
        </button>
      </div>

      {/* TAB 1: DELIVERY LOGS */}
      {activeTab === "logs" && (
        <div className="mt-6 space-y-4">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-[#E2DDD5] bg-white p-3 shadow-sm">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter size={16} className="text-[#8BA89E] shrink-0" />
              <div className="flex gap-1 overflow-x-auto">
                {["ALL", "IN_APP", "SMS", "EMAIL"].map((c) => (
                  <button
                    key={c === "IN_APP" ? "WEBSITE" : c}
                    onClick={() => setFilterChannel(c)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      filterChannel === c
                        ? "bg-[#163E32] text-white"
                        : "bg-[#EDE9E1] text-[#3D7A68] hover:bg-[#E2DDD5]"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative w-full sm:w-72">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8BA89E]" />
              <input
                type="text"
                value={searchLogTerm}
                onChange={(e) => setSearchLogTerm(e.target.value)}
                placeholder="Search log by text, ID, passenger..."
                className="w-full rounded-lg border border-[#E2DDD5] pl-9 pr-3 py-1.5 text-xs focus:border-[#D46B24] focus:outline-none"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-[#E2DDD5] bg-white shadow-sm">
            <table className="w-full text-left text-xs text-[#3D7A68]">
              <thead className="bg-[#F4F1EA] text-[11px] font-bold uppercase tracking-wider text-[#6B8F82] border-b border-[#E2DDD5]">
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
              <tbody className="divide-y divide-[#EDE9E1]">
                {loadingLogs ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-[#8BA89E]">
                      Loading delivery logs...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-[#8BA89E]">
                      No delivery records found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#F4F1EA]/70 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-[#1E4D3D]">#{log.id}</td>
                      <td className="px-4 py-3 font-medium text-[#163E32]">
                        {log.user?.name || "Passenger"}
                        {log.user?.phone && (
                          <span className="block text-[10px] text-[#8BA89E]">{log.user.phone}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            log.channel === "SMS"
                              ? "bg-emerald-100 text-emerald-800"
                              : log.channel === "EMAIL"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-[#FDF5ED] text-[#5C3415]"
                          }`}
                        >
                          {log.channel === "SMS" && <Smartphone size={10} />}
                          {log.channel === "EMAIL" && <Mail size={10} />}
                          {log.channel === "IN_APP" && <Bell size={10} />}
                          {log.channel === "IN_APP" ? "WEBSITE" : log.channel}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[10px] text-[#6B8F82]">
                        {log.type}
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate text-[#1E4D3D]" title={log.message}>
                        {log.message}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-[#8BA89E] whitespace-nowrap">
                        {log.sentAt ? new Date(log.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            disabled={retryingId === log.id}
                            onClick={() => handleRetry(log.id, "SMS")}
                            title="Re-send as SMS"
                            className="rounded p-1 text-[#6B8F82] hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                          >
                            <Smartphone size={13} />
                          </button>
                          <button
                            disabled={retryingId === log.id}
                            onClick={() => handleRetry(log.id, "EMAIL")}
                            title="Re-send as Email"
                            className="rounded p-1 text-[#6B8F82] hover:bg-blue-50 hover:text-blue-700 transition-colors"
                          >
                            <Mail size={13} />
                          </button>
                          <button
                            disabled={retryingId === log.id}
                            onClick={() => handleRetry(log.id, "IN_APP")}
                            title="Re-send Website Alert"
                            className="rounded p-1 text-[#6B8F82] hover:bg-amber-50 hover:text-amber-700 transition-colors"
                          >
                            <RefreshCw size={13} className={retryingId === log.id ? "animate-spin" : ""} />
                          </button>
                          <button
                            onClick={() => handleEdit(log)}
                            title="Edit message"
                            className="rounded p-1 text-[#6B8F82] hover:bg-[#FDF5ED] hover:text-[#D46B24] transition-colors"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(log.id)}
                            title="Delete log entry"
                            className="rounded p-1 text-[#8BA89E] hover:bg-red-50 hover:text-red-600 transition-colors"
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
          <div className="lg:col-span-2 rounded-2xl border border-[#E2DDD5] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#163E32] flex items-center gap-2">
              <Send size={18} className="text-[#D46B24]" /> Broadcast Delay or Advisory Alert
            </h2>
            <p className="mt-1 text-xs text-[#6B8F82]">
              Notify all booked passengers of an active trip instantly across SMS, Email, or In-App channels.
            </p>

            <form onSubmit={handleBroadcast} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#2B6E59]">Select Scheduled Trip</label>
                <select
                  value={selectedScheduleId}
                  onChange={(e) => setSelectedScheduleId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#D4CFC6] bg-white px-3.5 py-2.5 text-sm text-[#163E32] focus:border-[#D46B24] focus:outline-none"
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
                <label className="block text-xs font-semibold text-[#2B6E59]">Broadcast Channel</label>
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
                          ? "border-[#D46B24] bg-[#FDF5ED] text-[#5C3415] shadow-sm"
                          : "border-[#E2DDD5] bg-[#F4F1EA] text-[#3D7A68] hover:bg-[#EDE9E1]"
                      }`}
                    >
                      {ch.icon} {ch.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B6E59]">Alert Message</label>
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Enter delay notice, stop change, or weather warning..."
                  className="mt-1 w-full rounded-xl border border-[#D4CFC6] p-3 text-sm text-[#163E32] focus:border-[#D46B24] focus:outline-none"
                />
                <div className="flex justify-between items-center text-[10px] text-[#6B8F82] mt-1">
                  <span>Maximum limit: 1,000 characters (~150-200 words)</span>
                  <span>{broadcastMessage.length} / 1000</span>
                </div>
              </div>

              {/* Quick preset pills */}
              <div>
                <p className="text-[11px] font-semibold text-[#6B8F82]">Quick Templates:</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {presets.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setBroadcastMessage(p)}
                      className="rounded-lg bg-[#EDE9E1] px-2.5 py-1 text-[11px] text-[#3D7A68] hover:bg-[#FDF5ED] hover:text-[#D46B24] transition-colors"
                    >
                      {p.slice(0, 38)}...
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={broadcasting}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#163E32] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#0D261F] transition-all shadow-md shadow-[#163E32]/20 disabled:opacity-50"
              >
                <Send size={15} /> {broadcasting ? "Broadcasting..." : "Dispatch Broadcast Alert"}
              </button>
            </form>
          </div>

          {/* Broadcast preview card */}
          <div className="rounded-2xl border border-[#E2DDD5] bg-[#F4F1EA] p-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#163E32]">Website Alert Preview</h3>
            <p className="text-xs text-[#6B8F82] mt-0.5">Live alert banner shown directly on the website</p>

            <div className="mt-4 rounded-2xl bg-white p-4 shadow-md border border-[#E2DDD5] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#D46B24] text-white">
                    <Bell size={14} />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-[#163E32]">Magiya Travel Alert</p>
                    <p className="text-[10px] text-[#8BA89E]">Via {broadcastChannel === "IN_APP" ? "Website Notification" : broadcastChannel}</p>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-emerald-600">LIVE</span>
              </div>
              <p className="text-xs text-[#2B6E59] leading-relaxed italic bg-[#F4F1EA] p-2.5 rounded-xl border border-[#EDE9E1]">
                "{broadcastMessage || "No message entered yet. Type above or pick a template to preview."}"
              </p>
              <div className="text-[10px] text-[#8BA89E] flex items-center gap-1">
                <Clock size={11} /> Delivered inside the website navigation bar & on-screen toast
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BOOKING LOOKUP */}
      {activeTab === "lookup" && (
        <div className="mt-6 max-w-2xl space-y-4">
          <div className="rounded-2xl border border-[#E2DDD5] bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-[#163E32]">Look up Passenger Booking (PBI-05)</h2>
            <p className="text-xs text-[#6B8F82]">
              Locate any passenger ticket by reference code to check journey details and seat assignments.
            </p>

            <form onSubmit={handleLookup} className="mt-4 flex gap-2">
              <input
                value={ticketReference}
                onChange={(e) => setTicketReference(e.target.value)}
                placeholder="Ticket reference, e.g. TCK-A1B2C3D4"
                className="flex-1 rounded-xl border border-[#D4CFC6] px-3.5 py-2.5 text-sm focus:border-[#D46B24] focus:outline-none"
              />
              <button
                type="submit"
                disabled={lookupLoading}
                className="flex items-center gap-1.5 rounded-xl bg-[#163E32] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0D261F] transition-colors"
              >
                <Search size={15} /> Look up
              </button>
            </form>
          </div>

          {booking && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[#163E32]">{booking.passenger.name}</p>
                  <p className="text-xs text-[#6B8F82]">{booking.passenger.email} {booking.passenger.phone ? `· ${booking.passenger.phone}` : ""}</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                  {booking.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs border-t border-emerald-200/60 pt-3">
                <div>
                  <p className="text-[#6B8F82]">Seat Number</p>
                  <p className="font-bold text-[#163E32]">Seat {booking.seat.seatNumber}</p>
                </div>
                <div>
                  <p className="text-[#6B8F82]">Travel Date</p>
                  <p className="font-bold text-[#163E32]">{booking.travelDate}</p>
                </div>
                <div>
                  <p className="text-[#6B8F82]">Pickup Stop</p>
                  <p className="font-bold text-[#163E32]">{booking.pickupStop.name}</p>
                </div>
                <div>
                  <p className="text-[#6B8F82]">Drop Stop</p>
                  <p className="font-bold text-[#163E32]">{booking.dropStop.name}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* EDIT NOTIFICATION MODAL */}
      {editingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E2DDD5] w-full max-w-lg mx-4">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2DDD5]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FDF5ED] flex items-center justify-center">
                  <Pencil size={16} className="text-[#D46B24]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#163E32]">Edit Notification</h3>
                  <p className="text-[11px] text-[#8BA89E]">
                    #{editingLog.id} &middot; {editingLog.user?.name || "Passenger"} &middot; {editingLog.channel}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setEditingLog(null); setEditMessage(""); }}
                className="rounded-lg p-1.5 text-[#8BA89E] hover:bg-[#F4F1EA] hover:text-[#163E32] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <label className="block text-xs font-semibold text-[#163E32] mb-2">
                Message
              </label>
              <textarea
                value={editMessage}
                onChange={(e) => setEditMessage(e.target.value)}
                maxLength={1000}
                rows={5}
                className="w-full rounded-xl border border-[#E2DDD5] bg-[#F8F6F0] px-4 py-3 text-sm text-[#163E32] placeholder:text-[#8BA89E] focus:outline-none focus:ring-2 focus:ring-[#D46B24]/30 focus:border-[#D46B24] resize-y"
                placeholder="Enter notification message..."
              />
              <div className="flex justify-between items-center mt-1.5">
                <p className="text-[10px] text-[#8BA89E]">
                  Max 1,000 characters
                </p>
                <p className={`text-[10px] font-mono ${editMessage.length > 900 ? "text-red-500" : "text-[#8BA89E]"}`}>
                  {editMessage.length}/1000
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E2DDD5] bg-[#F8F6F0] rounded-b-2xl">
              <button
                onClick={() => { setEditingLog(null); setEditMessage(""); }}
                className="px-4 py-2 rounded-lg text-sm font-medium text-[#6B8F82] hover:bg-[#E2DDD5] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit || !editMessage.trim() || editMessage === editingLog.message}
                className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-[#163E32] hover:bg-[#1C4D3E] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {savingEdit ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
