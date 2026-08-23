/**
 * SeatMap Component
 * -----------------
 * Renders an interactive visual coach interior layout for seat selection.
 * 
 * Architectural & UX Design:
 * - Visually resembles a real Sri Lankan intercity bus cabin (steering wheel
 *   on the right side as Sri Lanka drives on the left; passenger door on the left).
 * - Organized in a standard 2x2 layout with a central walking aisle, and a
 *   5-seat rear bench on row 13.
 * - Manages multi-seat selection (up to maxSeats, typically 6) with real-time feedback.
 * - Distinct, accessible state colors for Available, Selected, and Occupied seats.
 */

import { useEffect, useState } from "react";
import { Check, ShieldAlert } from "lucide-react";
import { ScheduleApi, type SeatMapEntry } from "../api/client";

interface SeatMapProps {
  scheduleId: number;
  selectedSeatIds: number[];
  onToggle: (seat: SeatMapEntry) => void;
  maxSeats?: number;
}

export default function SeatMap({
  scheduleId,
  selectedSeatIds,
  onToggle,
  maxSeats = 6,
}: SeatMapProps) {
  // State for fetched seat entries and error handling
  const [seats, setSeats] = useState<SeatMapEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Loads the current live seat occupancy map for this schedule.
   * Runs whenever scheduleId changes.
   */
  useEffect(() => {
    setSeats(null);
    setError(null);
    ScheduleApi.seatMap(scheduleId)
      .then((data) => setSeats(data))
      .catch((err) => setError(err.message || "Failed to load seat map."));
  }, [scheduleId]);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 flex items-center gap-2">
        <ShieldAlert size={16} />
        <span>{error}</span>
      </div>
    );
  }

  if (!seats) {
    return (
      <div className="flex flex-col items-center justify-center h-48 rounded-xl border border-[#E2DDD5] bg-[#FAF8F5]">
        <div className="h-6 w-6 border-2 border-[#163E32] border-t-transparent rounded-full animate-spin mb-2" />
        <p className="text-xs font-bold text-stone-500">Loading coach seating layout...</p>
      </div>
    );
  }

  // Group seats by row number and check if maximum selection limit is reached
  const rows = groupSeatsByRow(seats);
  const isAtSelectionLimit = selectedSeatIds.length >= maxSeats;

  return (
    <div className="rounded-xl border border-[#D5CFBE] bg-white overflow-hidden shadow-2xs">
      {/* Front Windshield & Driver Cabin Section */}
      <div className="bg-[#163E32] text-white px-4 py-3 border-b border-[#0F2E25]">
        <div className="flex items-center justify-between text-xs">
          {/* Passenger Boarding Entrance (Left side of bus in SL) */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0F2E25] text-stone-300 font-mono text-[10px]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>FRONT ENTRANCE</span>
          </div>

          {/* Windshield Indicator */}
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
            Coach Windshield
          </span>

          {/* Driver Cabin (Right side of bus in SL) */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0F2E25] text-amber-400 font-mono text-[10px] font-bold">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="3" />
              <line x1="12" y1="3" x2="12" y2="9" />
              <line x1="3" y1="12" x2="9" y2="12" />
              <line x1="15" y1="12" x2="21" y2="12" />
            </svg>
            <span>DRIVER CABIN</span>
          </div>
        </div>
      </div>

      {/* Aisle & Window Orientation Labels */}
      <div className="flex border-b border-[#EAE5DC] bg-[#FAF8F5] px-4 py-1.5 text-[9.5px] font-bold text-stone-500 uppercase tracking-wider">
        <span className="flex-1 text-left">Window / Aisle</span>
        <span className="w-10 text-center text-stone-400 font-mono">AISLE</span>
        <span className="flex-1 text-right">Aisle / Window</span>
      </div>

      {/* Main Bus Seating Grid Area */}
      <div className="p-4 space-y-2 max-h-80 overflow-y-auto bg-[#FBF9F5]">
        {rows.map(([rowNumber, rowSeats]) => {
          const isRearBench = rowNumber === 13;
          // In standard 2x2 layout, columns 1 and 2 are on the left; 3 and 4 are on the right
          const leftSeats = isRearBench
            ? rowSeats.filter((s) => s.columnNumber <= 3)
            : rowSeats.filter((s) => s.columnNumber <= 2);
          const rightSeats = isRearBench
            ? rowSeats.filter((s) => s.columnNumber > 3)
            : rowSeats.filter((s) => s.columnNumber > 2);

          return (
            <div
              key={rowNumber}
              className={`flex items-center gap-2 ${
                isRearBench ? "border-t border-[#D5CFBE] pt-2 mt-2" : ""
              }`}
            >
              {/* Row Number Marker */}
              <span className="w-4 shrink-0 text-center font-mono text-[10px] font-bold text-stone-400">
                {rowNumber}
              </span>

              {/* Left Side Seats (Columns 1 & 2) */}
              <div className="flex gap-2">
                {leftSeats.map((seat) => (
                  <SeatButton
                    key={seat.seatId}
                    seat={seat}
                    isSelected={selectedSeatIds.includes(seat.seatId)}
                    isLimited={isAtSelectionLimit && !selectedSeatIds.includes(seat.seatId)}
                    onToggle={onToggle}
                  />
                ))}
              </div>

              {/* Walking Center Aisle */}
              <div className="w-10 shrink-0 flex items-center justify-center">
                <div className="h-full w-px border-r border-dashed border-[#D5CFBE]" />
              </div>

              {/* Right Side Seats (Columns 3 & 4) */}
              <div className="flex gap-2 justify-end flex-1">
                {rightSeats.map((seat) => (
                  <SeatButton
                    key={seat.seatId}
                    seat={seat}
                    isSelected={selectedSeatIds.includes(seat.seatId)}
                    isLimited={isAtSelectionLimit && !selectedSeatIds.includes(seat.seatId)}
                    onToggle={onToggle}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend & Selection Counter Footer */}
      <div className="border-t border-[#EAE5DC] bg-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <LegendItem swatch="bg-white border border-[#163E32] text-[#163E32]" label="Available" />
          <LegendItem swatch="bg-[#D46B24] border border-[#D46B24] text-white" label="Selected" />
          <LegendItem swatch="bg-[#E5E0D6] border border-[#D5CFBE] text-stone-400" label="Occupied" />
        </div>

        <div className="font-bold text-stone-800 text-xs">
          <span>{selectedSeatIds.length} of {maxSeats} seats selected</span>
        </div>
      </div>
    </div>
  );
}

/**
 * SeatButton Component
 * -------------------
 * Individual physical seat button with authentic coach styling.
 * Displays seat number and checkmark when selected.
 */
function SeatButton({
  seat,
  isSelected,
  isLimited,
  onToggle,
}: {
  seat: SeatMapEntry;
  isSelected: boolean;
  isLimited: boolean;
  onToggle: (s: SeatMapEntry) => void;
}) {
  const isBlocked = seat.occupied || isLimited;

  // Visual styling calculation based on occupancy state
  let styleClasses = "h-8 w-8 rounded-md text-[10px] font-bold shrink-0 transition-all flex flex-col items-center justify-center relative";

  if (seat.occupied) {
    // Occupied seat: stone gray, disabled cursor
    styleClasses += " bg-[#E5E0D6] border border-[#D5CFBE] text-stone-400 cursor-not-allowed";
  } else if (isSelected) {
    // Selected seat: warm amber with subtle pop animation
    styleClasses += " bg-[#D46B24] border border-[#B85718] text-white shadow-2xs scale-105 animate-seat-pop cursor-pointer";
  } else if (isLimited) {
    // Selection limit reached: subdued
    styleClasses += " bg-stone-100 border border-stone-200 text-stone-400 cursor-not-allowed";
  } else {
    // Available seat: clean off-white with deep green accent
    styleClasses += " bg-white border border-[#163E32] text-[#163E32] hover:bg-[#E8F0EC] hover:scale-105 cursor-pointer shadow-2xs";
  }

  return (
    <button
      type="button"
      disabled={isBlocked}
      onClick={() => onToggle(seat)}
      title={`Seat ${seat.seatNumber}${seat.occupied ? " (Occupied / Held)" : ""}`}
      className={styleClasses}
      aria-label={`Seat ${seat.seatNumber} ${seat.occupied ? 'Occupied' : isSelected ? 'Selected' : 'Available'}`}
    >
      {/* Subtle top cushion bar to resemble a real bus seat backrest */}
      <span className={`block w-5 h-1 rounded-full mb-0.5 ${isSelected ? 'bg-white/40' : 'bg-stone-300'}`} />
      
      {isSelected ? (
        <Check size={12} strokeWidth={3} />
      ) : (
        <span>{seat.seatNumber}</span>
      )}
    </button>
  );
}

/**
 * LegendItem Component
 * -------------------
 * Helper for the seat status legend display.
 */
function LegendItem({ swatch, label }: { swatch: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-stone-600 font-medium">
      <span className={`h-3.5 w-3.5 rounded ${swatch}`} />
      <span>{label}</span>
    </div>
  );
}

/**
 * groupSeatsByRow Utility
 * -----------------------
 * Reorganizes the flat SeatMapEntry array into rows sorted sequentially,
 * and sorts columns within each row from left to right.
 */
function groupSeatsByRow(seats: SeatMapEntry[]): [number, SeatMapEntry[]][] {
  const rowMap = new Map<number, SeatMapEntry[]>();
  for (const s of seats) {
    const rowList = rowMap.get(s.rowNumber) ?? [];
    rowList.push(s);
    rowMap.set(s.rowNumber, rowList);
  }
  return Array.from(rowMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([row, list]) => [row, list.sort((a, b) => a.columnNumber - b.columnNumber)]);
}
