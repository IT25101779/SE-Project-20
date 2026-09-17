import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Navigation, Clock, MapPinned, Radio } from "lucide-react";
import { TrackingApi, type GpsPositionDto } from "../api/client";

// Bundlers break Leaflet's default marker icon path resolution - point it
// at the CDN copies instead of trying to fix Vite's asset handling for it.
const busIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const passengerIcon = L.divIcon({
  className: "",
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#2563eb;border:2px solid white;box-shadow:0 0 0 2px #2563eb55;"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

/**
 * Live bus tracking. Position comes from the backend's continuously
 * time-interpolated calculation (not stop-to-stop jumps), and is smoothly
 * animated between polls here on the client too. `mine=true` shows
 * ETA/distance to the CALLING PASSENGER's own pickup stop (via
 * /api/tracking/{id}/mine) instead of the route's terminus, and adds the
 * passenger's own live location (browser geolocation) so they can see how
 * far the bus physically is from where they're standing right now.
 */
export default function TrackingMap({ scheduleId, mine = false }: { scheduleId: number; mine?: boolean }) {
  const [position, setPosition] = useState<GpsPositionDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    function fetchPosition() {
      const call = mine ? TrackingApi.getMyPosition(scheduleId) : TrackingApi.getPosition(scheduleId);
      call
        .then((data) => {
          if (!cancelled) {
            setPosition(data);
            setError(null);
          }
        })
        .catch((err) => {
          if (!cancelled) setError(err.message);
        });
    }

    fetchPosition();
    // Faster than the old 5s: the backend now interpolates continuously,
    // so more frequent polling actually shows smoother movement.
    intervalRef.current = window.setInterval(fetchPosition, 3000);

    return () => {
      cancelled = true;
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [scheduleId, mine]);

  // Passenger's own live location, for "how far is the bus from me right now".
  useEffect(() => {
    if (!mine || !navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setMyLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setMyLocation(null),
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [mine]);

  const smoothed = useSmoothedLatLng(position ? [position.latitude, position.longitude] : null, 2800);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!position || !smoothed) return <p className="text-sm text-slate-400">Waiting for live position...</p>;

  const isLive = position.scheduleStatus === "IN_TRIP" || position.scheduleStatus === "DELAYED";
  const distanceToMeKm = myLocation ? haversineKm(myLocation.lat, myLocation.lng, position.latitude, position.longitude) : null;

  return (
    <div className="animate-fade-slide-up space-y-3">
      {/* Status header */}
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={position.scheduleStatus} />
        {isLive && (
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
            <span className="animate-live-pulse h-2 w-2 rounded-full bg-emerald-500" />
            Live
          </span>
        )}
      </div>

      {position.scheduleStatus === "SCHEDULED" && position.minutesToDeparture !== null && (
        <InfoCard icon={<Clock size={16} />} label="Departs in" value={formatMinutes(position.minutesToDeparture)} tone="amber" />
      )}

      <div className="h-64 w-full overflow-hidden rounded-lg border border-slate-200">
        <MapContainer center={[smoothed[0], smoothed[1]]} zoom={11} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[smoothed[0], smoothed[1]]} icon={busIcon}>
            <Popup>
              {mine ? `ETA to ${position.targetStopName}` : "ETA to arrival"}: {position.etaToTargetStop ?? position.etaToArrival ?? "—"}
            </Popup>
          </Marker>
          {myLocation && (
            <Marker position={[myLocation.lat, myLocation.lng]} icon={passengerIcon}>
              <Popup>You are here</Popup>
            </Marker>
          )}
          <Recenter lat={smoothed[0]} lng={smoothed[1]} />
        </MapContainer>
      </div>

      {/* ETA / distance to the relevant stop (passenger's pickup stop if `mine`, else the terminus) */}
      <div className="grid grid-cols-2 gap-2">
        <InfoCard
          icon={<Navigation size={16} />}
          label={position.targetStopAlreadyPassed ? `Passed ${position.targetStopName}` : `ETA to ${mine ? "your stop" : position.targetStopName}`}
          value={position.targetStopAlreadyPassed ? "—" : position.etaToTargetStop ?? "—"}
          tone={position.targetStopAlreadyPassed ? "slate" : "emerald"}
        />
        <InfoCard
          icon={<MapPinned size={16} />}
          label={`Distance to ${mine ? "your stop" : position.targetStopName}`}
          value={`${position.distanceToTargetStopKm.toFixed(1)} km`}
          tone="slate"
        />
      </div>

      {mine && (
        <InfoCard
          icon={<Radio size={16} />}
          label="Distance from you to the bus"
          value={distanceToMeKm !== null ? `${distanceToMeKm.toFixed(1)} km` : "Enable location access"}
          tone="blue"
        />
      )}

      {position.scheduleStatus !== "SCHEDULED" && position.scheduleStatus !== "COMPLETED" && (
        <p className="text-xs text-slate-400">
          {position.distanceRemainingKm.toFixed(1)} km remaining to final stop · updates every 3s
        </p>
      )}
      {position.scheduleStatus === "COMPLETED" && (
        <p className="text-sm text-slate-500">This trip has arrived at its final stop.</p>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: GpsPositionDto["scheduleStatus"] }) {
  const styles: Record<string, string> = {
    SCHEDULED: "bg-slate-100 text-slate-600",
    IN_TRIP: "bg-emerald-100 text-emerald-700",
    DELAYED: "bg-amber-100 text-amber-700",
    CANCELLED: "bg-red-100 text-red-700",
    COMPLETED: "bg-slate-100 text-slate-500",
  };
  const labels: Record<string, string> = {
    SCHEDULED: "Not yet departed",
    IN_TRIP: "In transit",
    DELAYED: "Delayed",
    CANCELLED: "Cancelled",
    COMPLETED: "Completed",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles[status] ?? "bg-slate-100 text-slate-600"}`}>
      {labels[status] ?? status}
    </span>
  );
}

function InfoCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "emerald" | "amber" | "slate" | "blue";
}) {
  const toneStyles: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    slate: "bg-slate-50 text-slate-600",
    blue: "bg-blue-50 text-blue-700",
  };
  return (
    <div className={`rounded-xl px-3 py-2.5 ${toneStyles[tone]}`}>
      <div className="flex items-center gap-1.5 text-xs opacity-80">
        {icon}
        {label}
      </div>
      <p className="mt-0.5 text-lg font-bold">{value}</p>
    </div>
  );
}

function formatMinutes(totalMinutes: number): string {
  if (totalMinutes <= 0) return "Departing now";
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Smoothly animates the marker between successive API positions instead of
 * jumping instantly on each poll - genuine client-side interpolation via
 * requestAnimationFrame, timed to roughly match the poll interval.
 */
function useSmoothedLatLng(target: [number, number] | null, durationMs: number): [number, number] | null {
  const [display, setDisplay] = useState<[number, number] | null>(target);
  const fromRef = useRef<[number, number] | null>(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!target) return;
    const from = fromRef.current ?? target;
    const start = performance.now();

    function step(now: number) {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      const lat = from![0] + (target![0] - from![0]) * eased;
      const lng = from![1] + (target![1] - from![1]) * eased;
      setDisplay([lat, lng]);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = target;
      }
    }

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target?.[0], target?.[1]]);

  return display;
}
