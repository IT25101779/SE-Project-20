import { useEffect, useState } from "react";
import { BookingApi, ReviewApi } from "../api/client";
import TrackingMap from "../components/TrackingMap";
import StarRating from "../components/StarRating";
import toast from "react-hot-toast";
import { Ticket, Radar, X } from "lucide-react";

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

export default function MyBookings() {
  const [bookings, setBookings] = useState<BookingRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [trackingScheduleId, setTrackingScheduleId] = useState<number | null>(null);
  const [reviewBooking, setReviewBooking] = useState<BookingRow | null>(null);
  const [reviewedBookingIds, setReviewedBookingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    BookingApi.mine()
      .then((data) => setBookings(data as BookingRow[]))
      .catch((err) => setError(err.message));
  }, []);

  async function handleCancel(id: number) {
    try {
      await BookingApi.cancel(id);
      setBookings((prev) => prev?.map((b) => (b.id === id ? { ...b, status: "CANCELLED" } : b)) ?? null);
      toast.success("Booking cancelled.");
    } catch (err: any) {
      setError(err.message);
    }
  }

  function toggleTracking(scheduleId: number) {
    setTrackingScheduleId((prev) => (prev === scheduleId ? null : scheduleId));
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-6 space-y-3">
        {bookings?.length === 0 && <p className="text-slate-500">No bookings yet - go search for a trip!</p>}
        {bookings?.map((b) => (
          <div key={b.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 bg-slate-900 px-4 py-2.5 text-white">
              <Ticket size={16} className="text-amber-400" />
              <span className="font-mono text-xs">{b.ticketReference}</span>
              <span className="ml-auto"><StatusBadge status={b.status} /></span>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{b.schedule?.route?.name}</p>
                  <p className="text-sm text-slate-500">
                    Seat {b.seat?.seatNumber} · {b.pickupStop?.name} → {b.dropStop?.name}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleTracking(b.schedule.id)}
                      className="flex items-center gap-1 rounded bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-700"
                    >
                      <Radar size={12} /> {trackingScheduleId === b.schedule.id ? "Hide map" : "Track bus"}
                    </button>
                    {b.status !== "CANCELLED" && (
                      <button
                        onClick={() => handleCancel(b.id)}
                        className="flex items-center gap-1 rounded border border-red-300 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        <X size={12} /> Cancel
                      </button>
                    )}
                  </div>
                  {b.status === "CONFIRMED" && !reviewedBookingIds.has(b.id) && (
                    <button
                      onClick={() => setReviewBooking(b)}
                      className="text-xs font-medium text-amber-600 hover:underline"
                    >
                      Rate this trip
                    </button>
                  )}
                </div>
              </div>

              {trackingScheduleId === b.schedule?.id && (
                <div className="mt-3">
                  <TrackingMap scheduleId={b.schedule.id} mine />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

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
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await ReviewApi.submit(booking.id, rating, comment);
      toast.success("Thanks for the feedback!");
      onSubmitted();
    } catch (err: any) {
      // handled by global toast interceptor
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-slate-900">Rate your trip</h2>
        <p className="text-sm text-slate-500">{booking.schedule?.route?.name}</p>

        <div className="mt-4">
          <StarRating rating={rating} size={28} interactive onChange={setRating} />
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Any comments? (optional)"
          rows={3}
          className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit review"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    CONFIRMED: "bg-emerald-100 text-emerald-700",
    PENDING: "bg-amber-100 text-amber-700",
    CANCELLED: "bg-slate-200 text-slate-600",
    EXPIRED: "bg-red-100 text-red-700",
    WAITLISTED: "bg-blue-100 text-blue-700",
  };
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-medium ${colors[status] ?? "bg-slate-100"}`}>
      {status}
    </span>
  );
}
