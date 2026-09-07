import { useEffect, useState } from "react";
import { BookingApi, ReviewApi } from "../api/client";
import TrackingMap from "../components/TrackingMap";
import PassengerPageBackground from "../components/PassengerPageBackground";
import toast from "react-hot-toast";
import { Ticket, Navigation, X, QrCode, MapPin, ArrowRight, Calendar, AlertCircle } from "lucide-react";

interface BookingRow {
  id: number;
  status: string;
  ticketReference: string;
  travelDate: string;
  seat: { seatNumber: string };
  pickupStop: { name: string };
  dropStop: { name: string };
  schedule: { id: number; route: { id: number; name: string } };
}

/**
 * My Bookings Page (Passenger Boarding Passes & Trip History)
 *
 * Implements an editorial Sri Lankan physical bus ticket layout:
 * - Perforated ticket stubs with route corridor details and QR verification code.
 * - Live GPS tracking toggle to track buses en route in real time.
 * - Star rating modal for passengers to rate ride quality and driver punctuality.
 * - Ticket cancellation workflow with instant feedback.
 */
export default function MyBookings() {
  const [bookings, setBookings] = useState<BookingRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [trackingScheduleId, setTrackingScheduleId] = useState<number | null>(null);
  const [reviewBooking, setReviewBooking] = useState<BookingRow | null>(null);
  const [reviewedBookingIds, setReviewedBookingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    BookingApi.mine()
      .then((data) => setBookings(data as BookingRow[]))
      .catch((err) => setError(err.message || "Failed to retrieve your bookings."));
  }, []);

  async function handleCancel(id: number) {
    if (!confirm("Are you sure you want to cancel this ticket reservation?")) return;
    try {
      await BookingApi.cancel(id);
      setBookings((prev) => prev?.map((b) => (b.id === id ? { ...b, status: "CANCELLED" } : b)) ?? null);
      toast.success("Ticket reservation cancelled successfully.");
    } catch (err: any) {
      setError(err.message || "Failed to cancel ticket.");
    }
  }

  function toggleTracking(scheduleId: number) {
    setTrackingScheduleId((prev) => (prev === scheduleId ? null : scheduleId));
  }

  return (
    <div className="min-h-screen bg-[#F8F6F0] py-10 text-stone-900 relative overflow-hidden">
      {/* Subtle Digital Ticket & Boarding Pass Watermark */}
      <PassengerPageBackground variant="bookings" opacity={0.20} />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-6 relative z-10">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2DDD5] shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-[#D46B24] mb-1">
              <span>මගී ප්‍රවේශ පත්‍ර</span>
              <span>•</span>
              <span>Passenger Pass Management</span>
            </div>
            <h1 className="text-2xl font-black text-[#163E32] tracking-tight">
              My Bus Boarding Passes & Tickets
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              View your confirmed digital e-tickets, track buses with live highway GPS, or review completed journeys.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#FAF8F5] border border-[#E2DDD5] px-3.5 py-2 rounded-xl">
            <Ticket size={18} className="text-[#163E32]" />
            <span className="text-xs font-black text-stone-800">
              {bookings?.length || 0} Ticket{bookings?.length === 1 ? "" : "s"} Issued
            </span>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-amber-50 border border-amber-300 p-4 text-xs font-bold text-amber-900 flex items-center gap-2.5">
            <AlertCircle size={16} className="text-[#D46B24] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Empty State */}
        {bookings?.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#E2DDD5] p-8 shadow-sm max-w-md mx-auto">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-[#FAF8F5] border border-[#E2DDD5] flex items-center justify-center text-stone-400 mb-4">
              <Ticket size={32} />
            </div>
            <h3 className="text-stone-900 text-base font-extrabold">No Ticket Reservations Found</h3>
            <p className="text-stone-500 text-xs mt-1.5 leading-relaxed">
              You do not have any active or past bus reservations yet. Search our national express network to book your next trip.
            </p>
          </div>
        )}

        {/* Bookings List as Perforated Travel Tickets */}
        <div className="space-y-5">
          {bookings?.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl border border-[#E2DDD5] bg-white shadow-sm overflow-hidden hover:border-[#D46B24] transition-colors relative"
            >
              {/* Ticket Top Perforation Bar */}
              <div className="bg-[#163E32] px-6 py-3 flex flex-wrap items-center justify-between text-white border-b border-[#0f2c24] gap-2">
                <div className="flex items-center gap-3">
                  <span className="h-6 w-6 rounded-md bg-[#0f2c24] flex items-center justify-center text-amber-300">
                    <Ticket size={14} />
                  </span>
                  <div>
                    <span className="text-[10px] text-emerald-200 uppercase font-bold tracking-wider mr-2">E-Ticket Ref</span>
                    <span className="font-mono text-xs font-extrabold text-amber-200 tracking-wider">
                      {b.ticketReference || `MAG-${b.id}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-emerald-100 font-medium">
                    <Calendar size={13} className="text-amber-300" /> {b.travelDate}
                  </span>
                  <StatusBadge status={b.status} />
                </div>
              </div>

              {/* Main Boarding Pass Layout */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                  {/* Route & Stop Corridor */}
                  <div className="sm:col-span-8 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-stone-900">
                        {b.schedule?.route?.name || "Intercity Express Line"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-stone-700 bg-[#FAF8F5] p-3 rounded-xl border border-[#E2DDD5]">
                      <span className="flex items-center gap-1.5 text-[#163E32] font-extrabold">
                        <MapPin size={14} className="text-[#163E32]" />
                        <span>Boarding: {b.pickupStop?.name || "Main Stand"}</span>
                      </span>
                      <ArrowRight size={13} className="text-stone-400" />
                      <span className="flex items-center gap-1.5 text-[#D46B24] font-extrabold">
                        <MapPin size={14} className="text-[#D46B24]" />
                        <span>Drop: {b.dropStop?.name || "Destination"}</span>
                      </span>
                    </div>
                  </div>

                  {/* Seat Number & Digital QR Code */}
                  <div className="sm:col-span-4 flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 sm:border-l border-stone-200 pt-3 sm:pt-0 sm:pl-5">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 block">
                        Reserved Cabin Seat
                      </span>
                      <p className="text-2xl font-black text-[#163E32]">
                        Seat {b.seat?.seatNumber || "Std"}
                      </p>
                      <span className="text-[10px] text-stone-500 font-medium block">Sri Lanka Highway Super Line</span>
                    </div>

                    <div className="h-16 w-16 rounded-xl bg-white border border-stone-300 p-1.5 flex items-center justify-center text-[#163E32] shadow-sm shrink-0">
                      <QrCode size={44} />
                    </div>
                  </div>
                </div>

                {/* Ticket Controls & Actions Bar */}
                <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => toggleTracking(b.schedule.id)}
                    className="flex items-center gap-1.5 rounded-xl bg-[#163E32] hover:bg-[#1f5444] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all active:scale-95"
                  >
                    <Navigation size={13} className="text-emerald-300 animate-pulse" />
                    {trackingScheduleId === b.schedule.id ? "Close Live Map" : "Track Bus Live GPS"}
                  </button>

                  <div className="flex items-center gap-2">
                    {b.status === "CONFIRMED" && !reviewedBookingIds.has(b.id) && (
                      <button
                        onClick={() => setReviewBooking(b)}
                        className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-extrabold hover:bg-amber-100 transition-colors"
                      >
                        Rate Journey
                      </button>
                    )}

                    {b.status !== "CANCELLED" && (
                      <button
                        onClick={() => handleCancel(b.id)}
                        className="flex items-center gap-1 rounded-xl border border-rose-300 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 transition-colors"
                      >
                        <X size={13} /> Cancel Ticket
                      </button>
                    )}
                  </div>
                </div>

                {/* Collapsible Live GPS Highway Tracking Map */}
                {trackingScheduleId === b.schedule?.id && (
                  <div className="mt-3 pt-3 border-t border-stone-200 animate-fade-slide-up">
                    <p className="text-[11px] font-extrabold text-[#163E32] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Navigation size={13} className="text-emerald-600" /> Real-time Satellite Telemetry
                    </p>
                    <TrackingMap scheduleId={b.schedule.id} mine />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Review Modal */}
      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onSubmitted={() => {
            setReviewedBookingIds((prev) => new Set(prev).add(reviewBooking.id));
            setReviewBooking(null);
          }}
        />
      )}
    </div>
  );
}

/**
 * Ticket Status Badge with contextual Sri Lankan transport color coding.
 */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; label: string }> = {
    CONFIRMED: { bg: "bg-emerald-100 text-emerald-900 border-emerald-300", label: "Confirmed Pass" },
    PENDING_PAYMENT: { bg: "bg-amber-100 text-amber-900 border-amber-300", label: "Pending Payment" },
    CANCELLED: { bg: "bg-rose-100 text-rose-800 border-rose-200", label: "Cancelled" },
    COMPLETED: { bg: "bg-stone-200 text-stone-700 border-stone-300", label: "Trip Completed" },
  };
  const cfg = map[status] ?? { bg: "bg-stone-100 text-stone-700 border-stone-300", label: status };

  return (
    <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold uppercase tracking-wider ${cfg.bg}`}>
      {cfg.label}
    </span>
  );
}

/**
 * Modal to submit verified passenger feedback after a completed ride.
 */
function ReviewModal({
  booking,
  onClose,
  onSubmitted,
}: {
  booking: BookingRow;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await ReviewApi.submit(booking.id, rating, comments);
      toast.success("Thank you! Your passenger review was submitted.");
      onSubmitted();
    } catch (err: any) {
      setError(err.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md animate-modal-in rounded-2xl bg-white p-6 shadow-2xl space-y-4 border border-[#E2DDD5]">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-[#163E32]">Rate Your Bus Journey</h3>
            <p className="text-[11px] text-stone-500">{booking.schedule?.route?.name}</p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-2">Service Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                    rating >= star
                      ? "bg-amber-400 text-stone-950 shadow-sm"
                      : "bg-stone-100 text-stone-400 hover:bg-stone-200"
                  }`}
                >
                  ★ {star}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Passenger Feedback</label>
            <textarea
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Tell us about the bus cleanliness, AC comfort, and driver punctuality..."
              className="w-full rounded-xl border border-[#E2DDD5] bg-[#FAF8F5] p-3 text-xs text-stone-900 focus:border-[#163E32] focus:bg-white focus:outline-none"
            />
          </div>

          {error && <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2.5 rounded-xl">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl bg-[#163E32] hover:bg-[#1f5444] text-white font-extrabold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {submitting ? "Submitting Rating..." : "Submit Verified Review →"}
          </button>
        </form>
      </div>
    </div>
  );
}
