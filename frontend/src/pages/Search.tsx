import { useState, type FormEvent, useEffect } from "react";
import {
  ScheduleApi, BookingApi, type ScheduleSearchResult,
  type StopDto, type SeatMapEntry, type BookingGroupResponse
} from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import SeatMap from "../components/SeatMap";
import PaymentCheckout from "../components/PaymentCheckout";
import StarRating from "../components/StarRating";
import TrackingMap from "../components/TrackingMap";
import PassengerPageBackground from "../components/PassengerPageBackground";
import toast from "react-hot-toast";
import {
  MapPin, Bus as BusIcon, ArrowRight, Users, X,
  Phone, ChevronDown, Info, Navigation,
  Wifi, Zap, Coffee, CheckCircle, SlidersHorizontal, ArrowLeftRight,
  AlertTriangle, Wrench, ShieldCheck, Clock
} from "lucide-react";

/**
 * Common Sri Lankan intercity and expressway bus hubs.
 * These cover major corridors: Southern Expressway (E01), Central Expressway (E04),
 * A1 Colombo-Kandy highway, A9 Northern corridor, and coastal A2 routes.
 */
const SRI_LANKA_CITIES = [
  "Colombo", "Kandy", "Galle", "Jaffna", "Ella",
  "Nuwara Eliya", "Anuradhapura", "Matara", "Negombo",
  "Trincomalee", "Batticaloa", "Ratnapura", "Kurunegala",
  "Kadawatha", "Kegalle", "Kalutara", "Ambalangoda",
  "Bandarawela", "Badulla",
];

/**
 * Returns today's date formatted as YYYY-MM-DD in local time
 * (avoids UTC boundary offsets that could cause date mismatches).
 */
function todayLocalDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

/**
 * Helper to compute trip duration string between departure and arrival timestamps.
 */
function calculateDuration(depIso: string, arrIso: string): string {
  const diffMs = new Date(arrIso).getTime() - new Date(depIso).getTime();
  if (diffMs <= 0) return "Direct";
  const totalMins = Math.floor(diffMs / (1000 * 60));
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  return hrs > 0 ? `${hrs}h ${mins > 0 ? `${mins}m` : ""}` : `${mins}m`;
}

/**
 * Main Bus Search & Reservation Page.
 *
 * Designed with a human-crafted editorial Sri Lankan transit aesthetic:
 * - Structured horizontal ticket layouts (boarding pass inspiration).
 * - Perforation notches and route corridor indicators.
 * - Deep Ceylon Forest Green (#163E32) and Warm Bus Amber (#D46B24).
 * - Real-time seat inventory, pessimistic seat holds, and GPS tracking.
 */
export default function Search() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [origin, setOrigin] = useState(searchParams.get("origin") || "Colombo");
  const [destination, setDestination] = useState(searchParams.get("destination") || "Kandy");
  const [date, setDate] = useState(searchParams.get("date") || todayLocalDateString());
  const [results, setResults] = useState<ScheduleSearchResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<ScheduleSearchResult | null>(null);
  const [detailBus, setDetailBus] = useState<ScheduleSearchResult | null>(null);

  // Filters state
  const [selectedBusType, setSelectedBusType] = useState<string>("ALL");

  useEffect(() => {
    const o = searchParams.get("origin");
    const d = searchParams.get("destination");
    const dt = searchParams.get("date") || todayLocalDateString();
    if (o && d) {
      doSearch(o, d, dt);
    } else {
      doSearch(origin, destination, date);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function doSearch(o: string, d: string, dt: string) {
    setError(null);
    setLoading(true);
    setSelected(null);
    try {
      const data = await ScheduleApi.search(o, d, `${dt}T00:00:00`);
      setResults(data);
    } catch (err: any) {
      setError(err.message || "Failed to load bus schedules. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    doSearch(origin, destination, date);
  }

  function handleSwap() {
    setOrigin(destination);
    setDestination(origin);
  }

  // System role guard: Staff, drivers, and finance officers cannot hold passenger seats
  const isStaffOrDriver = !!user && (user.role === "DRIVER" || user.role === "FINANCE_OFFICER" || user.role === "SUPPORT_STAFF");

  function handleInitiateBooking(r: ScheduleSearchResult) {
    if (!user) {
      navigate("/login");
      return;
    }
    if (isStaffOrDriver) {
      toast.error(`Ticket booking is restricted for ${user.role.replace("_", " ")} accounts. Please use a passenger account.`);
      return;
    }
    if (r.busUnavailable) {
      toast.error("This bus is currently under maintenance. Ticket booking is suspended.");
      return;
    }
    setSelected(r);
  }

  async function handleJoinWaitingList(scheduleId: number) {
    if (!user) {
      navigate("/login");
      return;
    }
    if (isStaffOrDriver) {
      toast.error(`Waitlist is restricted for ${user.role.replace("_", " ")} accounts.`);
      return;
    }
    try {
      await BookingApi.joinWaitingList(scheduleId);
      toast.success("Added to the waiting list — you'll be notified if a seat opens up.");
    } catch (err: any) {
      toast.error(err.message || "Failed to join waitlist");
    }
  }

  const isMoving = (r: ScheduleSearchResult) =>
    r.scheduleStatus === "IN_TRIP" || r.scheduleStatus === "DELAYED";

  const filteredResults = results?.filter((r) => {
    if (selectedBusType === "ALL") return true;
    return r.busType.toLowerCase() === selectedBusType.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-stone-900 pb-16 relative overflow-hidden">
      {/* Subtle Search & Route Themed Background Pattern */}
      <PassengerPageBackground variant="search" opacity={0.20} />

      {/* Editorial Transit Search Bar Header */}
      <section className="bg-[#163E32] text-white pt-8 pb-10 border-b border-[#0f2c24] relative z-10 overflow-hidden">
        {/* Subtle geometric Sri Lankan transit pattern overlay */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="mx-auto max-w-6xl px-4 sm:px-6 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-amber-300 mb-1">
                <span>මගියා ප්‍රවාහන සේවය</span>
                <span>•</span>
                <span>National Route Directory</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Find Express Bus Tickets
              </h1>
              <p className="text-xs text-emerald-100/75 mt-0.5">
                Official intercity services, expressway lines & SLTB luxury coaches
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-700/60 text-xs font-semibold text-emerald-200">
                <ShieldCheck size={14} className="text-amber-400" />
                Live Seat Inventory
              </span>
            </div>
          </div>

          {/* Transportation Search Form */}
          <form
            onSubmit={handleSearch}
            className="rounded-2xl bg-[#0f2c24] border border-[#235547] p-4 sm:p-5 shadow-2xl shadow-emerald-950/40 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
          >
            {/* Origin City */}
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-200 mb-1.5">
                Boarding Point (From)
              </label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400 z-10 pointer-events-none" />
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-[#163E32] border border-[#2d6253] text-white text-xs font-bold appearance-none focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
                >
                  {SRI_LANKA_CITIES.map((c) => (
                    <option key={c} value={c} className="bg-[#163E32] text-white">{c}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-300 pointer-events-none" />
              </div>
            </div>

            {/* Swap Button */}
            <div className="sm:col-span-1 flex justify-center pb-0.5">
              <button
                type="button"
                onClick={handleSwap}
                title="Swap departure and destination"
                className="h-10 w-10 rounded-xl bg-[#1c4b3d] border border-[#2d6253] text-emerald-200 hover:text-white hover:bg-[#D46B24] hover:border-[#D46B24] transition-all flex items-center justify-center active:scale-95"
              >
                <ArrowLeftRight size={15} />
              </button>
            </div>

            {/* Destination City */}
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-200 mb-1.5">
                Destination (To)
              </label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-300 z-10 pointer-events-none" />
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-[#163E32] border border-[#2d6253] text-white text-xs font-bold appearance-none focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
                >
                  {SRI_LANKA_CITIES.filter((c) => c !== origin).map((c) => (
                    <option key={c} value={c} className="bg-[#163E32] text-white">{c}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-300 pointer-events-none" />
              </div>
            </div>

            {/* Travel Date */}
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-200 mb-1.5">
                Journey Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  min={todayLocalDateString()}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl bg-[#163E32] border border-[#2d6253] px-3.5 py-2.5 text-white text-xs font-bold focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            {/* Search CTA */}
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#D46B24] hover:bg-[#b85b1c] py-2.5 px-4 font-extrabold text-white text-xs shadow-lg shadow-orange-950/30 transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-1.5"
              >
                {loading ? "Searching..." : "Search Buses →"}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Main Results Container with Editorial Filter Sidebar */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 relative z-10">
        {error && (
          <div className="mb-6 rounded-2xl bg-amber-50 border border-amber-300 p-4 text-xs text-amber-900 font-semibold flex items-center gap-3">
            <AlertTriangle size={18} className="text-[#D46B24] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {results && results.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Filter Sidebar */}
            <div className="lg:col-span-3 rounded-2xl bg-white border border-[#E2DDD5] p-5 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <span className="text-xs font-black uppercase tracking-widest text-[#163E32] flex items-center gap-1.5">
                  <SlidersHorizontal size={14} className="text-[#D46B24]" /> Filter Services
                </span>
                <button
                  onClick={() => setSelectedBusType("ALL")}
                  className="text-[11px] font-bold text-[#D46B24] hover:underline"
                >
                  Reset
                </button>
              </div>

              {/* Bus Class Filter */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2">Service Class</label>
                <div className="space-y-1.5">
                  {[
                    { key: "ALL", label: "All Service Classes" },
                    { key: "Luxury", label: "Luxury Super Line (A/C)" },
                    { key: "Semi-Luxury", label: "Semi-Luxury Express" },
                    { key: "Normal", label: "Normal Highway Line" },
                  ].map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setSelectedBusType(t.key)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                        selectedBusType === t.key
                          ? "bg-emerald-50 text-[#163E32] border border-emerald-300"
                          : "text-stone-600 hover:bg-stone-50 border border-transparent"
                      }`}
                    >
                      <span>{t.label}</span>
                      {selectedBusType === t.key && <CheckCircle size={14} className="text-[#163E32]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amenities Breakdown */}
              <div className="pt-3 border-t border-stone-100 space-y-2">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400">Standard Amenities</p>
                <div className="flex flex-wrap gap-1.5 text-[11px] text-stone-600">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200 font-semibold">
                    <Wifi size={12} className="text-[#163E32]" /> Wi-Fi
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200 font-semibold">
                    <Zap size={12} className="text-amber-600" /> USB Charge
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200 font-semibold">
                    <Coffee size={12} className="text-stone-500" /> Refreshments
                  </span>
                </div>
              </div>

              {/* Transit Policy Notice */}
              <div className="pt-3 border-t border-stone-100 text-[11px] text-stone-500 leading-relaxed">
                <p className="font-bold text-stone-700 mb-1">Sri Lanka Transport Standards</p>
                Seats held for 10 minutes upon selection. Please complete payment before hold timer expires.
              </div>
            </div>

            {/* Results List: Structured Horizontal Tickets */}
            <div className="lg:col-span-9 space-y-4">
              {isStaffOrDriver && (
                <div className="rounded-2xl bg-amber-50 border border-amber-300 p-4 text-xs font-semibold text-amber-900 flex items-center gap-3 shadow-sm">
                  <AlertTriangle size={18} className="text-amber-700 shrink-0" />
                  <div>
                    <span className="font-bold">Staff Session Active ({user?.role?.replace("_", " ")}):</span> You are viewing live schedule telemetry and maintenance statuses. Passenger booking and seat holds are restricted to traveler accounts.
                  </div>
                </div>
              )}

              {/* Results Summary Bar */}
              <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-[#E2DDD5] shadow-sm text-xs">
                <span className="font-extrabold text-[#163E32] flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#D46B24]" />
                  {filteredResults?.length || 0} Bus Services Available ({origin} → {destination})
                </span>
                <span className="text-stone-500 font-medium">Arranged by Departure</span>
              </div>

              {/* Individual Bus Results as Perforated Horizontal Tickets */}
              {filteredResults?.map((r) => (
                <BusCard
                  key={r.scheduleId}
                  r={r}
                  isStaffOrDriver={isStaffOrDriver}
                  onBook={() => handleInitiateBooking(r)}
                  onWaitingList={() => handleJoinWaitingList(r.scheduleId)}
                  onDetail={() => setDetailBus(r)}
                  isMoving={isMoving(r)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State: Ready to Search */}
        {results === null && !loading && (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#E2DDD5] shadow-sm p-8 max-w-xl mx-auto">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#163E32] mb-4">
              <BusIcon size={32} />
            </div>
            <h3 className="text-stone-900 text-lg font-extrabold">Ready to explore Sri Lanka by bus</h3>
            <p className="text-stone-500 text-xs mt-1.5 leading-relaxed">
              Select your boarding city, destination, and preferred travel date above to view official schedules and seat availability.
            </p>
          </div>
        )}

        {/* Empty State: No Trips Found */}
        {results?.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#E2DDD5] shadow-sm p-8 max-w-xl mx-auto">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#D46B24] mb-4">
              <BusIcon size={32} />
            </div>
            <h3 className="text-stone-900 text-lg font-extrabold">No scheduled trips found</h3>
            <p className="text-stone-500 text-xs mt-1.5 leading-relaxed">
              No active buses match this route on the selected date. Try choosing an adjacent city or checking tomorrow's timetable.
            </p>
          </div>
        )}
      </div>

      {/* Bus Detail Modal */}
      {detailBus && (
        <BusDetailModal
          schedule={detailBus}
          isStaffOrDriver={isStaffOrDriver}
          onClose={() => setDetailBus(null)}
          onBook={() => {
            setDetailBus(null);
            handleInitiateBooking(detailBus);
          }}
          isMoving={isMoving(detailBus)}
        />
      )}

      {/* Booking Seat Selection Modal */}
      {selected && (
        <BookingPanel
          schedule={selected}
          onClose={() => setSelected(null)}
          onDone={() => navigate("/my-bookings")}
        />
      )}
    </div>
  );
}

/**
 * ─── Structured Horizontal Bus Card (Ticket Boarding Pass Design) ─────────────
 *
 * Implements the human-crafted transportation ticket layout requested:
 * - Route header with operator & vehicle class
 * - Large departure & arrival clock faces with visual corridor line
 * - Live status badge (scheduled, on the way, delayed, in maintenance)
 * - Fare in LKR, available seats count, and prominent action CTA
 */
function BusCard({
  r,
  isStaffOrDriver,
  onBook,
  onWaitingList,
  onDetail,
  isMoving,
}: {
  r: ScheduleSearchResult;
  isStaffOrDriver?: boolean;
  onBook: () => void;
  onWaitingList: () => void;
  onDetail: () => void;
  isMoving: boolean;
}) {
  const sc: Record<string, { bg: string; label: string; dot: string }> = {
    SCHEDULED: { bg: "bg-blue-50 text-blue-700 border-blue-200", label: "Scheduled", dot: "bg-blue-500" },
    IN_TRIP:   { bg: "bg-emerald-50 text-emerald-800 border-emerald-300", label: "On the way", dot: "bg-emerald-500" },
    DELAYED:   { bg: "bg-amber-50 text-amber-800 border-amber-300", label: "Delayed", dot: "bg-amber-500" },
    CANCELLED: { bg: "bg-rose-50 text-rose-700 border-rose-200", label: "Cancelled", dot: "bg-rose-500" },
    COMPLETED: { bg: "bg-stone-100 text-stone-600 border-stone-300", label: "Completed", dot: "bg-stone-400" },
  };
  const cfg = sc[r.scheduleStatus] ?? sc.SCHEDULED;

  const depDate = new Date(r.departureTime);
  const arrDate = new Date(r.arrivalTime);
  const depTime = depDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const arrTime = arrDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const durationStr = calculateDuration(r.departureTime, r.arrivalTime);

  const originStop = r.stops[0]?.name || "Origin";
  const destinationStop = r.stops[r.stops.length - 1]?.name || "Destination";

  return (
    <div
      onClick={onDetail}
      className={`rounded-2xl border transition-all overflow-hidden cursor-pointer relative bg-white ${
        r.busUnavailable
          ? "border-amber-300 bg-amber-50/20 shadow-sm"
          : "border-[#E2DDD5] shadow-sm hover:border-[#D46B24] hover:shadow-md"
      }`}
    >
      {/* Top Ticket Header: Operator, Plate & Service Badge */}
      <div className="bg-[#FAF8F5] border-b border-[#E2DDD5] px-5 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {r.busPhotoUrl ? (
            <img
              src={r.busPhotoUrl}
              alt="Bus fleet"
              className="h-9 w-14 rounded-lg object-cover border border-[#E2DDD5] shrink-0"
            />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#163E32] text-amber-400 shrink-0">
              <BusIcon size={16} />
            </span>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-stone-900 text-sm">{r.routeName}</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-[#163E32] border border-emerald-200">
                {r.busType}
              </span>
            </div>
            <p className="text-[11px] text-stone-500 font-medium font-mono">
              {r.busPlateNumber} • {r.stops.length} Scheduled Stops
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {r.busUnavailable && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border bg-amber-100 border-amber-300 text-amber-900">
              <Wrench size={12} className="animate-spin-slow" /> In Maintenance
            </span>
          )}
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${cfg.bg}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot} ${isMoving ? "animate-pulse" : ""}`} />
            {cfg.label}
          </span>
        </div>
      </div>

      {/* Breakdown / Maintenance Alert Banner if vehicle was pulled */}
      {r.busUnavailable && (
        <div className="bg-amber-50 border-b border-amber-200 p-3.5 px-5 flex items-start gap-2.5">
          <AlertTriangle size={16} className="text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 font-medium">
            <span className="font-bold">Service Suspended: </span>
            {r.busUnavailabilityReason || "Bus pulled for maintenance. Ticket reservations are paused."}
          </div>
        </div>
      )}

      {/* Main Ticket Body: Departure ──── Corridor ──── Arrival */}
      <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
        {/* Route Corridor Timings */}
        <div className="sm:col-span-8 flex items-center justify-between gap-4">
          {/* Departure */}
          <div className="text-left min-w-[90px]">
            <p className="text-2xl font-black text-stone-900 tracking-tight">{depTime}</p>
            <p className="text-xs font-extrabold text-[#163E32] uppercase">{originStop}</p>
            <p className="text-[10px] text-stone-400 font-medium">Main Stand</p>
          </div>

          {/* Visual Corridor Line */}
          <div className="flex-1 flex flex-col items-center px-2">
            <div className="inline-flex items-center gap-1 text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
              <Clock size={11} className="text-[#D46B24]" />
              <span>{durationStr}</span>
            </div>
            <div className="w-full flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-[#163E32] shrink-0" />
              <div className="flex-1 h-0.5 bg-stone-300 relative">
                {/* Mid-point corridor tick */}
                <div className="absolute left-1/2 -top-1 -translate-x-1/2 h-2.5 w-2.5 rounded-full border border-stone-400 bg-white" />
              </div>
              <ArrowRight size={13} className="text-stone-400 shrink-0" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#D46B24] shrink-0" />
            </div>
            <span className="text-[10px] text-stone-400 font-medium mt-1">Intercity Express</span>
          </div>

          {/* Arrival */}
          <div className="text-right min-w-[90px]">
            <p className="text-2xl font-black text-stone-900 tracking-tight">{arrTime}</p>
            <p className="text-xs font-extrabold text-[#163E32] uppercase">{destinationStop}</p>
            <p className="text-[10px] text-stone-400 font-medium">Bus Terminal</p>
          </div>
        </div>

        {/* Fare & Seat Availability CTA */}
        <div
          className="sm:col-span-4 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-stone-200 pt-3 sm:pt-0 sm:pl-5 gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-left sm:text-right">
            <div className="flex items-center sm:justify-end gap-1.5">
              {r.busUnavailable ? (
                <span className="text-[11px] font-bold text-amber-700">Suspended</span>
              ) : (
                <span
                  className={`text-[11px] font-extrabold flex items-center gap-1 ${
                    r.availableSeats > 5
                      ? "text-emerald-700"
                      : r.availableSeats > 0
                      ? "text-[#D46B24]"
                      : "text-rose-600"
                  }`}
                >
                  <Users size={12} />
                  {r.availableSeats > 0 ? `${r.availableSeats} seats left` : "Sold Out"}
                </span>
              )}
            </div>
            <p className="text-xl font-black text-stone-900">
              Rs. 1,500 <span className="text-xs font-normal text-stone-500">/ seat</span>
            </p>
          </div>

          {/* Action CTAs */}
          <div className="w-full sm:w-auto">
            {r.busUnavailable ? (
              <div className="px-3.5 py-2 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs flex items-center justify-center gap-1.5 cursor-not-allowed">
                <Wrench size={13} /> Maintenance
              </div>
            ) : isStaffOrDriver ? (
              <span className="px-3 py-2 rounded-xl bg-stone-100 border border-stone-200 text-stone-500 font-bold text-xs text-center inline-block cursor-not-allowed">
                Staff Account
              </span>
            ) : (
              <>
                {!isMoving && r.availableSeats > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onBook();
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#163E32] hover:bg-[#1f5444] text-white font-extrabold text-xs shadow-md shadow-emerald-950/20 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    Select Seats →
                  </button>
                )}

                {isMoving && (
                  <button
                    onClick={onDetail}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition-colors"
                  >
                    <Navigation size={13} className="text-emerald-600 animate-pulse" /> Track Live GPS
                  </button>
                )}

                {!isMoving && r.availableSeats === 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onWaitingList();
                    }}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-stone-100 border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-200 transition-colors"
                  >
                    Join Waitlist
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Ticket Footer Perforation & Details Link */}
      <div className="bg-[#FAF8F5] border-t border-[#E2DDD5] px-5 py-2.5 flex items-center justify-between text-xs text-stone-500">
        <div className="flex items-center gap-3">
          <StarRating rating={r.averageRating} count={r.reviewCount} size={12} />
          <span className="hidden sm:inline-block text-stone-300">•</span>
          <span className="hidden sm:inline-block text-stone-600 font-medium">
            Driver: {r.driverName || "Designated Driver"}
          </span>
        </div>

        <button
          onClick={onDetail}
          className="text-[#D46B24] hover:text-[#b85b1c] font-bold text-[11px] flex items-center gap-1"
        >
          <Info size={13} /> View Timetable & Intermediate Stops
        </button>
      </div>
    </div>
  );
}

/**
 * ─── Bus Detail Modal ─────────────────────────────────────────────────────────
 *
 * Provides a comprehensive view of the bus service:
 * - Driver contact information for passenger assistance
 * - All intermediate stops with pickup / drop permissions
 * - Live GPS map when the vehicle is en route
 */
function BusDetailModal({
  schedule,
  isStaffOrDriver,
  onClose,
  onBook,
  isMoving,
}: {
  schedule: ScheduleSearchResult;
  isStaffOrDriver?: boolean;
  onClose: () => void;
  onBook: () => void;
  isMoving: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl animate-modal-in rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-[#E2DDD5]">
        {/* Header Photo & Identity */}
        <div className="relative h-44 bg-[#163E32] overflow-hidden shrink-0">
          <img
            src={schedule.busPhotoUrl || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80"}
            alt="Bus fleet"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f2c24] via-[#163E32]/70 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-stone-900/70 text-white hover:bg-[#D46B24] transition-colors"
          >
            <X size={16} />
          </button>

          <div className="absolute bottom-4 left-5 right-5 text-white">
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-400 text-stone-950 font-mono">
              {schedule.busPlateNumber}
            </span>
            <h3 className="text-xl font-extrabold text-white mt-1">{schedule.routeName}</h3>
            <p className="text-xs text-emerald-200 mt-0.5">{schedule.busType} Super Line Express</p>
          </div>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Maintenance Notice if vehicle is disabled */}
          {schedule.busUnavailable && (
            <div className="rounded-xl bg-amber-50 border border-amber-300 p-4 flex items-start gap-3">
              <AlertTriangle size={18} className="text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Wrench size={13} className="text-amber-700" />
                  Vehicle Under Maintenance
                </p>
                <p className="text-xs text-amber-800 mt-1 font-medium">
                  {schedule.busUnavailabilityReason || "Temporarily withdrawn from active fleet. Seat reservations suspended."}
                </p>
              </div>
            </div>
          )}

          {/* Assigned Conductor / Driver Contact Card */}
          {schedule.driverName && (
            <div className="rounded-xl bg-[#FAF8F5] border border-[#E2DDD5] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#163E32] flex items-center justify-center text-amber-400 font-extrabold text-base">
                  {schedule.driverName.charAt(0)}
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 uppercase font-extrabold tracking-wider">
                    Conductor / Driver in Charge
                  </p>
                  <p className="text-sm font-bold text-stone-900">{schedule.driverName}</p>
                </div>
              </div>
              {schedule.driverPhone && (
                <a
                  href={`tel:${schedule.driverPhone}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#163E32] text-xs font-bold text-emerald-100 hover:bg-[#1f5444] transition-colors"
                >
                  <Phone size={13} /> {schedule.driverPhone}
                </a>
              )}
            </div>
          )}

          {/* Intermediate Stops Timeline */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-stone-500 mb-2.5">
              Intermediate Route Stops & Boarding Rules
            </h4>
            <div className="space-y-2 bg-[#FAF8F5] p-4 rounded-xl border border-[#E2DDD5]">
              {schedule.stops.map((stop, i) => (
                <div key={stop.id} className="flex items-center justify-between text-xs py-1">
                  <span className="font-bold text-stone-800 flex items-center gap-2.5">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        i === 0
                          ? "bg-[#163E32]"
                          : i === schedule.stops.length - 1
                          ? "bg-[#D46B24]"
                          : "bg-stone-300"
                      }`}
                    />
                    {stop.name}
                  </span>
                  <span className="text-stone-500 font-medium text-[11px]">
                    {stop.pickupAllowed && stop.dropAllowed
                      ? "Boarding & Drop Allowed"
                      : stop.pickupAllowed
                      ? "Boarding Only"
                      : "Drop Off Only"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Live GPS Map Preview (en route) */}
          {isMoving && (
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#163E32] mb-2 flex items-center gap-1.5">
                <Navigation size={14} className="text-emerald-600 animate-pulse" /> Live Highway GPS Telemetry
              </h4>
              <TrackingMap scheduleId={schedule.scheduleId} />
            </div>
          )}

          {/* Footer CTAs */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-[#E2DDD5] py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Close Timetable
            </button>

            {schedule.busUnavailable ? (
              <div className="flex-1 rounded-xl bg-amber-100 border border-amber-300 py-2.5 text-xs font-bold text-amber-900 text-center flex items-center justify-center gap-1.5 cursor-not-allowed">
                <Wrench size={13} /> Service Suspended
              </div>
            ) : isStaffOrDriver ? (
              <div className="flex-1 rounded-xl bg-stone-100 border border-stone-200 py-2.5 text-xs font-bold text-stone-500 text-center">
                Staff Restricted
              </div>
            ) : (
              !isMoving && schedule.availableSeats > 0 && (
                <button
                  onClick={onBook}
                  className="flex-1 rounded-xl bg-[#163E32] hover:bg-[#1f5444] text-white font-extrabold text-xs shadow-md transition-colors"
                >
                  Proceed to Seat Selection →
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ─── Booking & Seat Selection Panel ───────────────────────────────────────────
 *
 * Realistic bus reservation panel:
 * - Pickup / drop terminal selectors with route sequence validation
 * - Realistic cabin SeatMap with driver on right side (Sri Lankan left-hand drive)
 * - Dynamic fare breakdown (LKR 1,500 base per seat)
 * - Advances to PaymentCheckout component
 */
function BookingPanel({
  schedule,
  onClose,
  onDone,
}: {
  schedule: ScheduleSearchResult;
  onClose: () => void;
  onDone: () => void;
}) {
  const pickupOptions = schedule.stops.filter((s) => s.pickupAllowed);
  const dropOptions = schedule.stops.filter((s) => s.dropAllowed);

  const [pickup, setPickup] = useState<StopDto | null>(pickupOptions[0] ?? null);
  const [drop, setDrop] = useState<StopDto | null>(dropOptions[dropOptions.length - 1] ?? null);
  const [selectedSeats, setSelectedSeats] = useState<SeatMapEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"select" | "holding" | "paying">("select");
  const [group, setGroup] = useState<BookingGroupResponse | null>(null);

  const FARE_PER_SEAT = 1500;
  const estimatedTotal = selectedSeats.length * FARE_PER_SEAT;

  function toggleSeat(seat: SeatMapEntry) {
    setSelectedSeats((prev) =>
      prev.some((s) => s.seatId === seat.seatId)
        ? prev.filter((s) => s.seatId !== seat.seatId)
        : prev.length >= 6
        ? prev
        : [...prev, seat]
    );
  }

  async function handleContinueToPayment() {
    setError(null);
    if (!pickup || !drop || selectedSeats.length === 0) {
      setError("Please choose a pickup stop, drop stop, and at least one seat.");
      return;
    }
    try {
      setStep("holding");
      const result = await BookingApi.create({
        scheduleId: schedule.scheduleId,
        seatIds: selectedSeats.map((s) => s.seatId),
        pickupStopId: pickup.id,
        dropStopId: drop.id,
        travelDate: new Date().toISOString().slice(0, 10),
      });
      setGroup(result);
      setStep("paying");
    } catch (err: any) {
      setError(err.message || "Could not reserve selected seats. Another passenger may have held them.");
      setStep("select");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg animate-modal-in rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[94vh] flex flex-col border border-[#E2DDD5]">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-[#0f2c24] px-6 py-4 bg-[#163E32] text-white shrink-0">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300">
              {step === "paying" ? "Payment Step 2 of 2" : "Seat Selection Step 1 of 2"}
            </span>
            <h3 className="text-base font-extrabold text-white">
              {step === "paying" ? "Secure Checkout" : "Select Cabin Seats"}
            </h3>
            <p className="text-xs text-emerald-100/80">{schedule.routeName} ({schedule.busPlateNumber})</p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-full bg-[#0f2c24] text-emerald-200 hover:text-white hover:bg-[#D46B24] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {step !== "paying" && (
          <div className="p-6 space-y-5 overflow-y-auto">
            {/* Pickup / Drop Selectors */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-extrabold text-stone-500 uppercase tracking-wider mb-1">
                  Pickup Terminal
                </label>
                <select
                  className="w-full rounded-xl border border-[#E2DDD5] px-3 py-2 text-xs font-bold text-stone-900 bg-stone-50 focus:border-[#163E32] focus:outline-none"
                  value={pickup?.id}
                  onChange={(e) => setPickup(schedule.stops.find((s) => s.id === Number(e.target.value)) ?? null)}
                >
                  {pickupOptions.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-stone-500 uppercase tracking-wider mb-1">
                  Drop Terminal
                </label>
                <select
                  className="w-full rounded-xl border border-[#E2DDD5] px-3 py-2 text-xs font-bold text-stone-900 bg-stone-50 focus:border-[#163E32] focus:outline-none"
                  value={drop?.id}
                  onChange={(e) => setDrop(schedule.stops.find((s) => s.id === Number(e.target.value)) ?? null)}
                >
                  {dropOptions.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Seat Map Cabin (Driver on Right Side) */}
            <SeatMap
              scheduleId={schedule.scheduleId}
              selectedSeatIds={selectedSeats.map((s) => s.seatId)}
              onToggle={toggleSeat}
              maxSeats={6}
            />

            {/* Persistent Selected Seat Summary Panel */}
            {selectedSeats.length > 0 && (
              <div className="rounded-xl bg-[#FAF8F5] border border-[#E2DDD5] p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider">
                    {selectedSeats.length} Seat{selectedSeats.length > 1 ? "s" : ""} Selected (Max 6)
                  </p>
                  <p className="text-sm font-extrabold text-[#163E32]">
                    Seats: {selectedSeats.map((s) => s.seatNumber).join(", ")}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-stone-400 font-bold uppercase">Estimated Total</span>
                  <p className="text-xl font-black text-[#D46B24]">
                    Rs. {estimatedTotal.toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-xl">
                {error}
              </p>
            )}

            {/* Dialog Footer Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleContinueToPayment}
                disabled={step === "holding" || selectedSeats.length === 0}
                className="px-6 py-2.5 bg-[#163E32] hover:bg-[#1f5444] text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {step === "holding" ? "Holding Seats..." : "Confirm & Proceed to Checkout →"}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Payment Checkout */}
        {step === "paying" && group && (
          <div className="p-6 overflow-y-auto">
            <PaymentCheckout
              groupRef={group.groupRef}
              totalFare={group.totalFare}
              seatCount={group.bookings.length}
              holdExpiresAt={group.holdExpiresAt}
              onSuccess={onDone}
              onCancel={() => setStep("select")}
            />
          </div>
        )}
      </div>
    </div>
  );
}
