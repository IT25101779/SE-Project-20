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
import toast from "react-hot-toast";
import {
  MapPin, Bus as BusIcon, ArrowRight, Users, X,
  Phone, Shield, Clock, ChevronDown, Star, Info, Navigation
} from "lucide-react";

const SRI_LANKA_CITIES = [
  "Colombo", "Kandy", "Galle", "Jaffna", "Ella",
  "Nuwara Eliya", "Anuradhapura", "Matara", "Negombo",
  "Trincomalee", "Batticaloa", "Ratnapura", "Kurunegala",
  "Kadawatha", "Kegalle", "Kalutara", "Ambalangoda",
  "Bandarawela", "Badulla",
];

function todayLocalDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export default function Search() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [origin, setOrigin] = useState(searchParams.get("origin") || "Colombo");
  const [destination, setDestination] = useState(searchParams.get("destination") || "Kandy");
  const [date, setDate] = useState(todayLocalDateString);
  const [results, setResults] = useState<ScheduleSearchResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<ScheduleSearchResult | null>(null);
  const [detailBus, setDetailBus] = useState<ScheduleSearchResult | null>(null);

  useEffect(() => {
    const o = searchParams.get("origin");
    const d = searchParams.get("destination");
    if (o && d) doSearch(o, d, todayLocalDateString());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function doSearch(o: string, d: string, dt: string) {
    setError(null); setLoading(true); setSelected(null);
    try {
      const data = await ScheduleApi.search(o, d, `${dt}T00:00:00`);
      setResults(data);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    doSearch(origin, destination, date);
  }

  async function handleJoinWaitingList(scheduleId: number) {
    if (!user) { navigate("/login"); return; }
    try {
      await BookingApi.joinWaitingList(scheduleId);
      toast.success("Added to the waiting list â€” you'll be notified if a seat opens up.");
    } catch (_) {}
  }

  const isMoving = (r: ScheduleSearchResult) =>
    r.scheduleStatus === "IN_TRIP" || r.scheduleStatus === "DELAYED";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero search bar */}
      <div className="bg-slate-900 pt-10 pb-14">
        <div className="mx-auto max-w-5xl px-4">
          <h1 className="text-3xl font-bold text-white mb-1">Find Your Bus</h1>
          <p className="text-slate-400 mb-8 text-sm">Search routes across Sri Lanka, compare schedules, and book your seat instantly.</p>

          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 gap-3 rounded-2xl bg-white/5 border border-white/10 p-4 sm:grid-cols-4 backdrop-blur-sm"
          >
            {/* Origin dropdown */}
            <div className="relative">
              <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 z-10" />
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full pl-9 pr-8 py-3 rounded-xl bg-white/10 border border-white/10 text-white text-sm appearance-none focus:outline-none focus:border-amber-400 focus:bg-white/15 transition-all"
              >
                <option value="" className="text-slate-900">From city...</option>
                {SRI_LANKA_CITIES.map((c) => (
                  <option key={c} value={c} className="text-slate-900">{c}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Destination dropdown */}
            <div className="relative">
              <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 z-10" />
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full pl-9 pr-8 py-3 rounded-xl bg-white/10 border border-white/10 text-white text-sm appearance-none focus:outline-none focus:border-amber-400 focus:bg-white/15 transition-all"
              >
                <option value="" className="text-slate-900">To city...</option>
                {SRI_LANKA_CITIES.filter((c) => c !== origin).map((c) => (
                  <option key={c} value={c} className="text-slate-900">{c}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400 transition-all"
            />

            <button
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-4 py-3 font-bold text-slate-900 hover:from-amber-400 hover:to-amber-300 disabled:opacity-50 transition-all shadow-lg shadow-amber-500/20 text-sm"
            >
              {loading ? "Searching..." : "Search Buses"}
            </button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-5xl px-4 py-8 -mt-4">
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {results === null && !loading && (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <BusIcon size={32} className="text-slate-300" />
            </div>
            <p className="text-slate-500 text-lg font-medium">Ready to search</p>
            <p className="text-slate-400 mt-1 text-sm">Select your origin, destination and date above.</p>
          </div>
        )}

        {results?.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <BusIcon size={32} className="text-slate-300" />
            </div>
            <p className="text-slate-600 text-lg font-semibold">No trips found</p>
            <p className="text-slate-400 mt-1 text-sm">Try a different date or route.</p>
          </div>
        )}

        {results && results.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm font-semibold text-slate-700">
                {results.length} trip{results.length > 1 ? "s" : ""} found
              </p>
              <p className="text-xs text-slate-400">{origin} â†’ {destination} Â. {date}</p>
            </div>
            <div className="space-y-4">
              {results.map((r) => (
                <BusCard
                  key={r.scheduleId}
                  r={r}
                  onBook={() => { if (!user) { navigate("/login"); return; } setSelected(r); }}
                  onWaitingList={() => handleJoinWaitingList(r.scheduleId)}
                  onDetail={() => setDetailBus(r)}
                  isMoving={isMoving(r)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {detailBus && (
        <BusDetailModal
          schedule={detailBus}
          onClose={() => setDetailBus(null)}
          onBook={() => {
            setDetailBus(null);
            if (!user) { navigate("/login"); return; }
            setSelected(detailBus);
          }}
          isMoving={isMoving(detailBus)}
        />
      )}

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

// â”€â”€â”€ Bus Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function BusCard({ r, onBook, onWaitingList, onDetail, isMoving }: {
  r: ScheduleSearchResult; onBook: () => void; onWaitingList: () => void;
  onDetail: () => void; isMoving: boolean;
}) {
  const sc: Record<string, { bg: string; label: string }> = {
    SCHEDULED: { bg: "bg-blue-100 text-blue-700", label: "Scheduled" },
    IN_TRIP:   { bg: "bg-emerald-100 text-emerald-700", label: "On the way" },
    DELAYED:   { bg: "bg-amber-100 text-amber-700", label: "Delayed" },
    CANCELLED: { bg: "bg-red-100 text-red-700", label: "Cancelled" },
    COMPLETED: { bg: "bg-slate-100 text-slate-500", label: "Completed" },
  };
  const cfg = sc[r.scheduleStatus] ?? sc.SCHEDULED;

  return (
    <div
      className="group rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-xl hover:border-amber-200 transition-all duration-300 overflow-hidden cursor-pointer"
      onClick={onDetail}
    >
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-[220px]">
            <div className="flex items-center gap-3">
              {r.busPhotoUrl ? (
                <img src={r.busPhotoUrl} alt="Bus" className="h-14 w-20 rounded-xl object-cover border border-slate-100 shrink-0" />
              ) : (
                <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-900 text-amber-400 shrink-0">
                  <BusIcon size={24} />
                </span>
              )}
              <div>
                <p className="font-bold text-slate-900 text-lg leading-tight">{r.routeName}</p>
                <div className="flex items-center flex-wrap gap-2 mt-1">
                  <span className="text-sm text-slate-500">{r.busPlateNumber} Â. {r.busType}</span>
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${cfg.bg}`}>
                    {isMoving && <span className="h-1.5 w-1.5 rounded-full bg-current animate-live-pulse" />}
                    {cfg.label}
                  </span>
                </div>
                {r.driverName && <p className="text-xs text-slate-400 mt-1">Driver: {r.driverName}</p>}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div className="text-center">
                <p className="text-xl font-black text-slate-900 tabular-nums">
                  {new Date(r.departureTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{r.stops[0]?.name}</p>
              </div>
              <div className="flex-1 flex items-center gap-1 px-1">
                <div className="h-2.5 w-2.5 rounded-full bg-amber-400 shrink-0" />
                <div className="flex-1 h-px bg-gradient-to-r from-amber-400 to-emerald-400" />
                <ArrowRight size={12} className="text-slate-400 shrink-0" />
                <div className="flex-1 h-px bg-gradient-to-r from-amber-400 to-emerald-400" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shrink-0" />
              </div>
              <div className="text-center">
                <p className="text-xl font-black text-slate-900 tabular-nums">
                  {new Date(r.arrivalTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{r.stops[r.stops.length - 1]?.name}</p>
              </div>
            </div>

            <div className="mt-3">
              <StarRating rating={r.averageRating} count={r.reviewCount} size={13} />
            </div>
          </div>

          <div className="text-right shrink-0 flex flex-col items-end gap-2" onClick={(e) => e.stopPropagation()}>
            <div>
              <p className={`flex items-center justify-end gap-1.5 text-sm font-bold ${r.availableSeats > 0 ? "text-emerald-600" : "text-red-500"}`}>
                <Users size={14} />
                {r.availableSeats > 0 ? `${r.availableSeats} seats left` : "Sold out"}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">of 54 seats</p>
            </div>

            <button onClick={onDetail}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              <Info size={11} /> View Details
            </button>

            {!isMoving && r.availableSeats > 0 && (
              <button onClick={(e) => { e.stopPropagation(); onBook(); }}
                className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-5 py-2 text-sm font-bold text-slate-900 hover:from-amber-400 hover:to-amber-300 transition-all shadow-md shadow-amber-500/20 w-full">
                Select Seat â†’
              </button>
            )}
            {isMoving && (
              <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 w-full justify-center">
                <Navigation size={12} /> Track Live
              </div>
            )}
            {!isMoving && r.availableSeats === 0 && (
              <button onClick={(e) => { e.stopPropagation(); onWaitingList(); }}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors w-full">
                Join Waitlist
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-slate-100 bg-slate-50 px-5 py-2 flex items-center gap-1.5 text-xs text-slate-400 group-hover:text-amber-600 transition-colors">
        <Info size={11} />
        Click to see driver info, bus photos, route stops and live position
      </div>
    </div>
  );
}

// â”€â”€â”€ Bus Detail Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function BusDetailModal({ schedule, onClose, onBook, isMoving }: {
  schedule: ScheduleSearchResult; onClose: () => void; onBook: () => void; isMoving: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl animate-modal-in rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="relative h-56 overflow-hidden rounded-t-2xl shrink-0">
          <img
            src={schedule.busPhotoUrl || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80"}
            alt="Bus" className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <button onClick={onClose}
            className="absolute top-4 right-4 h-9 w-9 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors">
            <X size={18} />
          </button>
          <div className="absolute bottom-4 left-5 right-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-white text-xl font-bold">{schedule.routeName}</p>
                <p className="text-slate-300 text-sm mt-0.5">{schedule.busPlateNumber} Â. {schedule.busType} Â. 54 seats</p>
              </div>
              <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold ${isMoving ? "bg-emerald-500 text-white" : "bg-amber-500 text-slate-900"}`}>
                {isMoving ? "On the way" : "Scheduled"}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <InfoPill icon={<Clock size={14} className="text-amber-500" />} label="Departure"
              value={new Date(schedule.departureTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} />
            <InfoPill icon={<Clock size={14} className="text-emerald-500" />} label="Arrival"
              value={new Date(schedule.arrivalTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} />
            <InfoPill icon={<Users size={14} className="text-blue-500" />} label="Available Seats"
              value={`${schedule.availableSeats} of 54`} />
            <InfoPill icon={<Star size={14} className="text-yellow-500" />} label="Rating"
              value={schedule.averageRating > 0 ? `${schedule.averageRating.toFixed(1)} â˜… (${schedule.reviewCount})` : "No reviews yet"} />
          </div>

          {schedule.driverName && (
            <div className="rounded-2xl bg-slate-900 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Your Driver</p>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-900 text-3xl font-black shrink-0">
                  {schedule.driverName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-xl truncate">{schedule.driverName}</p>
                  <div className="mt-2 flex flex-wrap gap-4">
                    {schedule.driverPhone && (
                      <a href={`tel:${schedule.driverPhone}`} className="flex items-center gap-1.5 text-sm text-amber-400 hover:text-amber-300">
                        <Phone size={14} /> {schedule.driverPhone}
                      </a>
                    )}
                    {schedule.licenseNumber && (
                      <span className="flex items-center gap-1.5 text-sm text-slate-400">
                        <Shield size={14} /> {schedule.licenseNumber}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Route Stops</p>
            <div className="rounded-xl border border-slate-100 bg-slate-50 divide-y divide-slate-100">
              {schedule.stops.map((stop, i) => (
                <div key={stop.id} className="flex items-center gap-3 px-4 py-3">
                  <div className={`h-3 w-3 rounded-full border-2 shrink-0 ${
                    i === 0 ? "bg-amber-400 border-amber-500" :
                    i === schedule.stops.length - 1 ? "bg-emerald-400 border-emerald-500" :
                    "bg-white border-slate-300"
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">{stop.name}</p>
                    <p className="text-xs text-slate-400">
                      {stop.pickupAllowed && stop.dropAllowed ? "Pickup & Drop" :
                       stop.pickupAllowed ? "Pickup only" : "Drop only"}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    i === 0 ? "bg-amber-100 text-amber-700" :
                    i === schedule.stops.length - 1 ? "bg-emerald-100 text-emerald-700" :
                    "bg-slate-100 text-slate-500"
                  }`}>
                    {i === 0 ? "Origin" : i === schedule.stops.length - 1 ? "Destination" : `Stop ${i}`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {isMoving && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Live Bus Position</p>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-live-pulse" /> Live
                </span>
              </div>
              <div className="rounded-xl overflow-hidden border border-slate-200">
                <TrackingMap scheduleId={schedule.scheduleId} />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              Close
            </button>
            {!isMoving && schedule.availableSeats > 0 && (
              <button onClick={onBook}
                className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-4 py-3 text-sm font-bold text-slate-900 hover:from-amber-400 hover:to-amber-300 transition-all shadow-lg shadow-amber-500/20">
                Book Now â†’
              </button>
            )}
            {isMoving && (
              <div className="flex-1 rounded-xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-500 text-center">
                Booking closed â€” bus is en route
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-bold text-slate-900 truncate">{value}</p>
      </div>
    </div>
  );
}

// â”€â”€â”€ Booking Panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function BookingPanel({ schedule, onClose, onDone }: {
  schedule: ScheduleSearchResult; onClose: () => void; onDone: () => void;
}) {
  const pickupOptions = schedule.stops.filter((s) => s.pickupAllowed);
  const dropOptions   = schedule.stops.filter((s) => s.dropAllowed);
  const [pickup, setPickup] = useState<StopDto | null>(pickupOptions[0] ?? null);
  const [drop, setDrop]     = useState<StopDto | null>(dropOptions[dropOptions.length - 1] ?? null);
  const [selectedSeats, setSelectedSeats] = useState<SeatMapEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep]   = useState<"select" | "holding" | "paying">("select");
  const [group, setGroup] = useState<BookingGroupResponse | null>(null);

  const FARE_PER_SEAT   = 1500;
  const estimatedTotal  = selectedSeats.length * FARE_PER_SEAT;

  function toggleSeat(seat: SeatMapEntry) {
    setSelectedSeats((prev) =>
      prev.some((s) => s.seatId === seat.seatId)
        ? prev.filter((s) => s.seatId !== seat.seatId)
        : prev.length >= 6 ? prev : [...prev, seat]
    );
  }

  async function handleContinueToPayment() {
    setError(null);
    if (!pickup || !drop || selectedSeats.length === 0) {
      setError("Please choose a pickup point, drop point, and at least one seat.");
      return;
    }
    try {
      setStep("holding");
      const result = await BookingApi.create({
        scheduleId: schedule.scheduleId,
        seatIds: selectedSeats.map((s) => s.seatId),
        pickupStopId: pickup.id, dropStopId: drop.id,
        travelDate: new Date().toISOString().slice(0, 10),
      });
      setGroup(result);
      setStep("paying");
    } catch (err: any) { setError(err.message); setStep("select"); }
  }

  const stepIndex = step === "select" || step === "holding" ? 0 : 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg animate-modal-in rounded-2xl bg-white shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {step === "paying" ? "Complete Payment" : "Choose Your Seat"}
            </h2>
            <p className="text-sm text-slate-400">{schedule.routeName}</p>
          </div>
          <button onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 pt-4">
          <div className="flex items-center gap-2">
            {["Seats", "Payment"].map((s, i) => (
              <div key={s} className="flex flex-1 items-center gap-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  i <= stepIndex ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"
                }`}>{i + 1}</div>
                <span className={`text-sm font-medium ${i <= stepIndex ? "text-slate-900" : "text-slate-400"}`}>{s}</span>
                {i < 1 && <div className={`flex-1 h-0.5 transition-colors ${i < stepIndex ? "bg-slate-900" : "bg-slate-100"}`} />}
              </div>
            ))}
          </div>
        </div>

        {step !== "paying" && (
          <div className="p-6 animate-fade-slide-up">
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  <MapPin size={11} className="inline mr-1 text-amber-500" />Pickup Point
                </label>
                <select className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400"
                  value={pickup?.id}
                  onChange={(e) => setPickup(schedule.stops.find((s) => s.id === Number(e.target.value)) ?? null)}>
                  {pickupOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  <MapPin size={11} className="inline mr-1 text-emerald-500" />Drop Point
                </label>
                <select className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400"
                  value={drop?.id}
                  onChange={(e) => setDrop(schedule.stops.find((s) => s.id === Number(e.target.value)) ?? null)}>
                  {dropOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            <label className="block text-xs font-semibold text-slate-500 mb-2">
              Choose up to 6 seats <span className="font-normal text-slate-400">(group travel)</span>
            </label>
            <SeatMap scheduleId={schedule.scheduleId} selectedSeatIds={selectedSeats.map((s) => s.seatId)}
              onToggle={toggleSeat} maxSeats={6} />

            {selectedSeats.length > 0 && (
              <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3">
                <span className="text-sm text-slate-300">
                  {selectedSeats.length} seat{selectedSeats.length > 1 ? "s" : ""}:
                  {" "}{selectedSeats.map((s) => s.seatNumber).join(", ")}
                </span>
                <span className="text-lg font-bold text-amber-400">LKR {estimatedTotal.toLocaleString()}</span>
              </div>
            )}

            {error && (
              <p className="mt-3 text-sm text-red-600 rounded-xl bg-red-50 border border-red-100 px-3 py-2">{error}</p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button onClick={onClose} className="rounded-xl px-5 py-2.5 text-sm text-slate-600 hover:bg-slate-100 transition-colors">
                Cancel
              </button>
              <button onClick={handleContinueToPayment}
                disabled={step === "holding" || selectedSeats.length === 0}
                className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-6 py-2.5 text-sm font-bold text-slate-900 hover:from-amber-400 hover:to-amber-300 disabled:opacity-50 transition-all shadow-md">
                {step === "holding" ? "Holding seats..." : "Continue to Payment â†’"}
              </button>
            </div>
          </div>
        )}

        {step === "paying" && group && (
          <PaymentCheckout
            groupRef={group.groupRef} totalFare={group.totalFare}
            seatCount={group.bookings.length} holdExpiresAt={group.holdExpiresAt}
            onSuccess={onDone} onCancel={() => setStep("select")}
          />
        )}
      </div>
    </div>
  );
}
