import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { ScheduleApi, type SeatMapEntry } from "../api/client";



export default function SeatMap({
  scheduleId, selectedSeatIds, onToggle, maxSeats = 6,
}: {
  scheduleId: number;
  selectedSeatIds: number[];
  onToggle: (seat: SeatMapEntry) => void;
  maxSeats?: number;
}) {
  const [seats, setSeats] = useState<SeatMapEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSeats(null);
    ScheduleApi.seatMap(scheduleId).then(setSeats).catch((err) => setError(err.message));
  }, [scheduleId]);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!seats) return (
    <div className="flex items-center justify-center h-28 rounded-xl bg-slate-50 border border-slate-100">
      <p className="text-sm text-slate-400 animate-pulse">Loading seat map...</p>
    </div>
  );

  const rows = groupByRow(seats);
  const atLimit = selectedSeatIds.length >= maxSeats;

  return (
    <div className="rounded-xl border-2 border-slate-200 bg-slate-50 overflow-hidden">
      <div className="bg-slate-900 py-2 flex items-center justify-center gap-2">
        <span>🚌</span>

        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Driver / Front</span>
      </div>
      <div className="flex border-b border-slate-200 bg-white px-4 py-1.5">
        <span className="text-[9px] font-bold uppercase text-blue-500 flex-1">Left Side</span>
        <span className="w-8" />
        <span className="text-[9px] font-bold uppercase text-emerald-500 flex-1 text-right">Right Side</span>
      </div>

      <div className="p-3 space-y-1.5 max-h-64 overflow-y-auto">
        {rows.map(([rowNumber, rowSeats]) => {
          const isLastRow = rowNumber === 13;
          const leftSeats  = isLastRow ? rowSeats.filter((s) => s.columnNumber <= 3) : rowSeats.filter((s) => s.columnNumber <= 2);
          const rightSeats = isLastRow ? rowSeats.filter((s) => s.columnNumber > 3)  : rowSeats.filter((s) => s.columnNumber > 2);
          return (
            <div key={rowNumber} className={"flex items-center gap-1" + (isLastRow ? " border-t-2 border-dashed border-slate-300 pt-2" : "")}>
              <span className="w-6 shrink-0 text-center text-[9px] font-bold text-slate-400">{rowNumber}</span>
              <div className="flex gap-1">
                {leftSeats.map((seat) => (
                  <SeatBtn key={seat.seatId} seat={seat}
                    order={selectedSeatIds.indexOf(seat.seatId)}
                    limited={atLimit && !selectedSeatIds.includes(seat.seatId)}
                    onToggle={onToggle} side="left" />
                ))}
              </div>
              <div className="w-6 shrink-0" />
              <div className="flex gap-1">
                {rightSeats.map((seat) => (
                  <SeatBtn key={seat.seatId} seat={seat}
                    order={selectedSeatIds.indexOf(seat.seatId)}
                    limited={atLimit && !selectedSeatIds.includes(seat.seatId)}
                    onToggle={onToggle} side="right" />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="border-t border-slate-200 bg-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Leg swatch="border-2 border-blue-400 bg-blue-50" label="Left" />
          <Leg swatch="border-2 border-emerald-400 bg-emerald-50" label="Right" />
          <Leg swatch="bg-slate-900" label="Selected" />
          <Leg swatch="bg-slate-100 border border-slate-200" label="Occupied" />
        </div>
        <p className="text-xs text-slate-500">{selectedSeatIds.length}/{maxSeats} selected</p>
      </div>
    </div>
  );
}

function SeatBtn({ seat, order, limited, onToggle, side }: {
  seat: SeatMapEntry; order: number; limited: boolean;
  onToggle: (s: SeatMapEntry) => void; side: "left" | "right";
}) {
  const sel = order >= 0;
  const dis = seat.occupied || limited;
  const base = "h-9 w-9 rounded-lg text-[10px] font-bold shrink-0 transition-all duration-150 border-2 flex items-center justify-center";
  const cls = seat.occupied ? "cursor-not-allowed border-slate-100 bg-slate-100 text-slate-300"
    : sel ? "border-slate-900 bg-slate-900 text-white shadow-md"
    : limited ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300"
    : side === "left" ? "border-blue-300 bg-blue-50 text-blue-700 hover:scale-105 hover:border-blue-500 cursor-pointer"
    : "border-emerald-300 bg-emerald-50 text-emerald-700 hover:scale-105 hover:border-emerald-500 cursor-pointer";
  return (
    <button type="button" disabled={dis} onClick={() => onToggle(seat)} className={base + " " + cls}>
      {sel ? (
        <span className="flex items-center gap-0.5">
          <Check size={9} />
          <span className="text-[9px] font-black">{order + 1}</span>
        </span>
      ) : (
        <span>{seat.seatNumber.replace(/^\d+/, "")}</span>
      )}
    </button>
  );
}

function Leg({ swatch, label }: { swatch: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-500">
      <span className={"h-3.5 w-3.5 rounded-md " + swatch} />
      {label}
    </div>
  );
}

function groupByRow(seats: SeatMapEntry[]): [number, SeatMapEntry[]][] {
  const m = new Map<number, SeatMapEntry[]>();
  for (const s of seats) {
    const b = m.get(s.rowNumber) ?? [];
    b.push(s);
    m.set(s.rowNumber, b);
  }
  return Array.from(m.entries())
    .sort(([a], [b]) => a - b)
    .map(([r, rs]) => [r, rs.sort((a, b) => a.columnNumber - b.columnNumber)] as [number, SeatMapEntry[]]);
}
